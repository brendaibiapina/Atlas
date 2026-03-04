import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();
const envPath = path.join(projectRoot, '.env.local');

function parseEnv(filePath) {
    if (!fs.existsSync(filePath)) return {};

    const raw = fs.readFileSync(filePath, 'utf8');
    const lines = raw.split('\n');
    const env = {};

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;

        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const value = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[key] = value;
    }

    return env;
}

const env = parseEnv(envPath);
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || (!serviceRoleKey && !anonKey)) {
    console.error('Variáveis NEXT_PUBLIC_SUPABASE_URL e uma chave de API do Supabase são obrigatórias.');
    process.exit(1);
}

const rows = [
    {
        slug: 'operacional-modulos',
        question: 'Quais módulos existem no sistema Atlas e para que servem?',
        answer: 'O painel possui os módulos Visão Geral, Obrigações, Timeline, Radar, Imobiliário e Dúvidas Frequentes. Visão Geral concentra o resumo executivo. Obrigações lista regras e prazos. Timeline mostra os marcos da transição. Radar reúne normas e notícias oficiais. Imobiliário traz impactos do setor e simulador. Dúvidas Frequentes reúne perguntas oficiais e o chat com base interna.',
        tags: ['modulos', 'dashboard', 'operacionalidade', 'como usar'],
        keywords: ['modulos', 'menu', 'navegacao', 'painel'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 10,
        is_active: true,
    },
    {
        slug: 'operacional-faq',
        question: 'Como usar a página de Dúvidas Frequentes?',
        answer: 'Na página de Dúvidas Frequentes você pode buscar por palavra chave, filtrar por categoria e abrir as respostas em acordeão. No lado esquerdo há o chat para perguntas livres com base em dados internos do sistema.',
        tags: ['faq', 'duvidas frequentes', 'filtro', 'busca'],
        keywords: ['buscar', 'filtrar', 'categoria', 'perguntas'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 10,
        is_active: true,
    },
    {
        slug: 'operacional-chat-limite',
        question: 'O chat pode inventar resposta?',
        answer: 'Não. O chat responde somente com base em informações existentes no sistema. Quando não encontra base suficiente, informa explicitamente que não encontrou informação com segurança.',
        tags: ['chat', 'seguranca', 'base interna'],
        keywords: ['alucinacao', 'inventar', 'sem lastro', 'limite'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 10,
        is_active: true,
    },
    {
        slug: 'operacional-obrigacoes',
        question: 'Como consultar prazos no módulo de Obrigações?',
        answer: 'No módulo de Obrigações você encontra a lista com status de conformidade, prazo de início quando existente e link de origem normativa no card de cada obrigação.',
        tags: ['obrigacoes', 'prazo', 'origem', 'norma'],
        keywords: ['inicio', 'status', 'vigencia', 'link'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 9,
        is_active: true,
    },
    {
        slug: 'operacional-radar',
        question: 'Como abrir a fonte oficial de uma norma no Radar?',
        answer: 'No módulo Radar, cada item pode trazer URL oficial. Ao abrir o link de fonte, você acessa a publicação de origem para validação do conteúdo.',
        tags: ['radar', 'fonte oficial', 'norma'],
        keywords: ['url', 'fonte', 'link oficial'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 9,
        is_active: true,
    },
    {
        slug: 'operacional-simulador',
        question: 'Como usar o Simulador Investidor Imobiliário?',
        answer: 'No módulo Imobiliário, abra o Simulador Investidor Imobiliário e preencha os campos da operação. Primeiro selecione o cenário. Depois informe dados da transação. Por fim, revise os resultados de Consumo e Renda com comparativos.',
        tags: ['simulador', 'imobiliario', 'calculo'],
        keywords: ['simulador', 'investidor', 'operacao', 'resultado'],
        source_label: 'Atlas',
        topic: 'OPERACIONAL',
        priority: 9,
        is_active: true,
    },
];

const apiKeys = [serviceRoleKey, anonKey].filter(Boolean);

async function requestWithApiKey(endpoint, options = {}) {
    let lastResponse = null;
    let lastPayload = '';

    for (const key of apiKeys) {
        const response = await fetch(endpoint, {
            ...options,
            headers: {
                ...(options.headers || {}),
                apikey: key,
                Authorization: `Bearer ${key}`,
            },
        });

        const payload = await response.text();
        lastResponse = response;
        lastPayload = payload;

        if (response.status !== 401) {
            return { response, payload };
        }
    }

    return { response: lastResponse, payload: lastPayload };
}

async function tableStatus() {
    const endpoint = `${supabaseUrl}/rest/v1/chatbot_knowledge_base?select=id&limit=1`;

    const { response, payload } = await requestWithApiKey(endpoint, {
        method: 'GET',
    });

    if (response.ok) return 'exists';

    if (response.status === 401) {
        console.warn('Não foi possível autenticar no Supabase com as chaves disponíveis.');
        return 'unauthorized';
    }

    if (response.status === 404 || payload.includes('relation') || payload.includes('chatbot_knowledge_base')) {
        return 'missing';
    }

    throw new Error(`Falha ao validar tabela. HTTP ${response.status}: ${payload}`);
}

async function upsertRows() {
    const endpoint = `${supabaseUrl}/rest/v1/chatbot_knowledge_base?on_conflict=slug`;

    const { response, payload } = await requestWithApiKey(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
    });

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            console.warn('Sem permissão para sincronizar a tabela chatbot_knowledge_base no Supabase.');
            console.warn('Valide as chaves do arquivo .env.local e execute novamente.');
            return;
        }

        throw new Error(`Falha no upsert. HTTP ${response.status}: ${payload}`);
    }

    const parsed = payload ? JSON.parse(payload) : [];
    console.log(`Base do chatbot sincronizada com ${parsed.length} registros.`);
}

async function main() {
    const status = await tableStatus();

    if (status === 'unauthorized') {
        console.warn('Sincronização não executada por falha de autenticação.');
        return;
    }

    if (status === 'missing') {
        console.warn('Tabela chatbot_knowledge_base não encontrada no Supabase.');
        console.warn('Execute supabase_setup.sql e seed_real_data.sql no SQL Editor e rode este comando novamente.');
        return;
    }

    await upsertRows();
}

main().catch((error) => {
    console.error('Erro ao sincronizar base do chatbot:', error.message);
    process.exit(1);
});
