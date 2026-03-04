import { getFAQItems, FAQ_SOURCE_URL } from '@/services/faq';
import { getObligations } from '@/services/obligations';
import { getRadarNorms } from '@/services/radar';
import { getMemoriaCalculoChatItems } from '@/services/imobiliario';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

export type ChatKnowledgeSourceType = 'FAQ' | 'OBRIGACAO' | 'RADAR' | 'OPERACIONAL' | 'CHATBOT_DB' | 'MEMORIA_CALCULO';

export type ChatKnowledgeEntry = {
    id: string;
    source_type: ChatKnowledgeSourceType;
    question: string;
    answer: string;
    tags: string[];
    keywords?: string[];
    source_label: string;
    source_url?: string;
    priority?: number;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let knowledgeCache: {
    updatedAt: number;
    items: ChatKnowledgeEntry[];
} | null = null;

const OPERATIONAL_KNOWLEDGE: ChatKnowledgeEntry[] = [
    {
        id: 'operacional-modulos',
        source_type: 'OPERACIONAL',
        question: 'Quais módulos existem no sistema Atlas e para que servem?',
        answer: 'O painel possui os módulos Visão Geral, Obrigações, Timeline, Radar, Imobiliário e Dúvidas Frequentes. Visão Geral concentra o resumo executivo. Obrigações lista regras e prazos. Timeline mostra os marcos da transição. Radar reúne normas e notícias oficiais. Imobiliário traz impactos do setor e simulador. Dúvidas Frequentes reúne perguntas oficiais e o chat com base interna.',
        tags: ['modulos', 'dashboard', 'operacionalidade', 'como usar'],
        keywords: ['modulos', 'menu', 'navegacao', 'painel'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-faq',
        source_type: 'OPERACIONAL',
        question: 'Como usar a página de Dúvidas Frequentes?',
        answer: 'Na página de Dúvidas Frequentes você pode buscar por palavra chave, filtrar por categoria e abrir as respostas em acordeão. No lado esquerdo há o chat para perguntas livres com base em dados internos do sistema.',
        tags: ['faq', 'duvidas frequentes', 'filtro', 'busca'],
        keywords: ['buscar', 'filtrar', 'categoria', 'perguntas'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-chat-limite',
        source_type: 'OPERACIONAL',
        question: 'O chat pode inventar resposta?',
        answer: 'Não. O chat responde somente com base em informações existentes no sistema. Quando não encontra base suficiente, informa explicitamente que não encontrou informação com segurança.',
        tags: ['chat', 'seguranca', 'base interna'],
        keywords: ['alucinacao', 'inventar', 'sem lastro', 'limite'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-obrigacoes',
        source_type: 'OPERACIONAL',
        question: 'Como consultar prazos no módulo de Obrigações?',
        answer: 'No módulo de Obrigações você encontra a lista com status de conformidade, prazo de início quando existente e link de origem normativa no card de cada obrigação.',
        tags: ['obrigacoes', 'prazo', 'origem', 'norma'],
        keywords: ['inicio', 'status', 'vigencia', 'link'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-simulador',
        source_type: 'OPERACIONAL',
        question: 'Como usar o Simulador Investidor Imobiliário?',
        answer: 'No módulo Imobiliário, abra o Simulador Investidor Imobiliário e preencha os campos da operação. Primeiro selecione o cenário. Depois informe dados da transação. Por fim, revise os resultados de Consumo e Renda com comparativos.',
        tags: ['simulador', 'imobiliario', 'calculo'],
        keywords: ['simulador', 'investidor', 'operacao', 'resultado'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-radar',
        source_type: 'OPERACIONAL',
        question: 'Como abrir a fonte oficial de uma norma no Radar?',
        answer: 'No módulo Radar, cada item pode trazer URL oficial. Ao abrir o link de fonte, você acessa a publicação de origem para validação do conteúdo.',
        tags: ['radar', 'fonte oficial', 'norma'],
        keywords: ['url', 'fonte', 'link oficial'],
        source_label: 'Atlas',
    },
    {
        id: 'operacional-advogada-especialista',
        source_type: 'OPERACIONAL',
        question: 'O sistema recomenda buscar advogado especialista?',
        answer: 'Sim. Este sistema foi criado e desenvolvido por uma advogada tributarista e toda a curadoria das informações é feita pela advogada Brenda Ibiapina OAB/DF 83.671. Para análise individual e estratégica do seu caso, busque advogado especialista. Atendimento no Instagram @brendaibiapina.',
        tags: ['advogada', 'especialista', 'orientacao juridica', 'instagram'],
        keywords: ['advogado', 'brenda', 'oab', 'consultoria'],
        source_label: 'Instagram Brenda Ibiapina',
        source_url: 'https://instagram.com/brendaibiapina',
    },
];

function formatDateBr(rawDate: string | undefined): string | null {
    if (!rawDate) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const [year, month, day] = rawDate.split('-');
        return `${day}/${month}/${year}`;
    }

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

function mapFAQKnowledge(): ChatKnowledgeEntry[] {
    return getFAQItems().map((item) => ({
        id: `faq-${item.id}`,
        source_type: 'FAQ',
        question: item.question,
        answer: item.answer,
        tags: [...item.tags, 'faq'],
        keywords: [item.category],
        source_label: item.source,
        source_url: FAQ_SOURCE_URL,
        priority: 2,
    }));
}

function mapSimuladorMemoryKnowledge(): ChatKnowledgeEntry[] {
    return getMemoriaCalculoChatItems().map((item) => ({
        id: `memoria-${item.id}`,
        source_type: 'MEMORIA_CALCULO',
        question: item.question,
        answer: item.answer,
        tags: item.tags,
        keywords: item.keywords,
        source_label: 'Simulador Investidor Imobiliário',
        priority: 5,
    }));
}

async function mapObligationKnowledge(): Promise<ChatKnowledgeEntry[]> {
    const obligations = await getObligations();
    return obligations.map((item) => {
        const startDate = formatDateBr(item.start_date);
        const startText = startDate ? `Prazo de início: ${startDate}.` : 'Prazo de início sem data definida.';
        const sourceText = item.reference_title ? `Referência: ${item.reference_title}.` : '';
        const audienceText = item.audience?.length ? `Público: ${item.audience.join(', ')}.` : '';

        return {
            id: `obrigacao-${item.id}`,
            source_type: 'OBRIGACAO',
            question: item.title,
            answer: `${item.description} Status: ${item.compliance_status}. ${startText} ${audienceText} ${sourceText}`.trim(),
            tags: [...(item.audience || []), item.compliance_status, 'obrigacoes'],
            keywords: ['obrigacao', 'prazo', 'inicio', 'compliance'],
            source_label: item.source_title || item.reference_title || 'Atlas',
            source_url: item.source_url,
            priority: 3,
        };
    });
}

async function mapRadarKnowledge(): Promise<ChatKnowledgeEntry[]> {
    const norms = await getRadarNorms();
    return norms.slice(0, 50).map((item) => {
        const publicationDate = formatDateBr(item.publication_date);
        const publicationText = publicationDate ? `Publicação: ${publicationDate}.` : '';

        return {
            id: `radar-${item.id}`,
            source_type: 'RADAR',
            question: item.title,
            answer: `${item.summary} ${publicationText} Status: ${item.status}.`.trim(),
            tags: [...(item.tags || []), item.source_type, 'radar'],
            keywords: ['norma', 'noticia', 'radar', 'publicacao'],
            source_label: item.source_type,
            source_url: item.full_text_url,
            priority: 1,
        };
    });
}

async function mapSupabaseChatbotKnowledge(): Promise<ChatKnowledgeEntry[]> {
    if (!isSupabaseConfigured() || !supabase) return [];

    const { data, error } = await supabase
        .from('chatbot_knowledge_base')
        .select('*')
        .eq('is_active', true)
        .order('priority', { ascending: false })
        .limit(400);

    if (error || !data) return [];

    return data.map((item: any) => ({
        id: `chatbot-db-${item.id}`,
        source_type: 'CHATBOT_DB',
        question: item.question,
        answer: item.answer,
        tags: item.tags || [],
        keywords: item.keywords || [],
        source_label: item.source_label || 'Atlas',
        source_url: item.source_url || undefined,
        priority: typeof item.priority === 'number' ? item.priority : 4,
    }));
}

function deduplicateEntries(entries: ChatKnowledgeEntry[]): ChatKnowledgeEntry[] {
    const map = new Map<string, ChatKnowledgeEntry>();

    for (const entry of entries) {
        const key = `${entry.question.trim().toLowerCase()}|${entry.answer.trim().toLowerCase()}`;
        const existing = map.get(key);

        if (!existing || (entry.priority || 0) > (existing.priority || 0)) {
            map.set(key, entry);
        }
    }

    return Array.from(map.values());
}

export async function getChatbotKnowledgeBase(forceRefresh = false): Promise<ChatKnowledgeEntry[]> {
    const now = Date.now();
    const isCacheValid = knowledgeCache && now - knowledgeCache.updatedAt < CACHE_TTL_MS;

    if (!forceRefresh && isCacheValid) {
        return knowledgeCache!.items;
    }

    const [faqEntries, memoryEntries, obligationEntries, radarEntries, dbEntries] = await Promise.all([
        Promise.resolve(mapFAQKnowledge()),
        Promise.resolve(mapSimuladorMemoryKnowledge()),
        mapObligationKnowledge(),
        mapRadarKnowledge(),
        mapSupabaseChatbotKnowledge(),
    ]);

    const merged = deduplicateEntries([
        ...dbEntries,
        ...memoryEntries,
        ...OPERATIONAL_KNOWLEDGE,
        ...faqEntries,
        ...obligationEntries,
        ...radarEntries,
    ]);

    knowledgeCache = {
        updatedAt: now,
        items: merged,
    };

    return merged;
}
