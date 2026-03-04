'use client';

import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/Badge';
import SimuladorImobiliario from '@/components/dashboard/SimuladorImobiliario';
import {
    Building, Home, TrendingDown, FileText, Users,
    AlertTriangle, Info, ChevronDown, ChevronUp,
    ExternalLink, Scale, Shield, Check
} from 'lucide-react';
import {
    REDUTORES, REDUTOR_SOCIAL, REGIME_TRANSICAO_LOCACAO, NF_ABI,
    REGRAS_PESSOA_FISICA, getNoticiasImobiliarias,
    type OperationType, type NoticiaImobiliaria
} from '@/services/imobiliario';

type TabConfig = { key: OperationType; label: string; icon: React.ReactNode };

const TABS: TabConfig[] = [
    { key: 'VENDA', label: 'Compra e Venda', icon: <Home size={16} /> },
    { key: 'LOCACAO', label: 'Locação', icon: <Building size={16} /> },
    { key: 'INCORPORACAO', label: 'Incorporação', icon: <Scale size={16} /> },
    { key: 'PESSOA_FISICA', label: 'Pessoa Física', icon: <Users size={16} /> },
];

interface RegrasContent {
    titulo: string;
    subtitulo: string;
    antes: { label: string; items: string[] };
    depois: { label: string; items: string[] };
    obrigacoes: string[];
    alertas: { tipo: 'info' | 'warning'; texto: string }[];
    artigos: string[];
}

const CONTEUDO: Record<OperationType, RegrasContent> = {
    VENDA: {
        titulo: 'Compra e Venda de Imóveis',
        subtitulo: 'Alienações e transmissões onerosas de bens imóveis',
        antes: { label: 'Regime Atual', items: ['PIS/COFINS: 3,65% (cumulativo) ou 9,25% (não-cumulativo)', 'ITBI: 2% a 4% (municipal, mantido)', 'IRPJ/CSLL sobre o lucro', 'Complexidade: múltiplos tributos e regimes'] },
        depois: { label: 'Com a Reforma (CBS + IBS)', items: [`Redutor de ${REDUTORES.VENDA.label} sobre a alíquota padrão`, 'Alíquota efetiva estimada: ~14%', 'ITBI: continua existindo (tributo municipal independente)', 'Não-cumulatividade plena: crédito sobre todos os insumos', 'NF ABI obrigatória para toda alienação'] },
        obrigacoes: ['Emissão de NF ABI (Nota Fiscal de Alienação de Bens Imóveis)', 'Apuração de CBS e IBS sobre o valor da operação', 'Manutenção de escrituração fiscal digital'],
        alertas: [{ tipo: 'info', texto: 'O ITBI (municipal) continua existindo e não é substituído pela CBS/IBS.' }, { tipo: 'warning', texto: 'A não cumulatividade permite crédito sobre materiais de construção, serviços de terceiros e demais insumos, mas requer controle rigoroso de NFs.' }],
        artigos: ['LC 214/2025, Regime específico de operações imobiliárias', 'EC 132/2023, Art. 156-A, §1º, VII'],
    },
    LOCACAO: {
        titulo: 'Locação de Imóveis',
        subtitulo: 'Locação, cessão onerosa e arrendamento de bens imóveis',
        antes: { label: 'Regime Atual', items: ['ISS: 2% a 5% sobre o aluguel (municipal)', 'PIS/COFINS: 3,65% (cumulativo) para PJ', 'Sem nota fiscal obrigatória para PF', 'Tributação fragmentada entre estados e municípios'] },
        depois: { label: 'Com a Reforma (CBS + IBS)', items: [`Redutor de ${REDUTORES.LOCACAO.label} sobre a alíquota padrão, o maior redutor!`, 'Alíquota efetiva estimada: ~8,4%', `Redutor social: ${REDUTOR_SOCIAL.descricao}`, `Regime de transição (Art. 487): opção por ${REGIME_TRANSICAO_LOCACAO.label} para contratos existentes`, 'NF ABI obrigatória, inclusive para PFs contribuintes'] },
        obrigacoes: ['Emissão de NF ABI para cada contrato de locação', 'Apuração mensal de CBS e IBS', 'Registro do contrato em cartório OU disponibilização digital à RFB'],
        alertas: [{ tipo: 'info', texto: 'Redutor social de R$ 600/imóvel é deduzido da base de cálculo na locação residencial.' }, { tipo: 'warning', texto: 'O regime de transição (3,65%) só é válido para contratos firmados ANTES da publicação da LC 214/2025, com registro formal.' }],
        artigos: ['LC 214/2025, Art. 487 (regime de transição)', 'LC 214/2025, Redutor de 70%', 'LC 214/2025, Redutor social'],
    },
    INCORPORACAO: {
        titulo: 'Incorporação Imobiliária',
        subtitulo: 'Construção civil, loteamentos e incorporações',
        antes: { label: 'Regime Atual', items: ['RET (Regime Especial de Tributação): ~4% unificado', 'Lucro Presumido: ~6,73% efetivo', 'PIS/COFINS + IRPJ/CSLL + ISS', 'Créditos limitados no regime cumulativo'] },
        depois: { label: 'Com a Reforma (CBS + IBS)', items: [`Redutor de ${REDUTORES.INCORPORACAO.label} sobre a alíquota padrão`, 'Alíquota efetiva estimada: ~14%', 'RET não se aplica mais, regime único CBS/IBS', 'Não-cumulatividade plena: TODOS os insumos geram crédito', 'DeRE (Declaração de Regime Específico) obrigatória'] },
        obrigacoes: ['DeRE, Declaração de Regime Específico para incorporações', 'NF ABI para cada unidade vendida / alienada', 'Controle de créditos sobre materiais e serviços', 'Adaptação de sistemas para emissão CBS/IBS'],
        alertas: [{ tipo: 'warning', texto: 'Incorporadoras que usam RET (4%) podem ter aumento nominal, mas a não cumulatividade plena pode compensar dependendo dos créditos.' }, { tipo: 'info', texto: 'Materiais, mão de obra terceirizada, projetos de engenharia, tudo gera crédito no novo regime.' }],
        artigos: ['LC 214/2025, Incorporação imobiliária', 'LC 214/2025, DeRE', 'EC 132/2023, Regime diferenciado'],
    },
    PESSOA_FISICA: {
        titulo: 'Pessoa Física como Contribuinte',
        subtitulo: 'Quando a PF se torna contribuinte de IBS e CBS',
        antes: { label: 'Regime Atual', items: ['IRPF sobre o aluguel (carnê-leão)', 'Sem obrigação de emitir nota fiscal', 'Isenção de PIS/COFINS para PF', 'Apenas Imposto de Renda sobre rendimentos'] },
        depois: { label: 'Com a Reforma (CBS + IBS)', items: [`PF é contribuinte quando: receita > ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(REGRAS_PESSOA_FISICA.limiteReceitaAnual)}/ano E > ${REGRAS_PESSOA_FISICA.limiteImoveis} imóveis`, 'Mesma tributação que PJ (CBS + IBS com redutor de 70%)', 'NF ABI obrigatória', 'Venda de múltiplos imóveis/ano também pode enquadrar', 'DeRE pode ser exigida'] },
        obrigacoes: [...REGRAS_PESSOA_FISICA.obrigacoes, 'Inscrição como contribuinte de IBS/CBS', 'Apuração mensal e pagamento de CBS e IBS'],
        alertas: [{ tipo: 'warning', texto: 'PF com receita de locação acima de R$ 240.000/ano e mais de 3 imóveis será automaticamente enquadrada.' }, { tipo: 'info', texto: 'A PF contribuinte tem direito aos mesmos benefícios, redutor de 70% e redutor social de R$ 600/imóvel.' }],
        artigos: ['LC 214/2025, PF como contribuinte', 'LC 214/2025, Critérios de enquadramento'],
    },
};

export default function RealEstatePage() {
    const [activeTab, setActiveTab] = useState<OperationType>('VENDA');
    const [noticias, setNoticias] = useState<NoticiaImobiliaria[]>([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);

    useEffect(() => {
        getNoticiasImobiliarias().then(setNoticias).catch(() => setNoticias([])).finally(() => setLoadingNoticias(false));
    }, []);

    const conteudo = CONTEUDO[activeTab];

    return (
        <div className="space-y-7 stagger-children">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-atlas-petrol/[0.12] border border-atlas-petrol/26 flex items-center justify-center">
                        <Building size={18} className="text-atlas-petrol" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep">Módulo Imobiliário</h1>
                        <p className="text-atlas-petrol-deep text-sm">Impactos da Reforma Tributária no setor imobiliário, LC 214/2025</p>
                    </div>
                </div>
                <a href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-semibold text-atlas-petrol-deep bg-white px-3 py-2 rounded-xl border border-atlas-petrol/30 hover:bg-[#f8f5ed] transition-colors whitespace-nowrap">
                    <ExternalLink size={12} /> Fonte: LC 214/2025
                </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<TrendingDown size={18} />} label="Redutor Venda" value={REDUTORES.VENDA.label} sublabel="sobre alíquota padrão" color="gold" />
                <StatCard icon={<Home size={18} />} label="Redutor Locação" value={REDUTORES.LOCACAO.label} sublabel="o maior redutor" color="emerald" />
                <StatCard icon={<Shield size={18} />} label="Redutor Social" value={`R$ ${REDUTOR_SOCIAL.valor}`} sublabel="por imóvel residencial" color="blue" />
                <StatCard icon={<FileText size={18} />} label="NF ABI" value="Obrigatória" sublabel="a partir de 2026" color="red" />
            </div>

            {/* Tabs */}
            <div className="flex gap-1 border-b border-atlas-petrol/26 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${activeTab === tab.key
                            ? 'border-atlas-petrol text-atlas-petrol-deep bg-white'
                            : 'border-transparent text-atlas-petrol-deep hover:text-atlas-petrol-deep hover:bg-white'
                            }`}>
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6 animate-fade-in">
                <div>
                    <h2 className="text-lg font-bold text-atlas-petrol-deep">{conteudo.titulo}</h2>
                    <p className="text-sm text-atlas-petrol-deep">{conteudo.subtitulo}</p>
                </div>

                {/* Before × After */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-atlas-petrol/26 bg-white p-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-atlas-petrol-deep mb-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-atlas-petrol/35"></span>
                            {conteudo.antes.label}
                        </h3>
                        <ul className="space-y-2">
                            {conteudo.antes.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-atlas-petrol-deep">
                                    <span className="text-atlas-petrol-deep mt-0.5">▸</span><span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-atlas-verdant/35 bg-white p-5">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-atlas-petrol-deep mb-3 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-atlas-petrol"></span>
                            {conteudo.depois.label}
                        </h3>
                        <ul className="space-y-2">
                            {conteudo.depois.items.map((item, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-atlas-petrol-deep">
                                    <Check size={14} className="text-atlas-petrol flex-shrink-0 mt-0.5" /><span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Obrigações */}
                <div className="rounded-2xl border border-atlas-petrol/22 bg-white/95 shadow-sm p-5">
                    <h3 className="text-sm font-bold text-atlas-petrol-deep mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-atlas-petrol" /> Obrigações Acessórias
                    </h3>
                    <ul className="space-y-2">
                        {conteudo.obrigacoes.map((ob, i) => (
                            <li key={i} className="flex items-center gap-2.5 text-sm text-atlas-petrol-deep">
                                <span className="w-1.5 h-1.5 rounded-full bg-atlas-petrol/40"></span>{ob}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Alerts */}
                {conteudo.alertas.map((alerta, i) => (
                    <div key={i} className={`rounded-2xl border p-4 flex items-start gap-3 ${alerta.tipo === 'warning'
                        ? 'bg-white border-atlas-gold/35' : 'bg-white border-atlas-verdant/35'
                        }`}>
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${alerta.tipo === 'warning' ? 'bg-atlas-gold/20' : 'bg-atlas-verdant/15'}`}>
                            {alerta.tipo === 'warning' ? <AlertTriangle size={14} className="text-atlas-gold-dark" /> : <Info size={14} className="text-atlas-verdant" />}
                        </div>
                        <p className={`text-sm leading-relaxed ${alerta.tipo === 'warning' ? 'text-atlas-petrol-deep' : 'text-atlas-petrol-deep'}`}>{alerta.texto}</p>
                    </div>
                ))}

                {/* Legal refs */}
                <div className="flex flex-wrap gap-2">
                    {conteudo.artigos.map((art, i) => (
                        <span key={i} className="text-[11px] px-3 py-1.5 rounded-xl bg-white text-atlas-petrol-deep border border-atlas-petrol/30 font-semibold">{art}</span>
                    ))}
                </div>
            </div>

            <SimuladorImobiliario />
            <NFABI_Section />

            {/* News Feed */}
            <div className="rounded-2xl border border-atlas-petrol/22 bg-white shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-atlas-petrol/20">
                    <h3 className="font-bold text-atlas-petrol-deep">Atualizações do Setor Imobiliário</h3>
                    <p className="text-xs text-atlas-petrol-deep mt-0.5">Normas e orientações relevantes</p>
                </div>
                <div className="divide-y divide-atlas-petrol/8">
                    {loadingNoticias ? (
                        <div className="p-8 text-center text-sm text-atlas-petrol/68">Carregando...</div>
                    ) : noticias.length === 0 ? (
                        <div className="p-8 text-center text-sm text-atlas-petrol/68">Nenhuma atualização encontrada.</div>
                    ) : (
                        noticias.map((noticia, i) => (
                            <div key={noticia.id} className="flex gap-4 p-5 hover:bg-[#f8f5ed] transition-colors group animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold ${noticia.source_type === 'DOU' ? 'bg-atlas-verdant-soft text-atlas-verdant' :
                                        noticia.source_type === 'RFB' ? 'bg-white border border-atlas-petrol/30 text-atlas-petrol-deep' :
                                            'bg-white border border-atlas-petrol/30 text-atlas-petrol-deep'
                                    }`}>{noticia.source_type.substring(0, 3)}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-atlas-petrol-deep text-sm group-hover:text-atlas-petrol transition-colors">{noticia.title}</h4>
                                    <p className="text-sm text-atlas-petrol-deep mt-1 line-clamp-2">{noticia.summary}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className="text-[11px] text-atlas-petrol/82">{new Date(noticia.publication_date).toLocaleDateString('pt-BR')}</span>
                                        {noticia.tags.slice(0, 3).map((tag: string) => (
                                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-lg bg-white text-atlas-petrol-deep border border-atlas-petrol/30 font-semibold">{tag}</span>
                                        ))}
                                        {noticia.full_text_url && (
                                            <a href={noticia.full_text_url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-atlas-petrol hover:underline flex items-center gap-0.5 transition-colors">
                                                <ExternalLink size={10} /> Fonte
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sublabel, color }: { icon: React.ReactNode; label: string; value: string; sublabel: string; color: string }) {
    const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
        gold: { bg: 'bg-white', border: 'border-atlas-gold/35', text: 'text-atlas-petrol-deep', icon: 'bg-atlas-gold/15 text-atlas-gold-dark' },
        emerald: { bg: 'bg-white', border: 'border-atlas-verdant/35', text: 'text-atlas-petrol-deep', icon: 'bg-atlas-verdant/15 text-atlas-verdant' },
        blue: { bg: 'bg-white', border: 'border-atlas-petrol/35', text: 'text-atlas-petrol-deep', icon: 'bg-atlas-petrol/15 text-atlas-petrol' },
        red: { bg: 'bg-white', border: 'border-atlas-gold/35', text: 'text-atlas-petrol-deep', icon: 'bg-atlas-gold/15 text-atlas-gold-dark' },
    };
    const c = colors[color] || colors.gold;
    return (
        <div className={`rounded-2xl border p-4 hover-lift ${c.bg} ${c.border}`}>
            <div className="flex items-center gap-2 mb-2">
                <div className={`p-1.5 rounded-xl ${c.icon}`}>{icon}</div>
                <span className="text-xs font-semibold text-atlas-petrol-deep">{label}</span>
            </div>
            <div className={`text-xl font-black ${c.text}`}>{value}</div>
            <div className="text-[11px] text-atlas-petrol-deep mt-0.5">{sublabel}</div>
        </div>
    );
}

function NFABI_Section() {
    const [expanded, setExpanded] = useState(false);
    return (
        <div className="rounded-2xl border border-atlas-gold/35 bg-white overflow-hidden">
            <button onClick={() => setExpanded(!expanded)} className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[#f8f5ed] transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-atlas-gold/20 flex items-center justify-center">
                        <FileText size={18} className="text-atlas-gold-dark" />
                    </div>
                    <div>
                        <h3 className="font-bold text-atlas-petrol-deep text-sm">{NF_ABI.nome}</h3>
                        <p className="text-xs text-atlas-petrol-deep">Obrigatória a partir de {NF_ABI.vigenciaInicio}, Clique para ver detalhes</p>
                    </div>
                </div>
                {expanded ? <ChevronUp size={18} className="text-atlas-petrol-deep" /> : <ChevronDown size={18} className="text-atlas-petrol-deep" />}
            </button>
            {expanded && (
                <div className="px-6 pb-6 space-y-4 border-t border-atlas-gold/25 animate-slide-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                        <div>
                            <h4 className="text-xs font-bold text-atlas-petrol-deep uppercase tracking-wider mb-2">Operações Abrangidas</h4>
                            <ul className="space-y-1.5">
                                {NF_ABI.operacoes.map((op, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm text-atlas-petrol-deep"><span className="w-1.5 h-1.5 rounded-full bg-atlas-gold-dark"></span>{op}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-atlas-petrol-deep uppercase tracking-wider mb-2">Quem Deve Emitir</h4>
                            <ul className="space-y-1.5">
                                {NF_ABI.obrigados.map((ob, i) => (
                                    <li key={i} className="flex items-center gap-2.5 text-sm text-atlas-petrol-deep"><span className="w-1.5 h-1.5 rounded-full bg-atlas-gold-dark"></span>{ob}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
