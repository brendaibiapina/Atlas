import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// --- Types ---
export type ReformStatus = {
    tax: 'IBS' | 'CBS' | 'Imposto Seletivo';
    status: 'VIGENTE' | 'PENDING' | 'EM_CONSTRUCAO';
    label: string;
};

export type FeedItem = {
    id: string;
    date: string;
    source: string;
    title: string;
    description: string;
    status: 'VIGENTE' | 'PENDING' | 'EM_CONSTRUCAO';
    tags: string[];
    url?: string;
};

function isAuditTestTitle(title: string | null | undefined): boolean {
    const normalized = (title ?? '').trim().toUpperCase();
    return normalized.startsWith('ZZ_AUDIT') || normalized.startsWith('ZZ_TEST');
}

// --- Service Functions ---

export async function getReformStatus(): Promise<ReformStatus[]> {
    // Atualizado com dados oficiais de /orientacoes-2026
    // CBS: Piloto ativo desde Jul/2025, obrigatória em 2026 (ano de teste, sem recolhimento)
    // IBS: LC 227/2026 criou o CGIBS, sistema em implantação
    // Imposto Seletivo: Ainda aguarda regulamentação específica
    return [
        { tax: 'CBS', status: 'VIGENTE', label: 'TESTE 2026' },
        { tax: 'IBS', status: 'EM_CONSTRUCAO', label: 'TESTE 2026' },
        { tax: 'Imposto Seletivo', status: 'PENDING', label: 'Aguarda Regulamentação' },
    ];
}

export async function getRecentFeed(): Promise<FeedItem[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabase!
            .from('legal_references')
            .select('*')
            .order('publication_date', { ascending: false })
            .limit(5);

        if (error) {
            console.error('Supabase Error:', error);
            return getMockFeed();
        }

        if (data && data.length > 0) {
            return data
                .filter((item: any) => !isAuditTestTitle(item.title))
                .map((item: any) => ({
                id: item.id,
                date: new Date(item.publication_date).toLocaleDateString('pt-BR'),
                source: item.source_type,
                title: item.title,
                description: item.summary,
                status: item.status,
                tags: item.tags || [],
                url: item.full_text_url || undefined
                }));
        }
    }

    return getMockFeed();
}

// --- Mock Fallback com dados reais da RFB ---
function getMockFeed(): FeedItem[] {
    return [
        {
            id: '1',
            date: '15/02/2026',
            source: 'RFB',
            title: 'RFB disponibiliza manuais e leiautes da DeRE',
            description: 'Guias e leiautes da nova Declaração de Regimes Específicos já podem ser acessados para apoiar o preenchimento.',
            status: 'VIGENTE',
            tags: ['DeRE', 'OBRIGACOES'],
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao'
        },
        {
            id: '2',
            date: '10/02/2026',
            source: 'RFB',
            title: 'RFB lança chatbot com IA sobre a Reforma',
            description: 'Chatbot auxilia contribuintes a resolver dúvidas gerais sobre a Reforma Tributária do Consumo (RTC).',
            status: 'VIGENTE',
            tags: ['IA', 'TECNOLOGIA'],
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao'
        },
        {
            id: '3',
            date: '13/01/2026',
            source: 'DOU',
            title: 'LC 227/2026, Comitê Gestor do IBS',
            description: 'Institui o CGIBS e dispõe sobre o processo administrativo tributário do IBS e novas regras de prazos processuais.',
            status: 'VIGENTE',
            tags: ['IBS', 'CGIBS'],
            url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/Lcp227.htm'
        },
        {
            id: '4',
            date: '15/01/2026',
            source: 'RFB',
            title: 'Portal de Tributação sobre Consumo no ar',
            description: 'Portal nacional permite acesso a serviços digitais relacionados à apuração da CBS e do IBS.',
            status: 'VIGENTE',
            tags: ['PORTAL', 'CBS', 'IBS'],
            url: 'https://tributacaoconsumo.gov.br'
        },
        {
            id: '5',
            date: '20/01/2026',
            source: 'RFB',
            title: 'ALERTA: É falso que todo proprietário pagará imposto sobre aluguel',
            description: 'PF só vira contribuinte se tiver mais de 3 imóveis E receita anual de aluguel acima de R$ 240 mil.',
            status: 'VIGENTE',
            tags: ['IMOBILIARIO', 'ALUGUEL'],
            url: 'https://www.gov.br/receitafederal/pt-br/assuntos/reforma-tributaria-regulamentacao'
        }
    ];
}
