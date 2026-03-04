import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import type { FavoriteItemType } from '@/lib/types';

type FavoritePayload = {
    item_type: FavoriteItemType;
    item_id: string;
    title: string;
    summary?: string;
    status?: string;
    source_label?: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
};

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

function isMissingFavoritesTable(error: any): boolean {
    const message = String(error?.message || '').toLowerCase();
    return message.includes('favorites') && (message.includes('does not exist') || message.includes('relation'));
}

async function requireUser() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return { error: NextResponse.json({ error: 'Supabase não configurado no servidor' }, { status: 500 }) };
    }

    const supabase = createRouteClient();
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
        return { error: NextResponse.json({ error: 'Não autenticado' }, { status: 401 }) };
    }

    return { supabase, user: data.user };
}

function normalizeFavoriteType(raw: string | null): FavoriteItemType | null {
    if (!raw) return null;
    if (raw === 'OBRIGACAO' || raw === 'ATUALIZACAO') return raw;
    return null;
}

export async function GET(request: NextRequest) {
    const auth = await requireUser();
    if ('error' in auth) return auth.error;

    const { supabase, user } = auth;
    const itemType = normalizeFavoriteType(request.nextUrl.searchParams.get('item_type'));

    let query = supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (itemType) {
        query = query.eq('item_type', itemType);
    }

    const { data, error } = await query;

    if (error) {
        if (isMissingFavoritesTable(error)) {
            return NextResponse.json({ favorites: [], warning: 'FAVORITES_TABLE_MISSING' });
        }

        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: data || [] });
}

export async function POST(request: NextRequest) {
    const auth = await requireUser();
    if ('error' in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();
    const payload = body as FavoritePayload;

    const favoriteType = normalizeFavoriteType(payload?.item_type || null);

    if (!favoriteType || !payload?.item_id || !payload?.title?.trim()) {
        return NextResponse.json({ error: 'Payload de favorito inválido' }, { status: 400 });
    }

    const { data: existing, error: existingError } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('item_type', favoriteType)
        .eq('item_id', payload.item_id)
        .maybeSingle();

    if (existingError && existingError.code !== 'PGRST116') {
        if (isMissingFavoritesTable(existingError)) {
            return NextResponse.json({ error: 'FAVORITES_TABLE_MISSING' }, { status: 503 });
        }
        return NextResponse.json({ error: existingError.message }, { status: 500 });
    }

    if (existing?.id) {
        const { error: deleteError } = await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id)
            .eq('user_id', user.id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ saved: false, id: existing.id });
    }

    const { data: inserted, error: insertError } = await supabase
        .from('favorites')
        .insert([
            {
                user_id: user.id,
                item_type: favoriteType,
                item_id: payload.item_id,
                title: payload.title.trim(),
                summary: payload.summary?.trim() || null,
                status: payload.status?.trim() || null,
                source_label: payload.source_label?.trim() || null,
                source_url: payload.source_url?.trim() || null,
                tags: (payload.tags || []).filter(Boolean),
                metadata: payload.metadata || {},
            },
        ])
        .select('*')
        .single();

    if (insertError) {
        if (isMissingFavoritesTable(insertError)) {
            return NextResponse.json({ error: 'FAVORITES_TABLE_MISSING' }, { status: 503 });
        }
        return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ saved: true, favorite: inserted });
}

export async function DELETE(request: NextRequest) {
    const auth = await requireUser();
    if ('error' in auth) return auth.error;

    const { supabase, user } = auth;
    const body = await request.json();

    const id = typeof body?.id === 'string' ? body.id : null;
    const itemType = normalizeFavoriteType(body?.item_type || null);
    const itemId = typeof body?.item_id === 'string' ? body.item_id : null;

    let query = supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id);

    if (id) {
        query = query.eq('id', id);
    } else if (itemType && itemId) {
        query = query.eq('item_type', itemType).eq('item_id', itemId);
    } else {
        return NextResponse.json({ error: 'Parâmetros inválidos para exclusão' }, { status: 400 });
    }

    const { error } = await query;

    if (error) {
        if (isMissingFavoritesTable(error)) {
            return NextResponse.json({ error: 'FAVORITES_TABLE_MISSING' }, { status: 503 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
