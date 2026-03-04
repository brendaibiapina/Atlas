import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Obligation } from '@/lib/types';

export const DEFAULT_OBLIGATION_START_DATE = '2026-01-01';
export const DEFAULT_OBLIGATION_SOURCE_URL = 'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586';
export const DEFAULT_OBLIGATION_SOURCE_TITLE = 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025';

function isAuditTestTitle(title: string | null | undefined): boolean {
    const normalized = (title ?? '').trim().toUpperCase();
    return normalized.startsWith('ZZ_AUDIT') || normalized.startsWith('ZZ_TEST');
}

function normalizeReferenceTitle(referenceTitle: string | null | undefined): string {
    const raw = (referenceTitle ?? '').trim();
    const normalized = raw.toLowerCase();

    if (!raw) return DEFAULT_OBLIGATION_SOURCE_TITLE;

    const isLegacyLc214 = normalized.includes('lei complementar') && normalized.includes('214/2025');
    if (isLegacyLc214) return DEFAULT_OBLIGATION_SOURCE_TITLE;

    return raw;
}

function shouldUseDefaultStartDate(status: string | null | undefined): boolean {
    return status !== 'FUTURO' && status !== 'EM_CONSTRUCAO';
}

// Fallback com dados reais das Orientações 2026 da RFB
const MOCK_OBLIGATIONS: Obligation[] = [
    {
        id: '1',
        title: 'Emitir NFe com destaque de CBS e IBS',
        description: 'Nota Fiscal Eletrônica deve incluir CBS e IBS a partir de 01/01/2026. Contribuinte dispensado do recolhimento em 2026 (ano de teste).',
        reference_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        audience: ['CONTADOR'],
        compliance_status: 'EDUCATIVO',
        start_date: DEFAULT_OBLIGATION_START_DATE,
        source_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        source_url: DEFAULT_OBLIGATION_SOURCE_URL,
        penalty_grace_period_end: '2026-12-31'
    },
    {
        id: '2',
        title: 'Emitir NFSe com destaque de CBS e IBS',
        description: 'NFSe deve incluir campos de CBS e IBS. Aplica-se a todos os prestadores de serviços.',
        reference_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        audience: ['CONTADOR', 'ADVOGADO'],
        compliance_status: 'EDUCATIVO',
        start_date: DEFAULT_OBLIGATION_START_DATE,
        source_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        source_url: DEFAULT_OBLIGATION_SOURCE_URL,
        penalty_grace_period_end: '2026-12-31'
    },
    {
        id: '3',
        title: 'Adesão ao DTE (Domicílio Tributário Eletrônico)',
        description: 'A inscrição no DTE torna-se automática e obrigatória a partir de 2026. Todas as comunicações da RFB serão eletrônicas.',
        reference_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        audience: ['CONTADOR', 'ADVOGADO', 'IMOBILIARIO'],
        compliance_status: 'VIGENTE',
        start_date: DEFAULT_OBLIGATION_START_DATE,
        source_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        source_url: DEFAULT_OBLIGATION_SOURCE_URL,
        penalty_grace_period_end: undefined
    },
    {
        id: '4',
        title: 'Adaptar sistemas para NF ABI (Alienação de Bens Imóveis)',
        description: 'Nova obrigação com leiaute definido. Data de vigência será determinada em documento técnico. Afeta o setor imobiliário.',
        reference_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        audience: ['IMOBILIARIO', 'CONTADOR'],
        compliance_status: 'EM_CONSTRUCAO',
        start_date: undefined,
        source_title: DEFAULT_OBLIGATION_SOURCE_TITLE,
        source_url: DEFAULT_OBLIGATION_SOURCE_URL,
        penalty_grace_period_end: undefined
    }
];

export async function getObligations(): Promise<Obligation[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase!
            .from('obligations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Supabase Error (Obligations):', error);
            return MOCK_OBLIGATIONS;
        }

        if (data && data.length > 0) {
            return data
                .filter((item: any) => !isAuditTestTitle(item.title))
                .map((item: any) => ({
                    id: item.id,
                    reference_title: normalizeReferenceTitle(item.reference_title),
                    title: item.title,
                    description: item.description,
                    audience: item.audience || [],
                    compliance_status: item.compliance_status,
                    start_date: item.start_date || (shouldUseDefaultStartDate(item.compliance_status) ? DEFAULT_OBLIGATION_START_DATE : undefined),
                    penalty_grace_period_end: item.penalty_grace_period_end,
                    source_title: item.source_title || DEFAULT_OBLIGATION_SOURCE_TITLE,
                    source_url: item.source_url || DEFAULT_OBLIGATION_SOURCE_URL,
                }));
        }
    }

    return MOCK_OBLIGATIONS;
}
