// src/app/dashboard/timeline/page.tsx
'use client';

import React, { useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import {
    Calendar, CheckCircle, Clock, ArrowRight,
    AlertTriangle, TrendingUp, Landmark, Info,
    ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';

// ── Dados oficiais da transição ────────────────────────────
type PhaseStatus = 'COMPLETED' | 'CURRENT' | 'FUTURE';

interface TimelineEvent {
    year: string;
    label: string;
    status: PhaseStatus;
    highlights: string[];
    details?: string[];
    icon: React.ReactNode;
    color: string;
    progressBar?: { label: string; ibs: number; icmsIss: number };
}

const TIMELINE_DATA: TimelineEvent[] = [
    {
        year: "2023",
        label: "Emenda Constitucional 132",
        status: "COMPLETED",
        icon: <Landmark size={18} />,
        color: "emerald",
        highlights: [
            "Aprovação da EC 132/2023 pelo Congresso Nacional",
            "Base constitucional para a criação do IBS, CBS e IS",
            "Definição do modelo dual de IVA (federal + compartilhado)"
        ]
    },
    {
        year: "Jan 2025",
        label: "Lei Complementar 214/2025",
        status: "COMPLETED",
        icon: <CheckCircle size={18} />,
        color: "emerald",
        highlights: [
            "Instituição oficial do IBS e da CBS",
            "Regras gerais de incidência e não cumulatividade",
            "Definição de alíquotas, créditos e obrigações acessórias"
        ]
    },
    {
        year: "Dez 2025",
        label: "Regulamentação e Leiautes",
        status: "COMPLETED",
        icon: <CheckCircle size={18} />,
        color: "emerald",
        highlights: [
            "Portarias RFB 501/2024 e 549/2025 publicadas",
            "Atos Conjuntos definindo obrigações acessórias para o período de teste",
            "Leiautes dos documentos fiscais (NFe, NFSe, CTe) ajustados para CBS/IBS"
        ]
    },
    {
        year: "2026",
        label: "Ano-Teste da CBS e do IBS",
        status: "CURRENT",
        icon: <Clock size={18} />,
        color: "blue",
        highlights: [
            "Alíquotas de teste: CBS 0,9% + IBS 0,1%",
            "Montante arrecadado compensado com PIS/COFINS devidos no mesmo período",
            "Período educativo, sem multas por erro de preenchimento"
        ],
        details: [
            "Os contribuintes que cumprirem as obrigações acessórias ficarão isentos da arrecadação da taxa de prova, conforme a legislação",
            "Obrigatoriedade de destaque nos documentos fiscais (NFe, NFSe, CTe, NFCe)",
            "Sistemas da RFB disponíveis para teste (API CBS, portal consumo.tributos.gov.br)",
            "DeRE, Declaração de Regime Específico obrigatória para regimes especiais"
        ]
    },
    {
        year: "2027 a 2028",
        label: "CBS Plena + Extinção PIS/COFINS + Imposto Seletivo",
        status: "FUTURE",
        icon: <TrendingUp size={18} />,
        color: "amber",
        highlights: [
            "Cobrança plena da CBS (redução de 0,1 p.p. → CBS: 99,9%)",
            "Extinção definitiva do PIS e da COFINS",
            "Alíquotas do IPI zeradas (exceto produtos da Zona Franca de Manaus)"
        ],
        details: [
            "Instituição do Imposto Seletivo (IS): desestimula consumo de bens prejudiciais à saúde ou ao meio ambiente",
            "IS incide sobre: produção, extração, comercialização ou importação de itens definidos por lei",
            "IPI mantido apenas para preservar a competitividade da ZFM",
            "Início efetivo do novo modelo federal, CBS substitui integralmente PIS/COFINS"
        ]
    },
    {
        year: "2029",
        label: "Início da Transição ICMS/ISS → IBS",
        status: "FUTURE",
        icon: <ArrowRight size={18} />,
        color: "orange",
        highlights: [
            "IBS: 10% da alíquota plena",
            "ICMS e ISS: 90% das alíquotas atuais",
            "Primeiro passo da extinção gradual dos tributos estaduais e municipais"
        ],
        progressBar: { label: "2029", ibs: 10, icmsIss: 90 }
    },
    {
        year: "2030",
        label: "Segundo Ano de Transição",
        status: "FUTURE",
        icon: <ArrowRight size={18} />,
        color: "orange",
        highlights: [
            "IBS: 20% da alíquota plena",
            "ICMS e ISS: 80% das alíquotas atuais"
        ],
        progressBar: { label: "2030", ibs: 20, icmsIss: 80 }
    },
    {
        year: "2031",
        label: "Terceiro Ano de Transição",
        status: "FUTURE",
        icon: <ArrowRight size={18} />,
        color: "orange",
        highlights: [
            "IBS: 30% da alíquota plena",
            "ICMS e ISS: 70% das alíquotas atuais"
        ],
        progressBar: { label: "2031", ibs: 30, icmsIss: 70 }
    },
    {
        year: "2032",
        label: "Último Ano de Transição",
        status: "FUTURE",
        icon: <ArrowRight size={18} />,
        color: "orange",
        highlights: [
            "IBS: 40% da alíquota plena",
            "ICMS e ISS: 60% das alíquotas atuais",
            "Último ano de coexistência entre os modelos antigo e novo"
        ],
        progressBar: { label: "2032", ibs: 40, icmsIss: 60 }
    },
    {
        year: "2033",
        label: "Vigência Integral do Novo Modelo",
        status: "FUTURE",
        icon: <Landmark size={18} />,
        color: "violet",
        highlights: [
            "Extinção definitiva do ICMS e do ISS",
            "IBS em vigência plena (100%)",
            "Modelo brasileiro de IVA dual totalmente operacional"
        ],
        details: [
            "CBS (federal) + IBS (estadual/municipal) substituem integralmente os 5 tributos antigos",
            "Brasil alinhado às melhores práticas internacionais (modelo OCDE de IVA)",
            "Administração Tributária 3.0 plenamente implementada"
        ]
    }
];

// ── Progress Bar ────────────────────────────────────────────

function ProgressBarIBSvsICMS({ ibs, icmsIss }: { ibs: number; icmsIss: number }) {
    return (
        <div className="mt-4">
            <div className="flex text-xs font-semibold mb-1.5 justify-between">
                <span className="text-atlas-gold-dark">IBS: {ibs}%</span>
                <span className="text-atlas-graphite/35">ICMS/ISS: {icmsIss}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-atlas-surface">
                <div
                    className="bg-gradient-to-r from-atlas-gold to-atlas-gold-light transition-all duration-1000 rounded-l-full"
                    style={{ width: `${ibs}%` }}
                />
                <div
                    className="bg-atlas-graphite/10 transition-all duration-700 rounded-r-full"
                    style={{ width: `${icmsIss}%` }}
                />
            </div>
        </div>
    );
}

// ── Timeline Card ───────────────────────────────────────────

function TimelineCard({ event, index }: { event: TimelineEvent; index: number }) {
    const [expanded, setExpanded] = useState(false);

    const statusStyles = {
        COMPLETED: {
            dot: 'bg-atlas-verdant border-atlas-verdant-soft',
            card: 'bg-white/90 backdrop-blur-sm border-atlas-petrol/20',
            badge: 'bg-atlas-verdant-soft text-atlas-verdant border-atlas-verdant/20',
            badgeText: 'Concluído',
            opacity: ''
        },
        CURRENT: {
            dot: 'bg-atlas-gold border-atlas-gold/20 ring-4 ring-atlas-gold/15 animate-pulse-gold',
            card: 'bg-white border-atlas-gold/28 shadow-atlas-gold',
            badge: 'bg-atlas-gold/10 text-atlas-gold-dark border-atlas-gold/20',
            badgeText: 'Em Andamento',
            opacity: ''
        },
        FUTURE: {
            dot: 'bg-atlas-petrol/30 border-atlas-petrol/20',
            card: 'bg-white/80 border-atlas-petrol/20',
            badge: 'bg-atlas-petrol/[0.12] text-atlas-petrol/70 border-atlas-petrol/26',
            badgeText: 'Futuro',
            opacity: 'opacity-75 hover:opacity-100 transition-opacity duration-300'
        }
    };

    const style = statusStyles[event.status];

    return (
        <div className={`relative pl-10 ${style.opacity} animate-slide-up`} style={{ animationDelay: `${index * 80}ms` }}>
            {/* Dot on timeline */}
            <div className={`absolute -left-[13px] w-[26px] h-[26px] rounded-full flex items-center justify-center border-[3px] border-[#f5f2e8] ${style.dot}`}>
                {event.status === 'COMPLETED' && <CheckCircle size={12} className="text-white" />}
            </div>

            {/* Card */}
            <div className={`rounded-2xl border p-5 hover-lift ${style.card}`}>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="text-sm font-bold text-atlas-petrol uppercase tracking-wider">{event.year}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${style.badge}`}>
                                {style.badgeText}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-atlas-petrol-deep leading-snug">{event.label}</h3>
                    </div>
                    <div className={`p-2.5 rounded-xl ${event.status === 'CURRENT' ? 'bg-atlas-gold/10 text-atlas-gold-dark' :
                        event.status === 'COMPLETED' ? 'bg-atlas-verdant-soft text-atlas-verdant' :
                            'bg-atlas-petrol/[0.12] text-atlas-petrol/72'
                        }`}>
                        {event.icon}
                    </div>
                </div>

                {/* Highlights */}
                <ul className="mt-3 space-y-1.5">
                    {event.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-atlas-petrol/72">
                            <span className="text-atlas-gold/40 mt-1 text-xs">▸</span>
                            <span className="leading-relaxed">{h}</span>
                        </li>
                    ))}
                </ul>

                {/* Progress Bar */}
                {event.progressBar && (
                    <ProgressBarIBSvsICMS ibs={event.progressBar.ibs} icmsIss={event.progressBar.icmsIss} />
                )}

                {/* Expandable details */}
                {event.details && event.details.length > 0 && (
                    <>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="mt-3 flex items-center gap-1 text-xs font-semibold text-atlas-gold hover:text-atlas-gold-dark transition-colors"
                        >
                            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            {expanded ? 'Menos detalhes' : 'Mais detalhes'}
                        </button>
                        {expanded && (
                            <ul className="mt-2 space-y-1.5 pl-3 border-l-2 border-atlas-gold/15 animate-slide-up">
                                {event.details.map((d, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-atlas-petrol/80">
                                        <Info size={12} className="mt-1 text-atlas-gold/50 flex-shrink-0" />
                                        <span className="leading-relaxed">{d}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

// ── Summary Cards ───────────────────────────────────────────

function TransitionSummary() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger-children">
            <SummaryCard
                icon={<AlertTriangle size={18} />}
                label="Tributos que Nascem"
                items={["CBS (Federal)", "IBS (Estadual/Municipal)", "IS (Seletivo)"]}
                color="blue"
            />
            <SummaryCard
                icon={<TrendingUp size={18} />}
                label="Tributos que Morrem"
                items={["PIS/COFINS", "ICMS", "ISS", "IPI*"]}
                color="red"
                footnote="*IPI zerado exceto ZFM"
            />
            <SummaryCard
                icon={<Calendar size={18} />}
                label="Período de Transição"
                items={["2026: Teste", "2027: CBS plena", "2029 a 2032: IBS gradual", "2033: Modelo completo"]}
                color="amber"
            />
            <SummaryCard
                icon={<Clock size={18} />}
                label="Estamos Aqui"
                items={["Ano-teste 2026", "CBS: 0,9% + IBS: 0,1%", "Sem multas (educativo)", "Compensação com PIS/COFINS"]}
                color="emerald"
            />
        </div>
    );
}

function SummaryCard({ icon, label, items, color, footnote }: {
    icon: React.ReactNode; label: string; items: string[]; color: string; footnote?: string
}) {
    const colors: Record<string, string> = {
        blue: 'bg-atlas-petrol/[0.1] border-atlas-petrol/28 text-atlas-petrol',
        red: 'bg-atlas-gold/[0.08] border-atlas-gold/20 text-atlas-gold-dark',
        amber: 'bg-atlas-gold/[0.08] border-atlas-gold/20 text-atlas-gold-dark',
        emerald: 'bg-atlas-verdant-soft border-atlas-verdant/20 text-atlas-verdant',
    };
    const iconColors: Record<string, string> = {
        blue: 'bg-atlas-petrol/15 text-atlas-petrol',
        red: 'bg-atlas-gold/15 text-atlas-gold-dark',
        amber: 'bg-atlas-gold/15 text-atlas-gold-dark',
        emerald: 'bg-atlas-verdant/12 text-atlas-verdant',
    };

    return (
        <div className={`rounded-2xl border p-4 backdrop-blur-sm hover-lift ${colors[color]}`}>
            <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-xl ${iconColors[color]}`}>{icon}</div>
                <h3 className="font-bold text-sm">{label}</h3>
            </div>
            <ul className="space-y-1">
                {items.map((item, i) => (
                    <li key={i} className="text-xs opacity-80">▸ {item}</li>
                ))}
            </ul>
            {footnote && <p className="text-[10px] mt-2 opacity-50 italic">{footnote}</p>}
        </div>
    );
}

// ── Main Page ───────────────────────────────────────────────

export default function TimelinePage() {
    return (
        <div className="space-y-7 stagger-children">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-atlas-petrol/[0.12] border border-atlas-petrol/26 flex items-center justify-center">
                        <Calendar size={18} className="text-atlas-petrol" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep">
                            Linha do Tempo da Reforma
                        </h1>
                        <p className="text-atlas-petrol/82 text-sm">
                            Cronograma completo: de 2023 a 2033, EC 132, LC 214 e Regulamentos.
                        </p>
                    </div>
                </div>
                <a
                    href="https://www.gov.br/receitafederal/pt-br/acesso-a-informacao/acoes-e-programas/programas-e-atividades/reforma-consumo/entenda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-atlas-gold hover:text-atlas-gold-dark bg-atlas-gold/[0.08] px-3 py-2 rounded-xl border border-atlas-gold/15 transition-colors whitespace-nowrap"
                >
                    <ExternalLink size={12} />
                    Fonte: RFB, Entenda a Reforma
                </a>
            </div>

            {/* Summary Cards */}
            <TransitionSummary />

            {/* Timeline */}
            <div className="relative border-l-[3px] border-atlas-petrol/26 ml-3 space-y-5 py-4">
                {/* Gold gradient overlay on the line */}
                <div className="absolute left-[-2px] top-0 w-[3px] h-[35%] bg-gradient-to-b from-atlas-verdant via-atlas-gold to-transparent rounded-full" />

                {TIMELINE_DATA.map((event, index) => (
                    <TimelineCard key={index} event={event} index={index} />
                ))}
            </div>

            {/* Footer Note */}
            <div className="bg-atlas-gold/[0.08] border border-atlas-gold/25 rounded-2xl p-5 flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-atlas-gold/20 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={16} className="text-atlas-gold-dark" />
                </div>
                <div>
                    <p className="text-sm font-bold text-atlas-gold-dark">Cronograma sujeito a alterações</p>
                    <p className="text-xs text-atlas-gold-dark/80 mt-1 leading-relaxed">
                        As datas e alíquotas apresentadas seguem a EC 132/2023 e a LC 214/2025.
                        Novas regulamentações podem ajustar prazos e percentuais.
                        Acompanhe o Radar Oficial para atualizações em tempo real.
                    </p>
                </div>
            </div>
        </div>
    );
}
