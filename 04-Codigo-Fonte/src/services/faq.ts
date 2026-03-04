/**
 * faq.ts Dados do módulo de Perguntas e Respostas sobre a Reforma Tributária
 *
 * Fonte oficial: Ministério da Fazenda
 * https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria/arquivos/perguntas-e-respostas-reforma-tributaria_.pdf
 */

export type FAQCategory =
    | 'GERAL'
    | 'CBS_IBS'
    | 'IMPOSTO_SELETIVO'
    | 'TRANSICAO'
    | 'IMOBILIARIO'
    | 'CREDITOS'
    | 'SIMPLES'
    | 'SERVICOS';

export type FAQItem = {
    id: string;
    category: FAQCategory;
    question: string;
    answer: string;
    tags: string[];
    source: string;
};

export type FAQCategoryIcon =
    | 'CLIPBOARD'
    | 'LANDMARK'
    | 'SHIELD'
    | 'CALENDAR'
    | 'HOME'
    | 'COINS'
    | 'STORE'
    | 'BRIEFCASE';

export const FAQ_CATEGORIES: Record<FAQCategory, { label: string; description: string; icon: FAQCategoryIcon }> = {
    GERAL: {
        label: 'Visão Geral',
        description: 'Fundamentos e objetivos da reforma',
        icon: 'CLIPBOARD'
    },
    CBS_IBS: {
        label: 'CBS e IBS',
        description: 'Os novos tributos sobre consumo',
        icon: 'LANDMARK'
    },
    IMPOSTO_SELETIVO: {
        label: 'Imposto Seletivo',
        description: 'Tributação de bens prejudiciais',
        icon: 'SHIELD'
    },
    TRANSICAO: {
        label: 'Período de Transição',
        description: 'Cronograma e fases de implementação',
        icon: 'CALENDAR'
    },
    IMOBILIARIO: {
        label: 'Setor Imobiliário',
        description: 'Impacto em imóveis, aluguéis e construção',
        icon: 'HOME'
    },
    CREDITOS: {
        label: 'Créditos e Devoluções',
        description: 'Cashback e não cumulatividade',
        icon: 'COINS'
    },
    SIMPLES: {
        label: 'Simples Nacional',
        description: 'Impacto em micro e pequenas empresas',
        icon: 'STORE'
    },
    SERVICOS: {
        label: 'Serviços',
        description: 'Impacto no setor de serviços',
        icon: 'BRIEFCASE'
    },
};

export const FAQ_SOURCE_URL = 'https://www.gov.br/fazenda/pt-br/acesso-a-informacao/acoes-e-programas/reforma-tributaria/arquivos/perguntas-e-respostas-reforma-tributaria_.pdf';

export function getFAQItems(): FAQItem[] {
    return [
        // GERAL
        {
            id: 'g1',
            category: 'GERAL',
            question: 'O que é a Reforma Tributária do Consumo?',
            answer: 'A Reforma Tributária do Consumo foi aprovada pela Emenda Constitucional nº 132/2023 e regulamentada pela Lei Complementar nº 214/2025. Na prática, ela substitui cinco tributos que existem hoje (PIS, Cofins, IPI, ICMS e ISS) por três novos: a CBS, o IBS e o Imposto Seletivo. O objetivo central é simplificar o sistema, acabar com a cumulatividade de impostos ao longo da cadeia produtiva, eliminar a guerra fiscal entre estados e municípios e deixar a tributação mais transparente para o consumidor.',
            tags: ['EC 132', 'LC 214', 'CBS', 'IBS', 'IS'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'g2',
            category: 'GERAL',
            question: 'Quais tributos serão extintos com a reforma?',
            answer: 'Cinco tributos deixarão de existir. No âmbito federal, saem o PIS (Programa de Integração Social), a Cofins (Contribuição para o Financiamento da Seguridade Social) e o IPI (Imposto sobre Produtos Industrializados). No âmbito estadual, sai o ICMS (Imposto sobre Circulação de Mercadorias e Serviços). E no municipal, o ISS (Imposto Sobre Serviços). Todos eles serão substituídos pela CBS (federal), pelo IBS (estadual e municipal) e pelo Imposto Seletivo (federal).',
            tags: ['PIS', 'Cofins', 'IPI', 'ICMS', 'ISS'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'g3',
            category: 'GERAL',
            question: 'Qual é a alíquota prevista para os novos tributos?',
            answer: 'A alíquota de referência estimada é de 26,5%, dividida entre a CBS (parte federal) e o IBS (parte estadual e municipal). Essa é a alíquota padrão, que vale para a maioria dos bens e serviços. Porém, diversos setores contam com reduções de 30%, 60% ou até isenção total. É o caso de saúde, educação, alimentos da cesta básica, transporte coletivo e produção rural, por exemplo. Ou seja, a alíquota efetiva varia bastante conforme o tipo de produto ou serviço.',
            tags: ['alíquota', '26,5%', 'redução'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'g4',
            category: 'GERAL',
            question: 'A carga tributária vai aumentar com a reforma?',
            answer: 'Não. A reforma foi pensada para ser neutra em termos de arrecadação. Isso quer dizer que o total arrecadado pelo governo não deve crescer nem diminuir. O que muda é como essa carga se distribui. Alguns setores que hoje pagam menos, por conta de benefícios fiscais acumulados, podem passar a pagar mais. Já setores que sofrem com a cumulatividade tendem a ter a carga reduzida. Além disso, existe uma trava constitucional: se a arrecadação superar a média histórica, as alíquotas precisam ser ajustadas para baixo.',
            tags: ['carga tributária', 'neutralidade', 'trava'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'g5',
            category: 'GERAL',
            question: 'O que muda para o consumidor final?',
            answer: 'A mudança mais visível é a transparência. O valor exato dos tributos que incidem sobre cada produto ou serviço vai aparecer discriminado na nota fiscal. Além disso, foi criado o mecanismo de cashback, que devolve parte dos tributos a famílias de baixa renda inscritas no CadÚnico, especialmente sobre itens essenciais como gás de cozinha, energia elétrica, água e esgoto. A cesta básica nacional também será isenta de CBS e IBS.',
            tags: ['consumidor', 'transparência', 'cashback', 'cesta básica'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'g6',
            category: 'GERAL',
            question: 'Quando devo buscar orientação jurídica especializada?',
            answer: 'Para decisões com impacto financeiro, patrimonial ou societário, a recomendação é buscar advogado especialista. Este sistema foi criado e desenvolvido por uma advogada tributarista. Toda a curadoria das informações é feita pela advogada Brenda Ibiapina OAB/DF 83.671. Para atendimento e orientações, acesse o Instagram @brendaibiapina em https://instagram.com/brendaibiapina.',
            tags: ['orientação jurídica', 'advogada', 'Brenda Ibiapina', 'Instagram'],
            source: 'Atlas'
        },

        // CBS e IBS
        {
            id: 'ci1',
            category: 'CBS_IBS',
            question: 'Qual a diferença entre CBS e IBS?',
            answer: 'A CBS é a Contribuição sobre Bens e Serviços, de competência federal. Ela substitui o PIS, a Cofins e, parcialmente, o IPI. Já o IBS é o Imposto sobre Bens e Serviços, compartilhado entre estados e municípios, que entra no lugar do ICMS e do ISS. Embora tenham bases de cálculo idênticas e funcionem de forma coordenada, cada um possui sua própria alíquota e destinação. Ambos são não cumulativos, cobrados "por fora" do preço e incidem no destino, ou seja, no local onde o consumo acontece.',
            tags: ['CBS', 'IBS', 'federal', 'subnacional'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'ci2',
            category: 'CBS_IBS',
            question: 'O que significa "tributação no destino"?',
            answer: 'Na tributação no destino, o imposto é recolhido no local onde o bem ou serviço é efetivamente consumido, e não onde é produzido. Isso acaba com a guerra fiscal entre estados, porque não adianta mais oferecer benefícios para atrair fábricas. O tributo será sempre devido no estado ou município do consumidor. Essa mudança é gradual e a redistribuição das receitas entre os entes federativos acontece ao longo de 50 anos.',
            tags: ['destino', 'guerra fiscal', 'transição'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'ci3',
            category: 'CBS_IBS',
            question: 'Como funciona a não cumulatividade plena?',
            answer: 'A não cumulatividade plena garante que todo imposto pago nas etapas anteriores da cadeia produtiva pode ser creditado. Diferente do sistema atual, onde há diversas restrições de crédito, no novo modelo tudo o que a empresa adquire para sua atividade gera crédito: insumos, bens de capital, serviços, material de escritório e assim por diante. O crédito é financeiro e pode ser usado para abater o imposto devido. Se sobrar saldo credor, a empresa pode pedir o ressarcimento em dinheiro.',
            tags: ['crédito', 'não cumulatividade', 'ressarcimento'],
            source: 'Ministério da Fazenda'
        },

        // IMPOSTO SELETIVO
        {
            id: 'is1',
            category: 'IMPOSTO_SELETIVO',
            question: 'O que é o Imposto Seletivo?',
            answer: 'O Imposto Seletivo é um tributo federal que incide sobre bens e serviços considerados prejudiciais à saúde ou ao meio ambiente, o chamado "imposto do pecado". Ele substitui parcialmente o IPI e tem caráter extrafiscal, ou seja, o objetivo principal não é arrecadar, mas desestimular o consumo de determinados produtos. Incide sobre cigarros e tabaco, bebidas alcoólicas, bebidas açucaradas, veículos poluentes, embarcações e aeronaves de uso particular e também sobre a atividade de mineração.',
            tags: ['IS', 'extrafiscal', 'tabaco', 'bebidas'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'is2',
            category: 'IMPOSTO_SELETIVO',
            question: 'O Imposto Seletivo incide sobre armas e munições?',
            answer: 'Não. Embora tenha havido proposta nesse sentido durante a tramitação, armas e munições foram excluídas da incidência do Imposto Seletivo. O tributo alcança apenas produtos de tabaco, bebidas alcoólicas, bebidas açucaradas, veículos (conforme a emissão de CO₂), embarcações e aeronaves de uso particular, e a extração de recursos minerais como minério de ferro, petróleo e gás natural.',
            tags: ['armas', 'IS', 'incidência'],
            source: 'Ministério da Fazenda'
        },

        // TRANSIÇÃO
        {
            id: 't1',
            category: 'TRANSICAO',
            question: 'Quando a reforma começa a valer?',
            answer: 'A implementação é gradual. Em 2026, a CBS entra em "ano de teste" com alíquota simbólica de 0,9% e o IBS com 0,1%, ambos sem recolhimento efetivo, apenas para testar os sistemas. A partir de 2027, a CBS passa a valer integralmente, substituindo o PIS e a Cofins. O IBS cresce de forma gradual entre 2029 e 2032, enquanto ICMS e ISS são reduzidos na mesma proporção. Em 2033, os tributos antigos deixam de existir e o novo sistema opera de forma plena.',
            tags: ['2026', '2027', '2033', 'cronograma'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 't2',
            category: 'TRANSICAO',
            question: 'O que acontece em 2026? Já preciso me adaptar?',
            answer: 'Sim. Mesmo sendo um ano de teste, já existem obrigações acessórias que precisam ser cumpridas. As empresas devem se cadastrar no DTE RTC (Domicílio Tributário Eletrônico), preencher a DeRE (Declaração de Regimes Específicos) quando aplicável e emitir notas fiscais eletrônicas com os campos de CBS e IBS preenchidos. Embora a alíquota seja de teste e não haja recolhimento efetivo, o descumprimento das obrigações de registro e declaração pode gerar penalidades.',
            tags: ['2026', 'DTE RTC', 'DeRE', 'NFe', 'obrigações'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 't3',
            category: 'TRANSICAO',
            question: 'Qual é o cronograma completo da transição?',
            answer: 'Em 2023 foi aprovada a Emenda Constitucional 132. Em 2025 veio a regulamentação pela LC 214 e, em 2026, a LC 227 criou o Comitê Gestor do IBS. O ano de 2026 é o período de teste, com CBS a 0,9% e IBS a 0,1%, sem recolhimento, além do cadastro obrigatório no DTE RTC. Em 2027 a CBS passa a ser obrigatória, substituindo PIS e Cofins, e o IPI é zerado (exceto para a Zona Franca de Manaus). Entre 2029 e 2032 o IBS cresce gradualmente enquanto ICMS e ISS são reduzidos a cada ano. Em 2033, o sistema novo entra em operação plena e os tributos antigos são definitivamente extintos. A redistribuição de receitas entre estados e municípios segue até 2077, num período de transição de 50 anos.',
            tags: ['cronograma', 'marcos'],
            source: 'Ministério da Fazenda'
        },

        // IMOBILIÁRIO
        {
            id: 'im1',
            category: 'IMOBILIARIO',
            question: 'Como a reforma afeta o setor imobiliário?',
            answer: 'Operações imobiliárias como venda, locação e cessão de direitos passam a ser tributadas pela CBS e IBS, mas com uma redução de 50% na alíquota padrão, o que resulta em uma alíquota efetiva estimada de aproximadamente 13,25%. Para locação e venda de imóveis residenciais a pessoas físicas, dentro de determinados valores, há uma redução adicional de 70%, levando a alíquota efetiva para cerca de 7,95%. É importante destacar que pessoa física só se torna contribuinte se possuir mais de três imóveis para aluguel e tiver receita anual de aluguel acima de R$ 240 mil.',
            tags: ['imobiliário', 'alíquota', 'locação', 'PF'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'im2',
            category: 'IMOBILIARIO',
            question: 'Pessoa física que aluga imóvel vai ter que pagar CBS e IBS?',
            answer: 'Nem toda pessoa física. Só será considerada contribuinte a pessoa física que atender, ao mesmo tempo, a duas condições: possuir mais de três imóveis destinados a aluguel ou cessão e ter receita bruta anual de aluguéis superior a R$ 240 mil. Se atender essas duas condições, precisará apurar e recolher CBS e IBS sobre os valores recebidos de aluguel. Quem não atinge esses limites não é afetado pela reforma nesse aspecto.',
            tags: ['PF', 'aluguel', 'R$ 240 mil', '3 imóveis'],
            source: 'Ministério da Fazenda'
        },

        // CRÉDITOS e CASHBACK
        {
            id: 'cr1',
            category: 'CREDITOS',
            question: 'O que é o cashback tributário?',
            answer: 'O cashback tributário é a devolução de parte dos tributos (CBS e IBS) pagos por famílias de baixa renda inscritas no CadÚnico com renda per capita de até meio salário mínimo. A devolução acontece de forma automática e varia conforme o produto: 100% da CBS no gás de cozinha, 50% da CBS em energia elétrica, água e esgoto, e 20% da CBS e do IBS nos demais itens consumidos. O pagamento é feito via PIX ou conta bancária do responsável pela família.',
            tags: ['cashback', 'CadÚnico', 'baixa renda', 'PIX'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'cr2',
            category: 'CREDITOS',
            question: 'Como funciona o sistema de créditos para empresas?',
            answer: 'As empresas poderão creditar todos os tributos (CBS e IBS) pagos nas aquisições de bens e serviços usados na atividade. Isso inclui bens de capital, energia, telecomunicações e despesas gerais, algo que não acontece no sistema atual. O crédito é financeiro e fica vinculado ao documento fiscal de compra. Se a empresa tiver mais créditos do que débitos em determinado período, pode pedir o ressarcimento em dinheiro, que deve ser pago em até 60 dias. Esse mecanismo resolve o problema histórico de acúmulo de créditos sem possibilidade de uso.',
            tags: ['crédito', 'ressarcimento', '60 dias', 'bens de capital'],
            source: 'Ministério da Fazenda'
        },

        // SIMPLES NACIONAL
        {
            id: 'sn1',
            category: 'SIMPLES',
            question: 'O Simples Nacional continua existindo?',
            answer: 'Sim. Empresas do Simples Nacional podem continuar recolhendo CBS e IBS dentro do regime simplificado, pelo DAS, com as mesmas faixas e alíquotas de hoje. Nesse caso, porém, não geram créditos integrais para seus clientes, apenas o valor efetivamente recolhido. Como alternativa, a empresa pode optar por apurar CBS e IBS de forma separada, fora do DAS. Assim, passa a gerar créditos plenos, o que pode ser vantajoso quando a maioria dos clientes é pessoa jurídica e deseja aproveitar os créditos.',
            tags: ['Simples', 'DAS', 'crédito', 'optante'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'sn2',
            category: 'SIMPLES',
            question: 'O MEI será atingido pela reforma?',
            answer: 'O MEI (Microempreendedor Individual) continua existindo e mantém seu regime diferenciado. O impacto tende a ser mínimo. O MEI seguirá recolhendo pelo DAS simplificado. A principal mudança prática é que será preciso emitir documentos fiscais com os novos campos de CBS e IBS, adaptando o preenchimento às obrigações acessórias do novo sistema. As regras específicas para o MEI no contexto dos novos tributos serão definidas em regulamentação complementar.',
            tags: ['MEI', 'DAS', 'microempreendedor'],
            source: 'Ministério da Fazenda'
        },

        // SERVIÇOS
        {
            id: 'sv1',
            category: 'SERVICOS',
            question: 'Os serviços vão pagar mais imposto?',
            answer: 'Depende da situação de cada empresa. Hoje muitos serviços pagam ISS de 2% a 5%. Com a reforma, a alíquota padrão de CBS e IBS fica em torno de 26,5%. No entanto, há dois fatores que atenuam o impacto. Primeiro, com a não cumulatividade plena, empresas de serviço passam a creditar todos os insumos da atividade (aluguel, equipamentos, software, energia e outros), o que não acontece hoje. Segundo, setores específicos contam com redução de alíquota: saúde e educação têm 60% de desconto, e profissionais liberais regulamentados têm 30%. O impacto real vai depender da estrutura de custos de cada empresa.',
            tags: ['serviços', 'ISS', 'alíquota', 'créditos'],
            source: 'Ministério da Fazenda'
        },
        {
            id: 'sv2',
            category: 'SERVICOS',
            question: 'Profissionais liberais terão tratamento diferenciado?',
            answer: 'Sim. Profissionais liberais regulamentados, como advogados, médicos, engenheiros, contadores e arquitetos, cujas atividades são reguladas por lei federal, contam com uma redução de 30% na alíquota padrão de CBS e IBS. Na prática, em vez de pagar algo próximo de 26,5%, a alíquota efetiva fica em torno de 18,55%. Essa redução vale tanto para profissionais autônomos (pessoa física como contribuinte habitual) quanto para sociedades uniprofissionais.',
            tags: ['liberal', 'advogado', 'médico', '30% redução'],
            source: 'Ministério da Fazenda'
        },
    ];
}
