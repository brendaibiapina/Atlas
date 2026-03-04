import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminEmail } from '@/lib/admin';
import { dispatchAlertEmail } from '@/lib/alert-notifier';

type NormaPayload = {
    title: string;
    source_type: string;
    publication_date: string;
    summary: string;
    status: string;
    tags?: string[];
    full_text_url?: string;
};

type ObligationPayload = {
    title: string;
    description: string;
    reference_title?: string;
    source_title?: string;
    source_url?: string;
    audience?: string[];
    compliance_status: string;
    start_date?: string | null;
    penalty_grace_period_end?: string | null;
};

const DEFAULT_OBLIGATION_SOURCE_URL = 'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586';
const DEFAULT_OBLIGATION_SOURCE_TITLE = 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025';

function isAuditTestTitle(title: string | null | undefined): boolean {
    const normalized = (title ?? '').trim().toUpperCase();
    return normalized.startsWith('ZZ_AUDIT') || normalized.startsWith('ZZ_TEST');
}

function createRouteClient() {
    const cookieStore = cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value, ...options });
                    } catch {
                        // no-op for environments where cookie mutation is not available
                    }
                },
                remove(name: string, options: CookieOptions) {
                    try {
                        cookieStore.set({ name, value: '', ...options });
                    } catch {
                        // no-op for environments where cookie mutation is not available
                    }
                },
            },
        }
    );
}

function validateDate(value: string | null | undefined): boolean {
    if (!value) return false;
    return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

async function requireAdmin() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: NextResponse.json({ error: 'Supabase não configurado no servidor' }, { status: 500 }) };
    }

    const supabase = createRouteClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
    }

    if (!isAdminEmail(data.user.email)) {
        return { error: NextResponse.json({ error: 'Acesso negado' }, { status: 403 }) };
    }

    return { supabase };
}

export async function GET() {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { supabase } = auth;

    const [normasRes, obligationsRes] = await Promise.all([
        supabase.from('legal_references').select('*').order('created_at', { ascending: false }),
        supabase.from('obligations').select('*').order('created_at', { ascending: false }),
    ]);

    if (normasRes.error || obligationsRes.error) {
        const message = normasRes.error?.message || obligationsRes.error?.message || 'Erro ao carregar registros';
        return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({
        normas: (normasRes.data ?? []).filter((item: any) => !isAuditTestTitle(item.title)),
        obligations: (obligationsRes.data ?? []).filter((item: any) => !isAuditTestTitle(item.title)),
    });
}

export async function POST(request: NextRequest) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { supabase } = auth;
    const body = await request.json();

    if (body?.type === 'NORMA') {
        const payload = body.payload as NormaPayload;
        if (!payload?.title || !payload?.source_type || !payload?.summary || !payload?.status || !validateDate(payload.publication_date)) {
            return NextResponse.json({ error: 'Payload de norma inválido' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('legal_references')
            .insert([
                {
                    title: payload.title.trim(),
                    source_type: payload.source_type,
                    publication_date: payload.publication_date,
                    summary: payload.summary.trim(),
                    status: payload.status,
                    tags: (payload.tags ?? []).filter(Boolean),
                    full_text_url: payload.full_text_url?.trim() || null,
                },
            ])
            .select('title, summary, source_type, full_text_url')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const alerts = await dispatchAlertEmail({
            type: 'ATUALIZACAO',
            title: data?.title ?? payload.title.trim(),
            summary: data?.summary ?? payload.summary.trim(),
            sourceLabel: data?.source_type ?? payload.source_type,
            sourceUrl: data?.full_text_url ?? payload.full_text_url?.trim() ?? null,
            dashboardUrl: `${request.nextUrl.origin}/dashboard/radar`,
        });

        return NextResponse.json({ success: true, alerts });
    }

    if (body?.type === 'OBRIGACAO') {
        const payload = body.payload as ObligationPayload;
        if (!payload?.title || !payload?.description || !payload?.compliance_status) {
            return NextResponse.json({ error: 'Payload de obrigação inválido' }, { status: 400 });
        }

        const startDate =
            payload.start_date && validateDate(payload.start_date)
                ? payload.start_date
                : null;

        const penaltyDate =
            payload.penalty_grace_period_end && validateDate(payload.penalty_grace_period_end)
                ? payload.penalty_grace_period_end
                : null;

        const { data, error } = await supabase
            .from('obligations')
            .insert([
                {
                    title: payload.title.trim(),
                    description: payload.description.trim(),
                    reference_title: payload.reference_title?.trim() || DEFAULT_OBLIGATION_SOURCE_TITLE,
                    source_title: payload.source_title?.trim() || DEFAULT_OBLIGATION_SOURCE_TITLE,
                    source_url: payload.source_url?.trim() || DEFAULT_OBLIGATION_SOURCE_URL,
                    audience: (payload.audience ?? []).filter(Boolean),
                    compliance_status: payload.compliance_status,
                    start_date: startDate,
                    penalty_grace_period_end: penaltyDate,
                },
            ])
            .select('title, description, reference_title, source_title, source_url')
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const alerts = await dispatchAlertEmail({
            type: 'OBRIGACAO',
            title: data?.title ?? payload.title.trim(),
            summary: data?.description ?? payload.description.trim(),
            sourceLabel: 'ATLAS',
            sourceUrl: data?.source_url ?? payload.source_url?.trim() ?? DEFAULT_OBLIGATION_SOURCE_URL,
            dashboardUrl: `${request.nextUrl.origin}/dashboard/obrigacoes`,
            referenceTitle: data?.reference_title ?? payload.reference_title?.trim() ?? DEFAULT_OBLIGATION_SOURCE_TITLE,
        });

        return NextResponse.json({ success: true, alerts });
    }

    return NextResponse.json({ error: 'Tipo de operação inválido' }, { status: 400 });
}

export async function DELETE(request: NextRequest) {
    const auth = await requireAdmin();
    if ('error' in auth) return auth.error;

    const { supabase } = auth;
    const body = await request.json();
    const table = body?.table as string | undefined;
    const id = body?.id as string | undefined;

    if (!table || !id) {
        return NextResponse.json({ error: 'Parâmetros inválidos' }, { status: 400 });
    }

    if (table !== 'legal_references' && table !== 'obligations') {
        return NextResponse.json({ error: 'Tabela não permitida' }, { status: 400 });
    }

    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
