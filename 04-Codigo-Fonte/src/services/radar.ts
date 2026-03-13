import { supabase } from '@/lib/supabase';

export type LegalReference = {
    id: string;
    title: string;
    source_type: string;
    publication_date: string;
    summary: string;
    status: string;
    tags: string[];
    full_text_url?: string;
};

const MOCK_RADAR_NORMS: LegalReference[] = [
    {
        id: 'mock-radar-1',
        title: 'ATO CONJUNTO RFB/CGIBS Nº 1, DE 22 DE DEZEMBRO DE 2025',
        source_type: 'DOU',
        publication_date: '2025-12-22',
        summary: 'Ato conjunto com orientações operacionais da transição para CBS e IBS.',
        status: 'VIGENTE',
        tags: ['CBS', 'IBS', 'transicao'],
        full_text_url: 'https://in.gov.br/en/web/dou/-/ato-conjunto-rfb/cgibs-n-1-de-22-de-dezembro-de-2025-677624586',
    },
    {
        id: 'mock-radar-2',
        title: 'Lei Complementar nº 227, de 13 de janeiro de 2026',
        source_type: 'RFB',
        publication_date: '2026-01-13',
        summary: 'Marco regulatório relacionado à Reforma Tributária do Consumo.',
        status: 'EM_ANALISE',
        tags: ['LC 227', 'reforma tributaria'],
    },
    {
        id: 'mock-radar-3',
        title: 'Receita Federal publica Perguntas e Respostas sobre as mudanças de 2026',
        source_type: 'RFB',
        publication_date: '2026-02-01',
        summary: 'Atualização oficial com perguntas e respostas sobre obrigações e regras de transição.',
        status: 'ATUALIZADO',
        tags: ['perguntas e respostas', 'orientacoes 2026'],
    },
];

function isAuditTestTitle(title: string | null | undefined): boolean {
    const normalized = (title ?? '').trim().toUpperCase();
    return normalized.startsWith('ZZ_AUDIT') || normalized.startsWith('ZZ_TEST');
}

function applyQuery(items: LegalReference[], query?: string): LegalReference[] {
    if (!query) return items;
    const term = query.toLowerCase();
    return items.filter((item) =>
        item.title.toLowerCase().includes(term) ||
        item.summary.toLowerCase().includes(term) ||
        item.tags.some((tag) => tag.toLowerCase().includes(term)),
    );
}

export async function getRadarNorms(query?: string): Promise<LegalReference[]> {
    // 1. Try Supabase
    if (supabase) {
        let dbQuery = supabase
            .from('legal_references')
            .select('*')
            .order('publication_date', { ascending: false });

        if (query) {
            dbQuery = dbQuery.ilike('title', `%${query}%`);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error('Radar Service Error:', error);
            return applyQuery(MOCK_RADAR_NORMS, query);
        }

        if (data) {
            const cleaned = (data as LegalReference[]).filter((item) => !isAuditTestTitle(item.title));
            return applyQuery(cleaned, query);
        }
    }

    return applyQuery(MOCK_RADAR_NORMS, query);
}

// Compatibilidade temporária com chamadas legadas
export const getRadardNorms = getRadarNorms;
