'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { CheckoutButton } from '@/components/public/CheckoutButton';
import { AtlasLogo } from '@/components/brand/AtlasLogo';
import { ArrowRight, CheckCircle, ShieldCheck, Radio, BarChart3, Sparkles, Calendar, Building, Clock, TrendingUp } from 'lucide-react';

export default function LandingPage() {
    const [perfil, setPerfil] = useState('contador');
    const [email, setEmail] = useState('');

    return (
        <div className="min-h-screen atlas-public-bg">
            <Header />

            {/* ─── Hero Section, Full-width ─── */}
            <section className="relative pt-28 pb-20 lg:pt-32 lg:pb-28 overflow-hidden">
                {/* Decorative background orbs */}
                <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-atlas-petrol/[0.08] rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-atlas-gold/[0.12] rounded-full blur-3xl translate-x-1/4 translate-y-1/4" />

                <div className="relative z-10 w-full px-8 md:px-12 lg:px-16 xl:px-24 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                    {/* Left, Copy */}
                    <div className="animate-slide-up max-w-2xl">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full atlas-chip-strong text-xs font-semibold mb-8 border border-atlas-petrol/15">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Monitorando LC 214/2025 e Atos da RFB
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-serif font-bold text-atlas-petrol-deep leading-[1.08] mb-6 tracking-tight">
                            A bússola segura na{' '}
                            <span className="text-gradient-gold">Reforma Tributária.</span>
                        </h1>

                        <p className="text-lg lg:text-xl atlas-text-muted max-w-xl mb-10 leading-relaxed">
                            Fonte oficial, datas auditáveis e obrigações claras.
                            Sem ruído. Sem fake news. Apenas o que está no Diário Oficial.
                        </p>

                        {/* CTA Form, Full width */}
                        <div className="w-full max-w-xl atlas-soft-panel rounded-full p-1.5 flex items-center gap-2 animate-slide-up" style={{ animationDelay: '150ms' }}>
                            <select
                                value={perfil}
                                onChange={(e) => setPerfil(e.target.value)}
                                className="bg-white text-slate-700 text-sm rounded-full px-4 py-3 outline-none border border-atlas-petrol/10 font-semibold"
                            >
                                <option value="contador">Sou Contador</option>
                                <option value="advogado">Sou Advogado</option>
                                <option value="investidor">Investidor Imobiliário</option>
                            </select>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Seu email profissional"
                                className="flex-1 bg-transparent text-slate-700 placeholder-slate-500 text-sm outline-none px-2 min-w-0"
                            />
                            <CheckoutButton email={email} perfil={perfil} className="bg-atlas-petrol-deep text-white font-semibold px-6 py-3 rounded-full text-sm whitespace-nowrap shadow-sm hover:bg-atlas-petrol hover:shadow-md transition-all duration-200 flex items-center gap-1.5 active:scale-[0.98]">
                                Acessar <ArrowRight size={15} />
                            </CheckoutButton>
                        </div>

                    </div>

                    {/* Right, Floating Dashboard Mockup */}
                    <div className="hidden lg:block relative animate-slide-up" style={{ animationDelay: '200ms' }}>
                        <div className="relative ml-auto max-w-lg">
                            {/* Main card */}
                            <div className="atlas-surface-card rounded-3xl p-7 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between mb-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-atlas-petrol/10 flex items-center justify-center">
                                            <BarChart3 size={18} className="text-atlas-petrol" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-800">Status da Reforma</p>
                                            <p className="text-[11px] atlas-text-soft">Atualizado hoje | 20/02/2026</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">LIVE</span>
                                </div>
                                <div className="space-y-3">
                                    <StatusRow label="CBS" status="TESTE 2026" color="bg-emerald-500" pct={75} />
                                    <StatusRow label="IBS" status="TESTE 2026" color="bg-blue-500" pct={60} />
                                    <StatusRow label="Imposto Seletivo" status="AGUARDA REG." color="bg-amber-500" pct={30} />
                                </div>
                                <div className="mt-5 pt-4 border-t border-atlas-petrol/10 flex items-center justify-between">
                                    <span className="text-[11px] atlas-text-soft">Alíquota de referência</span>
                                    <span className="text-lg font-black text-atlas-petrol-deep">26,5%</span>
                                </div>
                            </div>

                            {/* Floating card 1, top right */}
                            <div className="absolute -top-5 -right-6 atlas-surface-card rounded-2xl p-4 animate-float z-10" style={{ animationDelay: '0.5s' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                        <CheckCircle size={15} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">4 obrigações</p>
                                        <p className="text-[10px] atlas-text-soft">ativas em 2026</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating card 2, bottom left */}
                            <div className="absolute -bottom-4 -left-8 atlas-surface-card rounded-2xl p-4 animate-float z-10" style={{ animationDelay: '1.5s' }}>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-8 h-8 rounded-xl bg-atlas-gold/10 flex items-center justify-center">
                                        <TrendingUp size={15} className="text-atlas-gold-dark" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-gray-700">Simulador</p>
                                        <p className="text-[10px] atlas-text-soft">Alíquota efetiva</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating card 3, mid right */}
                            <div className="absolute top-1/2 -right-10 atlas-surface-card rounded-2xl p-3 animate-float z-10" style={{ animationDelay: '2.5s' }}>
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                        <Clock size={13} className="text-blue-500" />
                                    </div>
                                    <p className="text-[10px] font-bold text-gray-600">DOU hoje</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Social Proof, Full-width bar ─── */}
            <section className="py-8 atlas-section-soft">
                <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24 flex items-center justify-between flex-wrap gap-6">
                    <span className="text-xs atlas-text-soft font-semibold">Fontes oficiais monitoradas:</span>
                    <div className="flex items-center gap-10 flex-wrap">
                        {['Diário Oficial da União', 'Receita Federal', 'Comitê Gestor IBS', 'SERPRO'].map((name) => (
                            <span key={name} className="text-sm font-semibold atlas-text-muted tracking-wide">{name}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Features, Full-width grid ─── */}
            <section className="py-24">
                <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                    <div className="text-center mb-16 animate-fade-in">
                        <h2 className="text-3xl md:text-4xl lg:text-[42px] font-serif font-bold text-atlas-petrol-deep mb-4 leading-tight">
                            Tudo que você precisa,<br />em um só lugar.
                        </h2>
                        <p className="atlas-text-muted max-w-2xl mx-auto text-lg">
                            Plataforma integrada para profissionais que precisam de segurança jurídica na transição tributária.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 stagger-children">
                        <FeatureCard
                            icon={<ShieldCheck size={26} />}
                            title="Apenas Fontes Oficiais"
                            description="Dados extraídos do DOU, Câmara e portais da RFB. Nada de blogueiro ou live de Youtube."
                            color="text-emerald-600"
                            bg="bg-emerald-50"
                        />
                        <FeatureCard
                            icon={<Radio size={26} />}
                            title="Radar em Tempo Real"
                            description="Monitoramento diário das publicações que afetam CBS, IBS e Imposto Seletivo."
                            color="text-blue-600"
                            bg="bg-blue-50"
                        />
                        <FeatureCard
                            icon={<BarChart3 size={26} />}
                            title="Simulador Imobiliário"
                            description="Calcule a alíquota efetiva para cada tipo de operação com base na LC 214/2025."
                            color="text-atlas-gold-dark"
                            bg="bg-atlas-gold/10"
                        />
                    </div>
                </div>
            </section>

            {/* ─── Pricing Preview, Full-width ─── */}
            <section className="py-24 atlas-section-soft">
                <div className="w-full px-8 md:px-12 lg:px-16 xl:px-24">
                    <div className="max-w-lg mx-auto">
                        <div className="atlas-surface-card rounded-3xl p-10 relative overflow-hidden hover-lift">
                            {/* Shimmer line */}
                            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-atlas-gold/30 to-transparent animate-shimmer" />

                            <div className="inline-flex items-center gap-1.5 text-atlas-gold-dark text-xs font-bold tracking-wider uppercase mb-5">
                                <Sparkles size={14} /> Acesso Vitalício
                            </div>
                            <div className="flex items-baseline gap-2 justify-center mb-2">
                                <span className="text-slate-500 line-through text-xl">R$ 297</span>
                                <span className="text-5xl font-black text-atlas-petrol-deep">R$ 89,90</span>
                            </div>
                            <p className="atlas-text-muted text-sm mb-8">Pagamento único. Sem mensalidade.</p>

                            <ul className="space-y-3.5 text-left mb-8">
                                {['Painel de Obrigações 2026', 'Alertas por Email (12 meses)', 'Módulo Imobiliário', 'Timeline da Transição'].map(item => (
                                    <li key={item} className="flex items-center gap-3 text-sm atlas-text-primary">
                                        <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                                        {item}
                                    </li>
                                ))}
                            </ul>

                            <CheckoutButton className="block w-full bg-atlas-petrol-deep text-white font-semibold py-4 rounded-full text-sm shadow-md hover:bg-atlas-petrol hover:shadow-lg transition-all active:scale-[0.99]">
                                Garantir Acesso Agora
                            </CheckoutButton>
                        </div>
                    </div>
                </div>
            </section>

            {/* ─── Footer, Full-width ─── */}
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

function StatusRow({ label, status, color, pct }: { label: string; status: string; color: string; pct: number }) {
    return (
        <div className="bg-slate-50/90 rounded-xl px-4 py-3 border border-atlas-petrol/10">
            <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${color}`} />
                    <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
                <span className="text-[10px] font-bold atlas-text-soft uppercase tracking-wider">{status}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, color, bg }: { icon: React.ReactNode; title: string; description: string; color: string; bg: string }) {
    return (
        <div className="rounded-3xl atlas-surface-card p-8 lg:p-10 group">
            <div className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mb-6 ${color} group-hover:scale-110 transition-transform duration-300`}>
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="atlas-text-muted text-[15px] leading-relaxed">{description}</p>
        </div>
    );
}
