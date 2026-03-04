// src/services/imobiliario.ts
// Service layer para o Módulo Imobiliário
// Base Legal: LC 214/2025 + EC 132/2023

import { supabase } from '@/lib/supabase';

// ── Constantes legais (LC 214/2025) ────────────────────────
export const ALIQUOTA_PADRAO_ESTIMADA = 0.265; // ~26,5% (CBS + IBS combinado)

export const REDUTORES = {
    VENDA: { percentual: 0.50, label: '50%', descricao: 'Redutor sobre alíquota padrão para alienações imobiliárias' },
    LOCACAO: { percentual: 0.70, label: '70%', descricao: 'Redutor sobre alíquota padrão para locação, cessão onerosa e arrendamento' },
    INCORPORACAO: { percentual: 0.50, label: '50%', descricao: 'Redutor sobre alíquota padrão para incorporação imobiliária' },
} as const;

export const REDUTOR_SOCIAL = {
    valor: 600,
    descricao: 'R$ 600/imóvel, deduzido da base de cálculo na locação residencial',
    aplicavel: 'Locação residencial',
};

export const REGIME_TRANSICAO_LOCACAO = {
    aliquota: 0.0365,
    label: '3,65%',
    artigo: 'Art. 487, LC 214/2025',
    descricao: 'Opção para contratos de locação existentes antes da publicação da LC 214',
    condicoes: [
        'Contrato registrado em cartório',
        'OU disponibilizado digitalmente à RFB e ao Comitê Gestor do IBS',
    ],
};

export const REGRAS_PESSOA_FISICA = {
    limiteReceitaAnual: 240000,
    limiteImoveis: 3,
    descricao: 'PF é contribuinte de IBS/CBS quando receita de locação > R$ 240.000/ano E possui > 3 imóveis destinados a locação',
    obrigacoes: ['Emissão de NF ABI', 'Apuração CBS/IBS', 'DeRE (se regime específico)'],
};

export const NF_ABI = {
    nome: 'NF ABI, Nota Fiscal de Alienação de Bens Imóveis',
    obrigatoria: true,
    vigenciaInicio: '2026',
    operacoes: ['Vendas', 'Locações', 'Permutas', 'Arrendamentos'],
    obrigados: [
        'Incorporadoras e construtoras',
        'Loteadoras',
        'Imobiliárias e administradoras de imóveis',
        'Pessoas físicas contribuintes de IBS/CBS',
    ],
};

// ── Tipos legados (compatibilidade) ────────────────────────

export type OperationType = 'VENDA' | 'LOCACAO' | 'INCORPORACAO' | 'PESSOA_FISICA';

export type SimulacaoInput = {
    valorImovel: number;
    operacao: OperationType;
    isPessoaFisica: boolean;
    isLocacaoResidencial: boolean;
    isContratoExistente: boolean;
};

export type SimulacaoResult = {
    aliquotaPadrao: number;
    redutor: number;
    aliquotaEfetiva: number;
    valorCBSIBS: number;
    regimeTransicao?: { aliquota: number; valorTransicao: number };
    redutorSocial?: number;
};

export type NoticiaImobiliaria = {
    id: string;
    title: string;
    source_type: string;
    publication_date: string;
    summary: string;
    tags: string[];
    full_text_url?: string;
};

// ── Motor auditável (novo simulador) ────────────────────────

export type SimuladorOperacao = 'LOCACAO' | 'ALIENACAO';
export type SimuladorPerfil = 'PF' | 'PJ';
export type SimuladorLocacaoTipo = 'CONVENCIONAL' | 'TEMPORADA';
export type SimuladorPeriodoLocacao = 'MENSAL' | 'ANUAL';
export type SimuladorNaturezaBemPJ = 'ESTOQUE' | 'IMOBILIZADO_INVESTIMENTO';
export type SimuladorMetodoRenda = 'SIMPLIFICADO' | 'INFORMADO';

export type RedutorAjusteItem = {
    id: string;
    data_evento: string;
    tipo_evento: string;
    valor_evento: number;
    fator_atualizacao: number;
    elegivel: boolean;
};

export type PremissasCalculo = {
    t_nom: number;
    r_loc_conv: number;
    r_loc_temp: number;
    r_alien: number;
    p_irpj_locacao: number;
    p_csll_locacao: number;
    p_irpj_estoque: number;
    p_csll_estoque: number;
    a_irpj: number;
    a_csll: number;
    a_irpf_locacao_simplificada: number;
    a_irpf_ganho_simplificada: number;
    margem_nao_negativa: boolean;
};

export const PREMISSAS_DEFAULT: PremissasCalculo = {
    t_nom: 0.265,
    r_loc_conv: 0.70,
    r_loc_temp: 0.50,
    r_alien: 0.50,
    p_irpj_locacao: 0.32,
    p_csll_locacao: 0.32,
    p_irpj_estoque: 0.08,
    p_csll_estoque: 0.12,
    a_irpj: 0.15,
    a_csll: 0.09,
    a_irpf_locacao_simplificada: 0.275,
    a_irpf_ganho_simplificada: 0.15,
    margem_nao_negativa: true,
};

export type SimuladorInput = {
    operacao: SimuladorOperacao;
    perfil: SimuladorPerfil;

    // Locação
    tipo_locacao: SimuladorLocacaoTipo;
    periodo_locacao: SimuladorPeriodoLocacao;
    valor_locacao: number;
    pf_acima_limite_legal: boolean;

    // Alienação
    valor_venda: number;
    custo_aquisicao: number;
    despesas_elegiveis: number;
    custos_capitalizaveis_pj: number;
    natureza_bem_pj: SimuladorNaturezaBemPJ;
    redutor_ajuste_itens: RedutorAjusteItem[];

    // Renda PF
    metodo_irpf_locacao: SimuladorMetodoRenda;
    irpf_locacao_informado: number;
    aliquota_irpf_locacao_simplificada: number;

    metodo_irpf_venda: SimuladorMetodoRenda;
    irpf_venda_informado: number;
    aliquota_irpf_venda_simplificada: number;
};

export type LinhaCalculo = {
    label: string;
    base: number;
    aliquota: number;
    imposto: number;
};

export type EnquadramentoResultado = {
    aplica_consumo: boolean;
    status: 'ELEGIVEL' | 'NAO_ELEGIVEL';
    regra: string;
};

export type ConsumoResultado = {
    base: number;
    aliquota_nominal: number;
    reducao: number;
    aliquota_efetiva: number;
    imposto: number;
    formula: string;
};

export type RendaResultado = {
    imposto_total: number;
    tipo: 'IRPF' | 'IRPJ_CSLL';
    linhas: LinhaCalculo[];
};

export type RedutorAjusteCalculado = RedutorAjusteItem & {
    valor_corrigido: number;
};

export type AlienacaoBasesResultado = {
    preco_venda: number;
    custo_aquisicao: number;
    despesas_elegiveis: number;
    redutor_ajuste_total: number;
    margem_bruta: number;
    margem_utilizada: number;
    ganho_pf: number;
    ganho_pj: number;
    trilha_redutor: RedutorAjusteCalculado[];
};

export type SimuladorResultado = {
    operacao: SimuladorOperacao;
    perfil: SimuladorPerfil;
    enquadramento: EnquadramentoResultado;
    consumo: ConsumoResultado;
    renda: RendaResultado;
    total: number;
    bases_alienacao?: AlienacaoBasesResultado;
    base_locacao?: number;
};

export type ComparativosResultado = {
    perfil_alternativo: { perfil: SimuladorPerfil; total: number };
    operacao_alternativa: { operacao: SimuladorOperacao; total: number };
};

export type MemoriaCalculoChatItem = {
    id: string;
    question: string;
    answer: string;
    tags: string[];
    keywords: string[];
};

function formatPercentBr(value: number): string {
    return `${(value * 100).toFixed(2).replace('.', ',')}%`;
}

export function getMemoriaCalculoChatItems(premissas: PremissasCalculo = PREMISSAS_DEFAULT): MemoriaCalculoChatItem[] {
    const tLocConv = premissas.t_nom * (1 - premissas.r_loc_conv);
    const tLocTemp = premissas.t_nom * (1 - premissas.r_loc_temp);
    const tAlien = premissas.t_nom * (1 - premissas.r_alien);

    return [
        {
            id: 'memoria-calculo-base-aliquota-efetiva',
            question: 'Qual fórmula define a alíquota efetiva no simulador imobiliário?',
            answer: `A alíquota efetiva é calculada por t efetiva igual a t nominal vezes um menos redução. Com t nominal de ${formatPercentBr(premissas.t_nom)} as alíquotas efetivas atuais são ${formatPercentBr(tLocConv)} para locação convencional, ${formatPercentBr(tLocTemp)} para locação de temporada e ${formatPercentBr(tAlien)} para alienação.`,
            tags: ['simulador', 'memoria de calculo', 'aliquota efetiva', 'ibs', 'cbs'],
            keywords: ['formula', 't nominal', 'reducao', 'aliquota'],
        },
        {
            id: 'memoria-calculo-locacao-consumo',
            question: 'Como o simulador calcula IBS e CBS na locação?',
            answer: 'Para locação o consumo é calculado por T consumo locação igual receita de locação vezes alíquota efetiva da modalidade. A modalidade convencional usa r loc conv e a temporada usa r loc temp.',
            tags: ['locacao', 'consumo', 'ibs', 'cbs', 'simulador'],
            keywords: ['receita', 't consumo loc', 'locacao convencional', 'temporada'],
        },
        {
            id: 'memoria-calculo-locacao-renda',
            question: 'Como o simulador calcula renda na locação para PF e PJ?',
            answer: 'Na PF o sistema usa IRPF simplificado por alíquota parametrizada ou IRPF informado. Na PJ lucro presumido calcula IRPJ e CSLL sobre bases presumidas p IRPJ e p CSLL aplicadas sobre a receita de locação.',
            tags: ['locacao', 'irpf', 'irpj', 'csll', 'simulador'],
            keywords: ['pf', 'pj', 'lucro presumido', 'renda'],
        },
        {
            id: 'memoria-calculo-alienacao-margem',
            question: 'Qual base de consumo o simulador usa na alienação de imóvel?',
            answer: 'Na alienação o consumo usa a margem econômica ajustada. A margem é preço de venda menos custo de aquisição e menos redutor de ajuste total. Quando a premissa de margem não negativa está ativa o sistema limita a base de consumo a zero no piso.',
            tags: ['alienacao', 'margem', 'consumo', 'simulador'],
            keywords: ['pv', 'ca', 'redutor de ajuste', 'base de consumo'],
        },
        {
            id: 'memoria-calculo-redutor-ajuste',
            question: 'Como o redutor de ajuste é calculado no simulador?',
            answer: 'O redutor de ajuste total é a soma das despesas elegíveis com cada item elegível da trilha corrigido por fator de atualização. Cada item possui data do evento, tipo do evento, valor do evento e fator de atualização.',
            tags: ['redutor de ajuste', 'trilha', 'alienacao', 'simulador'],
            keywords: ['itbi', 'laudemio', 'despesas elegiveis', 'valor corrigido'],
        },
        {
            id: 'memoria-calculo-alienacao-renda',
            question: 'Como a renda é calculada na alienação para PF e PJ?',
            answer: 'Na PF a renda usa ganho de capital com método simplificado por alíquota ou imposto informado. Na PJ para estoque aplica base presumida sobre receita. Para imobilizado ou investimento aplica IRPJ e CSLL sobre ganho contábil.',
            tags: ['alienacao', 'renda', 'irpf', 'irpj', 'csll'],
            keywords: ['ganho de capital', 'estoque', 'imobilizado', 'investimento'],
        },
        {
            id: 'memoria-calculo-separacao-bases',
            question: 'O simulador mistura base de consumo com base de renda?',
            answer: 'Não. O simulador mantém base de consumo e base de renda em variáveis distintas. Em alienação a base de consumo usa margem ajustada e a base de renda usa ganho conforme regra de PF ou PJ.',
            tags: ['consistencia', 'base de consumo', 'base de renda', 'simulador'],
            keywords: ['margem', 'ganho', 'validacao', 'auditoria'],
        },
        {
            id: 'memoria-calculo-oculta-ui',
            question: 'Onde fica a memória de cálculo no sistema Atlas?',
            answer: 'A memória de cálculo do simulador é interna e não aparece de forma permanente na tela do usuário. Ela é usada como base de dados para o chat do sistema responder dúvidas com rastreabilidade.',
            tags: ['memoria de calculo', 'chat', 'atlas', 'operacional'],
            keywords: ['oculta', 'nao visivel', 'base interna', 'chatbot'],
        },
    ];
}

function safeNumber(value: number): number {
    if (!Number.isFinite(value)) return 0;
    return value;
}

function clampNonNegative(value: number): number {
    const numeric = safeNumber(value);
    return numeric < 0 ? 0 : numeric;
}

function calcularRedutorAjuste(itens: RedutorAjusteItem[]): RedutorAjusteCalculado[] {
    return itens.map((item) => {
        const valor = clampNonNegative(item.valor_evento);
        const fator = item.fator_atualizacao > 0 ? item.fator_atualizacao : 1;
        const valorCorrigido = item.elegivel ? valor * fator : 0;

        return {
            ...item,
            valor_corrigido: valorCorrigido,
        };
    });
}

function calcularEnquadramentoLocacao(input: SimuladorInput): EnquadramentoResultado {
    if (input.perfil !== 'PF') {
        return {
            aplica_consumo: true,
            status: 'ELEGIVEL',
            regra: 'PJ em locação: operação enquadrada no regime específico de consumo.',
        };
    }

    if (input.pf_acima_limite_legal) {
        return {
            aplica_consumo: true,
            status: 'ELEGIVEL',
            regra: 'PF acima do limite legal: operação enquadrada para incidência de IBS/CBS na locação.',
        };
    }

    return {
        aplica_consumo: false,
        status: 'NAO_ELEGIVEL',
        regra: 'PF abaixo do limite legal: sem incidência de IBS/CBS na locação neste cenário.',
    };
}

function calcularConsumoLocacao(input: SimuladorInput, premissas: PremissasCalculo): { enquadramento: EnquadramentoResultado; consumo: ConsumoResultado; baseLocacao: number } {
    const receita = clampNonNegative(input.valor_locacao);
    const reducao = input.tipo_locacao === 'TEMPORADA' ? premissas.r_loc_temp : premissas.r_loc_conv;
    const aliquotaEfetiva = premissas.t_nom * (1 - reducao);
    const enquadramento = calcularEnquadramentoLocacao(input);
    const imposto = enquadramento.aplica_consumo ? receita * aliquotaEfetiva : 0;

    return {
        enquadramento,
        baseLocacao: receita,
        consumo: {
            base: receita,
            aliquota_nominal: premissas.t_nom,
            reducao,
            aliquota_efetiva: aliquotaEfetiva,
            imposto,
            formula: 'T_cons_loc = R × t_loc',
        },
    };
}

function calcularRendaLocacao(input: SimuladorInput, premissas: PremissasCalculo, receita: number): RendaResultado {
    if (input.perfil === 'PF') {
        if (input.metodo_irpf_locacao === 'INFORMADO') {
            return {
                tipo: 'IRPF',
                imposto_total: clampNonNegative(input.irpf_locacao_informado),
                linhas: [
                    {
                        label: 'IRPF informado (f_IRPF)',
                        base: receita,
                        aliquota: 0,
                        imposto: clampNonNegative(input.irpf_locacao_informado),
                    },
                ],
            };
        }

        const aliquota = clampNonNegative(input.aliquota_irpf_locacao_simplificada || premissas.a_irpf_locacao_simplificada);
        const imposto = receita * aliquota;

        return {
            tipo: 'IRPF',
            imposto_total: imposto,
            linhas: [
                {
                    label: 'IRPF simplificado sobre receita de locação',
                    base: receita,
                    aliquota,
                    imposto,
                },
            ],
        };
    }

    const baseIRPJ = receita * clampNonNegative(premissas.p_irpj_locacao);
    const baseCSLL = receita * clampNonNegative(premissas.p_csll_locacao);
    const impostoIRPJ = baseIRPJ * clampNonNegative(premissas.a_irpj);
    const impostoCSLL = baseCSLL * clampNonNegative(premissas.a_csll);

    return {
        tipo: 'IRPJ_CSLL',
        imposto_total: impostoIRPJ + impostoCSLL,
        linhas: [
            {
                label: 'IRPJ (lucro presumido - locação)',
                base: baseIRPJ,
                aliquota: premissas.a_irpj,
                imposto: impostoIRPJ,
            },
            {
                label: 'CSLL (lucro presumido - locação)',
                base: baseCSLL,
                aliquota: premissas.a_csll,
                imposto: impostoCSLL,
            },
        ],
    };
}

function calcularAlienacaoBases(input: SimuladorInput, premissas: PremissasCalculo): AlienacaoBasesResultado {
    const pv = clampNonNegative(input.valor_venda);
    const ca = clampNonNegative(input.custo_aquisicao);
    const despesas = clampNonNegative(input.despesas_elegiveis);

    const trilha = calcularRedutorAjuste(input.redutor_ajuste_itens || []);
    const redutorItens = trilha.reduce((acc, item) => acc + item.valor_corrigido, 0);
    const redutorTotal = redutorItens + despesas;

    const margemBruta = pv - (ca + redutorTotal);
    const margemUtilizada = premissas.margem_nao_negativa ? clampNonNegative(margemBruta) : margemBruta;

    const ganhoPF = pv - ca;
    const ganhoPJ = pv - (ca + clampNonNegative(input.custos_capitalizaveis_pj));

    return {
        preco_venda: pv,
        custo_aquisicao: ca,
        despesas_elegiveis: despesas,
        redutor_ajuste_total: redutorTotal,
        margem_bruta: margemBruta,
        margem_utilizada: margemUtilizada,
        ganho_pf: ganhoPF,
        ganho_pj: ganhoPJ,
        trilha_redutor: trilha,
    };
}

function calcularRendaAlienacao(input: SimuladorInput, premissas: PremissasCalculo, bases: AlienacaoBasesResultado): RendaResultado {
    if (input.perfil === 'PF') {
        if (input.metodo_irpf_venda === 'INFORMADO') {
            const impostoInformado = clampNonNegative(input.irpf_venda_informado);

            return {
                tipo: 'IRPF',
                imposto_total: impostoInformado,
                linhas: [
                    {
                        label: 'IRPF ganho de capital informado (f_GanhoCapital)',
                        base: bases.ganho_pf,
                        aliquota: 0,
                        imposto: impostoInformado,
                    },
                ],
            };
        }

        const base = clampNonNegative(bases.ganho_pf);
        const aliquota = clampNonNegative(input.aliquota_irpf_venda_simplificada || premissas.a_irpf_ganho_simplificada);
        const imposto = base * aliquota;

        return {
            tipo: 'IRPF',
            imposto_total: imposto,
            linhas: [
                {
                    label: 'IRPF simplificado sobre ganho de capital',
                    base,
                    aliquota,
                    imposto,
                },
            ],
        };
    }

    if (input.natureza_bem_pj === 'ESTOQUE') {
        const baseIRPJ = bases.preco_venda * clampNonNegative(premissas.p_irpj_estoque);
        const baseCSLL = bases.preco_venda * clampNonNegative(premissas.p_csll_estoque);
        const impostoIRPJ = baseIRPJ * clampNonNegative(premissas.a_irpj);
        const impostoCSLL = baseCSLL * clampNonNegative(premissas.a_csll);

        return {
            tipo: 'IRPJ_CSLL',
            imposto_total: impostoIRPJ + impostoCSLL,
            linhas: [
                {
                    label: 'IRPJ (estoque - presumido sobre receita)',
                    base: baseIRPJ,
                    aliquota: premissas.a_irpj,
                    imposto: impostoIRPJ,
                },
                {
                    label: 'CSLL (estoque - presumido sobre receita)',
                    base: baseCSLL,
                    aliquota: premissas.a_csll,
                    imposto: impostoCSLL,
                },
            ],
        };
    }

    const base = clampNonNegative(bases.ganho_pj);
    const impostoIRPJ = base * clampNonNegative(premissas.a_irpj);
    const impostoCSLL = base * clampNonNegative(premissas.a_csll);

    return {
        tipo: 'IRPJ_CSLL',
        imposto_total: impostoIRPJ + impostoCSLL,
        linhas: [
            {
                label: 'IRPJ (imobilizado/investimento sobre ganho)',
                base,
                aliquota: premissas.a_irpj,
                imposto: impostoIRPJ,
            },
            {
                label: 'CSLL (imobilizado/investimento sobre ganho)',
                base,
                aliquota: premissas.a_csll,
                imposto: impostoCSLL,
            },
        ],
    };
}

export function calcularSimulador(input: SimuladorInput, premissas: PremissasCalculo = PREMISSAS_DEFAULT): SimuladorResultado {
    const parametros = { ...PREMISSAS_DEFAULT, ...premissas };

    if (input.operacao === 'LOCACAO') {
        const locacao = calcularConsumoLocacao(input, parametros);
        const renda = calcularRendaLocacao(input, parametros, locacao.baseLocacao);
        const total = locacao.consumo.imposto + renda.imposto_total;

        return {
            operacao: input.operacao,
            perfil: input.perfil,
            enquadramento: locacao.enquadramento,
            consumo: locacao.consumo,
            renda,
            total,
            base_locacao: locacao.baseLocacao,
        };
    }

    const bases = calcularAlienacaoBases(input, parametros);
    const reducao = clampNonNegative(parametros.r_alien);
    const aliquotaEfetiva = parametros.t_nom * (1 - reducao);
    const consumoImposto = bases.margem_utilizada * aliquotaEfetiva;

    const renda = calcularRendaAlienacao(input, parametros, bases);
    const total = consumoImposto + renda.imposto_total;

    return {
        operacao: input.operacao,
        perfil: input.perfil,
        enquadramento: {
            aplica_consumo: true,
            status: 'ELEGIVEL',
            regra: 'Alienação enquadrada para incidência de IBS/CBS sobre margem ajustada.',
        },
        consumo: {
            base: bases.margem_utilizada,
            aliquota_nominal: parametros.t_nom,
            reducao,
            aliquota_efetiva: aliquotaEfetiva,
            imposto: consumoImposto,
            formula: 'T_cons_venda = Margem × t_alien',
        },
        renda,
        total,
        bases_alienacao: bases,
    };
}

export function calcularComparativos(input: SimuladorInput, premissas: PremissasCalculo = PREMISSAS_DEFAULT): ComparativosResultado {
    const perfilAlternativo: SimuladorPerfil = input.perfil === 'PF' ? 'PJ' : 'PF';
    const operacaoAlternativa: SimuladorOperacao = input.operacao === 'LOCACAO' ? 'ALIENACAO' : 'LOCACAO';

    const resultadoPerfilAlternativo = calcularSimulador(
        {
            ...input,
            perfil: perfilAlternativo,
            pf_acima_limite_legal: perfilAlternativo === 'PF' ? input.pf_acima_limite_legal : false,
        },
        premissas
    );

    const resultadoOperacaoAlternativa = calcularSimulador(
        {
            ...input,
            operacao: operacaoAlternativa,
        },
        premissas
    );

    return {
        perfil_alternativo: {
            perfil: perfilAlternativo,
            total: resultadoPerfilAlternativo.total,
        },
        operacao_alternativa: {
            operacao: operacaoAlternativa,
            total: resultadoOperacaoAlternativa.total,
        },
    };
}

export function criarItemRedutorAjuste(): RedutorAjusteItem {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        data_evento: '',
        tipo_evento: '',
        valor_evento: 0,
        fator_atualizacao: 1,
        elegivel: true,
    };
}

export function criarInputDefaultSimulador(): SimuladorInput {
    return {
        operacao: 'LOCACAO',
        perfil: 'PF',
        tipo_locacao: 'CONVENCIONAL',
        periodo_locacao: 'MENSAL',
        valor_locacao: 20000,
        pf_acima_limite_legal: false,
        valor_venda: 1000000,
        custo_aquisicao: 650000,
        despesas_elegiveis: 0,
        custos_capitalizaveis_pj: 0,
        natureza_bem_pj: 'IMOBILIZADO_INVESTIMENTO',
        redutor_ajuste_itens: [
            {
                id: 'seed-aquisicao',
                data_evento: '2023-01-01',
                tipo_evento: 'Aquisição',
                valor_evento: 650000,
                fator_atualizacao: 1,
                elegivel: true,
            },
        ],
        metodo_irpf_locacao: 'SIMPLIFICADO',
        irpf_locacao_informado: 0,
        aliquota_irpf_locacao_simplificada: PREMISSAS_DEFAULT.a_irpf_locacao_simplificada,
        metodo_irpf_venda: 'SIMPLIFICADO',
        irpf_venda_informado: 0,
        aliquota_irpf_venda_simplificada: PREMISSAS_DEFAULT.a_irpf_ganho_simplificada,
    };
}

// ── Simulador legado (mantido para compatibilidade) ────────

export function calcularSimulacao(input: SimulacaoInput): SimulacaoResult {
    const { valorImovel, operacao, isLocacaoResidencial, isContratoExistente } = input;

    let redutorKey: keyof typeof REDUTORES = 'VENDA';
    if (operacao === 'LOCACAO' || operacao === 'PESSOA_FISICA') {
        redutorKey = 'LOCACAO';
    } else if (operacao === 'INCORPORACAO') {
        redutorKey = 'INCORPORACAO';
    }

    const redutor = REDUTORES[redutorKey].percentual;
    const aliquotaEfetiva = ALIQUOTA_PADRAO_ESTIMADA * (1 - redutor);
    const valorCBSIBS = valorImovel * aliquotaEfetiva;

    const result: SimulacaoResult = {
        aliquotaPadrao: ALIQUOTA_PADRAO_ESTIMADA,
        redutor,
        aliquotaEfetiva,
        valorCBSIBS,
    };

    if ((operacao === 'LOCACAO' || operacao === 'PESSOA_FISICA') && isLocacaoResidencial) {
        result.redutorSocial = REDUTOR_SOCIAL.valor;
    }

    if ((operacao === 'LOCACAO' || operacao === 'PESSOA_FISICA') && isContratoExistente) {
        result.regimeTransicao = {
            aliquota: REGIME_TRANSICAO_LOCACAO.aliquota,
            valorTransicao: valorImovel * REGIME_TRANSICAO_LOCACAO.aliquota,
        };
    }

    return result;
}

// ── Fetch de Notícias do Supabase ──────────────────────────

export async function getNoticiasImobiliarias(): Promise<NoticiaImobiliaria[]> {
    if (supabase) {
        const { data, error } = await supabase
            .from('legal_references')
            .select('*')
            .contains('tags', ['IMOBILIARIO'])
            .order('publication_date', { ascending: false })
            .limit(10);

        if (!error && data && data.length > 0) {
            return data as NoticiaImobiliaria[];
        }

        const { data: data2, error: error2 } = await supabase
            .from('legal_references')
            .select('*')
            .or('title.ilike.%imobili%,title.ilike.%locação%,title.ilike.%NF ABI%,title.ilike.%incorpora%')
            .order('publication_date', { ascending: false })
            .limit(10);

        if (!error2 && data2 && data2.length > 0) {
            return data2 as NoticiaImobiliaria[];
        }

        if (error) console.error('Imobiliário Service Error:', error);
    }

    return FALLBACK_NOTICIAS;
}

// ── Dados oficiais de fallback ─────────────────────────────

const FALLBACK_NOTICIAS: NoticiaImobiliaria[] = [
    {
        id: 'imob-1',
        title: 'LC 214/2025, Regime Específico para Operações Imobiliárias',
        source_type: 'DOU',
        publication_date: '2025-01-16',
        summary: 'Redutor de 50% para vendas e 70% para locações sobre a alíquota padrão de IBS/CBS. Regime de transição para contratos existentes com alíquota de 3,65%.',
        tags: ['IMOBILIARIO', 'CBS', 'IBS'],
        full_text_url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm',
    },
    {
        id: 'imob-2',
        title: 'NF ABI, Nova Nota Fiscal de Alienação de Bens Imóveis',
        source_type: 'RFB',
        publication_date: '2026-01-15',
        summary: 'Obrigatória a partir de 2026 para incorporadoras, construtoras, loteadoras, imobiliárias e PFs contribuintes. Abrange vendas, locações, permutas e arrendamentos.',
        tags: ['IMOBILIARIO', 'NF ABI', 'OBRIGACOES'],
        full_text_url: 'https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/fevereiro/nf-abi',
    },
    {
        id: 'imob-3',
        title: 'Regime de Transição para Contratos de Locação (Art. 487)',
        source_type: 'DOU',
        publication_date: '2025-01-16',
        summary: 'Contribuintes podem optar por alíquota total de 3,65% sobre receita bruta para contratos firmados antes da LC 214. Exige registro em cartório ou disponibilização digital.',
        tags: ['IMOBILIARIO', 'TRANSICAO', 'LOCACAO'],
        full_text_url: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm',
    },
    {
        id: 'imob-4',
        title: 'PF como Contribuinte de IBS/CBS em Operações Imobiliárias',
        source_type: 'RFB',
        publication_date: '2025-03-10',
        summary: 'Pessoa física com receita de locação acima de R$ 240.000/ano e mais de 3 imóveis se enquadra como contribuinte, devendo emitir NF ABI e apurar CBS/IBS.',
        tags: ['IMOBILIARIO', 'PESSOA_FISICA', 'CBS', 'IBS'],
    },
    {
        id: 'imob-5',
        title: 'RFB Publica Orientações sobre Créditos na Construção Civil',
        source_type: 'RFB',
        publication_date: '2026-02-10',
        summary: 'Esclarecimentos sobre a não cumulatividade plena: todos os insumos de construção (materiais, serviços de terceiros) geram crédito de CBS e IBS.',
        tags: ['IMOBILIARIO', 'CREDITOS', 'CONSTRUCAO'],
    },
];
