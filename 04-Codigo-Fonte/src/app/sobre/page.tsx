'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { CheckoutButton } from '@/components/public/CheckoutButton';
import { AtlasLogo } from '@/components/brand/AtlasLogo';
import {
    ArrowRight, Target, Compass, AlertOctagon, CheckCircle, Shield, Sparkles,
    ShieldCheck, Radio, BarChart3, Calendar, Bell, BookOpen, Users, Building2,
    Briefcase, TrendingUp, FileText, Eye, Zap, Clock
} from 'lucide-react';

export default function AboutPage() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = [
        {
            id: 'obrigacoes',
            label: 'Obrigações',
            icon: <CheckCircle size={16} />,
            title: 'Painel de Obrigações 2026',
            description: 'Saiba exatamente o que é exigível hoje e o que pode esperar. Sem ansiedade.',
            preview: (
                <div className="space-y-3">
                    <ObligationRow title="Emissão de NFSe Nacional" status="OBRIGATÓRIO" date="01/01/2026" statusColor="bg-emerald-500" />
                    <ObligationRow title="DTE, Domicílio Tributário Eletrônico" status="OBRIGATÓRIO" date="01/01/2026" statusColor="bg-emerald-500" />
                    <ObligationRow title="Apuração CBS (Teste)" status="EDUCATIVO" date="01/01/2026" statusColor="bg-blue-500" />
                    <ObligationRow title="Declaração IBS Simplificada" status="FUTURO" date="01/01/2027" statusColor="bg-gray-400" />
                </div>
            ),
        },
        {
            id: 'radar',
            label: 'Radar',
            icon: <Radio size={16} />,
            title: 'Radar Normativo em Tempo Real',
            description: 'Monitoramento diário das publicações do DOU e atos da Receita Federal.',
            preview: (
                <div className="space-y-3">
                    <RadarRow source="RFB" title="Receita disponibiliza manuais e orientações..." time="Hoje" isNew />
                    <RadarRow source="DOU" title="Portaria RFB nº 456, Regulamenta CBS..." time="Ontem" isNew />
                    <RadarRow source="RFB" title="Chatbot com IA Generativa sobre a Reforma..." time="3 dias" />
                    <RadarRow source="CGIBS" title="Definição de alíquotas-teste para IBS..." time="1 semana" />
                </div>
            ),
        },
        {
            id: 'simulador',
            label: 'Simulador',
            icon: <BarChart3 size={16} />,
            title: 'Simulador de Alíquota Efetiva',
            description: 'Calcule o impacto real da reforma em operações imobiliárias.',
            preview: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">Alíquota de referência</span>
                        <span className="text-2xl font-black text-atlas-petrol-deep">26,5%</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <SimCard label="Venda" redutor="50%" efetiva="13,25%" />
                        <SimCard label="Locação" redutor="70%" efetiva="7,95%" />
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-emerald-600 font-semibold">Em locação, carga tributária cai significativamente</p>
                    </div>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen atlas-public-bg">
            <Header />

            <main className="pt-32 pb-0">
                {/* ─── Hero, Full-width, impactful ─── */}
                <section className="px-8 md:px-12 lg:px-16 xl:px-24 text-center mb-24 animate-fade-in">
                    <div className="max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full atlas-chip-strong text-xs font-semibold mb-8 border border-atlas-petrol/15">
                            <Sparkles size={14} />
                            Feita para quem não pode errar, nem deixar de agir
                        </div>
                        <h1 className="text-4xl md:text-5xl lg:text-[56px] font-serif font-bold text-atlas-petrol-deep mb-6 leading-[1.08] tracking-tight">
                            Chega de se perder no <br />
                            <span className="text-gradient-gold">caos da Reforma Tributária.</span>
                        </h1>
                        <p className="text-lg lg:text-xl atlas-text-muted leading-relaxed max-w-2xl mx-auto mb-10">
                            A maior mudança tributária dos últimos 60 anos está acontecendo.
                            O Atlas organiza tudo para que você tome decisões com segurança.
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <CheckoutButton className="bg-atlas-petrol-deep text-white px-8 py-3.5 rounded-full text-sm font-semibold shadow-md hover:bg-atlas-petrol hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2">
                                Começar Agora <ArrowRight size={16} />
                            </CheckoutButton>
                            <Link href="/preco" className="bg-white text-slate-700 px-8 py-3.5 rounded-full text-sm font-semibold border border-atlas-petrol/15 hover:border-atlas-petrol/30 hover:shadow-md transition-all">
                                Ver Plano de Acesso
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ─── Values, 3 columns full-width ─── */}
                <section className="py-24 atlas-section-soft">
                    <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                        <div className="text-center mb-12">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full atlas-soft-panel text-base atlas-text-muted font-semibold">
                                <Users size={14} className="text-atlas-petrol" />
                                Para contadores, advogados, empresários e pessoas físicas
                            </span>
                        </div>
                        <div className="grid md:grid-cols-3 gap-8 stagger-children">
                            <ValueCard
                                icon={<Eye className="w-7 h-7" />}
                                title="Clareza Absoluta"
                                text="Não especulamos. Se não está no Diário Oficial ou na Receita Federal, deixamos claro que é previsão."
                                bg="bg-emerald-50"
                                color="text-emerald-600"
                            />
                            <ValueCard
                                icon={<Zap className="w-7 h-7" />}
                                title="Ação Imediata"
                                text="Não basta saber. O Atlas diz o que você precisa fazer agora e o que pode esperar."
                                bg="bg-blue-50"
                                color="text-blue-600"
                            />
                            <ValueCard
                                icon={<Shield className="w-7 h-7" />}
                                title="Zero Ansiedade"
                                text="Pare de assistir lives angustiantes. Consulte o Atlas quando precisar e durma tranquilo."
                                bg="bg-atlas-gold/10"
                                color="text-atlas-gold-dark"
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Interactive System Preview ─── */}
                <section className="py-24">
                    <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                        <div className="text-center mb-16">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full atlas-soft-panel text-base atlas-text-muted font-semibold mb-6">
                                <Radio size={14} className="text-atlas-petrol" />
                                Mais de 20 agentes monitoram as atualizações em tempo real
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-atlas-petrol-deep mb-4 leading-tight">
                                Veja o Atlas <span className="text-gradient-gold">por dentro.</span>
                            </h2>
                            <p className="atlas-text-muted text-lg max-w-xl mx-auto">
                                Explore as funcionalidades que vão transformar sua relação com a Reforma.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-2 gap-10 items-start">
                            {/* Tab buttons */}
                            <div className="space-y-4">
                                {tabs.map((tab, i) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(i)}
                                        className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${activeTab === i
                                            ? 'atlas-surface-card border-atlas-petrol/25 scale-[1.01]'
                                            : 'atlas-soft-panel border-atlas-petrol/10 hover:bg-white hover:shadow-md hover:border-atlas-petrol/25'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${activeTab === i ? 'bg-atlas-petrol text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-atlas-petrol/10 group-hover:text-atlas-petrol'
                                                }`}>
                                                {tab.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-bold mb-1 transition-colors ${activeTab === i ? 'text-atlas-petrol-deep' : 'text-gray-600'}`}>
                                                    {tab.title}
                                                </h3>
                                                <p className="text-sm atlas-text-muted leading-relaxed">{tab.description}</p>
                                            </div>
                                            <ArrowRight size={16} className={`mt-1 transition-all duration-300 ${activeTab === i ? 'text-atlas-petrol translate-x-0 opacity-100' : 'text-gray-200 -translate-x-2 opacity-0'
                                                }`} />
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Preview panel */}
                            <div className="sticky top-24">
                                <div className="atlas-surface-card rounded-3xl p-6 lg:p-8 relative overflow-hidden">
                                    {/* Tab bar mockup */}
                                    <div className="flex items-center gap-2 mb-6 pb-4 border-b border-atlas-petrol/10">
                                        <div className="flex gap-1.5">
                                            <span className="w-3 h-3 rounded-full bg-red-300" />
                                            <span className="w-3 h-3 rounded-full bg-amber-300" />
                                            <span className="w-3 h-3 rounded-full bg-emerald-300" />
                                        </div>
                                        <div className="flex-1 px-4">
                                            <div className="bg-slate-100 rounded-full px-4 py-1.5 text-[10px] atlas-text-soft text-center">
                                                atlas.reformatributaria.com.br/dashboard/{tabs[activeTab].id}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live preview */}
                                    <div className="animate-fade-in" key={activeTab}>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="text-xs font-bold text-atlas-petrol uppercase tracking-wider">{tabs[activeTab].label}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                        </div>
                                        {tabs[activeTab].preview}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Who is it for?, Expanded audience ─── */}
                <section className="py-24 atlas-section-soft">
                    <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                        <div className="text-center mb-16">
                            <span className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full atlas-soft-panel text-base atlas-text-muted font-semibold mb-6">
                                <ShieldCheck size={14} className="text-atlas-petrol" />
                                Todo o conteúdo é processado e curado por um advogado tributarista
                            </span>
                            <h2 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-atlas-petrol-deep mb-4 leading-tight">
                                Para quem é o <span className="text-gradient-gold">Atlas</span>?
                            </h2>
                            <p className="atlas-text-muted text-lg max-w-2xl mx-auto">
                                A Reforma Tributária afeta todas as pessoas e empresas do Brasil.
                                O Atlas foi pensado para cada perfil.
                            </p>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                            <AudienceCard
                                icon={<Briefcase size={24} />}
                                title="Contadores"
                                description="Precisa saber o que muda no operacional para blindar seus clientes e manter a conformidade."
                                bg="bg-emerald-50"
                                color="text-emerald-600"
                            />
                            <AudienceCard
                                icon={<Shield size={24} />}
                                title="Advogados"
                                description="Base legal atualizada, links para fontes primárias e estratégia de planejamento tributário."
                                bg="bg-blue-50"
                                color="text-blue-600"
                            />
                            <AudienceCard
                                icon={<Building2 size={24} />}
                                title="Empresários"
                                description="Entenda como a reforma impacta sua empresa, seus preços e suas decisões de investimento."
                                bg="bg-cyan-50"
                                color="text-cyan-700"
                            />
                            <AudienceCard
                                icon={<Users size={24} />}
                                title="Pessoas Físicas"
                                description="Investidores imobiliários, autônomos e cidadãos que querem entender o que vai mudar no seu bolso."
                                bg="bg-atlas-gold/10"
                                color="text-atlas-gold-dark"
                            />
                        </div>
                    </div>
                </section>

                {/* ─── Problem vs Solution, Interactive table ─── */}
                <section className="py-24">
                    <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                        <div className="atlas-surface-card rounded-3xl p-8 lg:p-12">
                            <h2 className="text-3xl md:text-4xl font-serif font-bold text-atlas-petrol-deep mb-4 text-center">
                                Por que criamos o Atlas?
                            </h2>
                            <p className="atlas-text-muted text-center mb-10 max-w-xl mx-auto">
                                O cenário atual é de caos informacional. Transformamos problema em solução.
                            </p>

                            <div className="grid md:grid-cols-2 gap-6">
                                <CompareCard
                                    type="problem"
                                    icon={<AlertOctagon size={20} className="text-red-400" />}
                                    items={[
                                        'Excesso de lives, fake news e especulação',
                                        'Ansiedade: "O que devo fazer agora?"',
                                        'Risco de perder prazos de novas declarações',
                                        'Textos jurídicos desatualizados e confusos',
                                    ]}
                                />
                                <CompareCard
                                    type="solution"
                                    icon={<CheckCircle size={20} className="text-emerald-500" />}
                                    items={[
                                        'Curadoria oficial: apenas atos do DOU e Câmara',
                                        'Checklist 2026: exigível vs. educativo',
                                        'Alertas ativos por email quando um prazo se aproxima',
                                        'Trilha auditável: link direto para a fonte oficial',
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── Stats bar ─── */}
                <section className="py-16 bg-atlas-petrol-deep">
                    <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 grid grid-cols-3 md:grid-cols-3 gap-8 text-center stagger-children">
                        <StatItem number="50+" label="Obrigações mapeadas" />
                        <StatItem number="20+" label="Agentes monitorando 24/7" />
                        <StatItem number="100%" label="Fontes oficiais" />
                    </div>
                </section>

                {/* ─── CTA Final ─── */}
                <section className="py-24 text-center">
                    <div className="max-w-2xl mx-auto px-8">
                        <h2 className="text-3xl md:text-4xl font-serif font-bold text-atlas-petrol-deep mb-4 leading-tight">
                            A Reforma Tributária <span className="text-gradient-gold">já começou.</span>
                        </h2>
                        <p className="atlas-text-muted text-lg mb-10 leading-relaxed">
                            O Atlas é seu guia seguro na transição tributária mais importante dos últimos 60 anos.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <CheckoutButton className="bg-atlas-petrol-deep text-white px-10 py-4 rounded-full font-semibold shadow-lg hover:bg-atlas-petrol hover:shadow-xl transition-all active:scale-[0.98] flex items-center gap-2 text-base">
                                Quero Acesso Agora <ArrowRight size={18} />
                            </CheckoutButton>
                        </div>
                        <p className="text-xs atlas-text-soft mt-6">Pagamento único de R$ 89,90 | Sem mensalidade | Garantia de 7 dias</p>
                    </div>
                </section>
            </main>

            {/* ─── Footer ─── */}
            <footer className="py-12 border-t border-atlas-petrol/10">
                <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5">
                        <AtlasLogo variant="mark" className="h-5 w-5" />
                        <span className="text-sm font-serif font-bold tracking-[0.16em] text-atlas-petrol-deep">ATLAS</span>
                    </div>
                    <p className="text-xs atlas-text-soft">© 2026 Atlas Reforma Tributária. Todos os direitos reservados.</p>
                    <div className="flex gap-6">
                        <Link href="/sobre" className="text-xs atlas-text-muted hover:text-atlas-petrol transition-colors">Sobre</Link>
                        <Link href="/preco" className="text-xs atlas-text-muted hover:text-atlas-petrol transition-colors">Preço</Link>
                        <Link href="/login" className="text-xs atlas-text-muted hover:text-atlas-petrol transition-colors">Login</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

/* ─── Sub-components ─── */

function ValueCard({ icon, title, text, bg, color }: { icon: React.ReactNode, title: string, text: string, bg: string, color: string }) {
    return (
        <div className="atlas-surface-card rounded-3xl p-8 lg:p-10 group text-center">
            <div className={`${bg} w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="atlas-text-muted leading-relaxed text-sm">{text}</p>
        </div>
    );
}

function AudienceCard({ icon, title, description, bg, color }: { icon: React.ReactNode, title: string, description: string, bg: string, color: string }) {
    return (
        <div className="atlas-surface-card rounded-3xl p-7 group">
            <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
            <p className="atlas-text-muted leading-relaxed text-sm">{description}</p>
        </div>
    );
}

function CompareCard({ type, icon, items }: { type: 'problem' | 'solution', icon: React.ReactNode, items: string[] }) {
    const isProblem = type === 'problem';
    return (
        <div className={`rounded-2xl p-6 lg:p-8 ${isProblem ? 'bg-red-50/50 border border-red-100' : 'bg-emerald-50/50 border border-emerald-100'}`}>
            <div className="flex items-center gap-2 mb-5">
                {icon}
                <h3 className={`font-bold ${isProblem ? 'text-red-500' : 'text-emerald-600'}`}>
                    {isProblem ? 'O Caos Atual' : 'A Solução Atlas'}
                </h3>
            </div>
            <ul className="space-y-3">
                {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${isProblem ? 'bg-red-300' : 'bg-emerald-400'}`} />
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function StatItem({ number, label }: { number: string, label: string }) {
    return (
        <div>
            <p className="text-3xl lg:text-4xl font-black text-white mb-1">{number}</p>
            <p className="text-sm text-white/40">{label}</p>
        </div>
    );
}

function ObligationRow({ title, status, date, statusColor }: { title: string, status: string, date: string, statusColor: string }) {
    return (
        <div className="flex items-center justify-between bg-slate-50/90 border border-atlas-petrol/10 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor}`} />
                <span className="text-sm text-gray-700 font-medium truncate">{title}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${status === 'OBRIGATÓRIO' ? 'bg-emerald-50 text-emerald-600' :
                    status === 'EDUCATIVO' ? 'bg-blue-50 text-blue-600' :
                        'bg-slate-100 atlas-text-soft'
                    }`}>{status}</span>
                <span className="text-[11px] atlas-text-soft">{date}</span>
            </div>
        </div>
    );
}

function RadarRow({ source, title, time, isNew }: { source: string, title: string, time: string, isNew?: boolean }) {
    return (
        <div className="flex items-start gap-3 bg-slate-50/90 border border-atlas-petrol/10 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5 flex-shrink-0 ${source === 'RFB' ? 'bg-atlas-petrol/10 text-atlas-petrol' :
                source === 'DOU' ? 'bg-amber-50 text-amber-600' :
                    'bg-blue-50 text-blue-600'
                }`}>{source}</span>
            <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium truncate">{title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] atlas-text-soft">{time}</span>
                    {isNew && <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">NOVO</span>}
                </div>
            </div>
        </div>
    );
}

function SimCard({ label, redutor, efetiva }: { label: string, redutor: string, efetiva: string }) {
    return (
        <div className="bg-slate-50/90 border border-atlas-petrol/10 rounded-xl p-4 text-center">
            <p className="text-xs atlas-text-soft mb-1">{label}</p>
            <p className="text-xl font-black text-atlas-petrol-deep">{efetiva}</p>
            <p className="text-[10px] atlas-text-soft">Redutor: {redutor}</p>
        </div>
    );
}
