'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { CheckoutButton } from '@/components/public/CheckoutButton';
import { CheckCircle2, ShieldCheck, Mail, BookOpen, Sparkles, ArrowRight } from 'lucide-react';

export default function PricingPage() {
    return (
        <div className="min-h-screen atlas-public-bg">
            <Header />

            <main className="pt-36 pb-20 px-6">
                <div className="max-w-4xl mx-auto text-center mb-16 animate-fade-in">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-atlas-gold/15 text-atlas-gold-dark text-xs font-semibold mb-6 border border-atlas-gold/25">
                        <Sparkles size={14} />
                        Investimento Único
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-atlas-petrol-deep mt-3 mb-6">
                        Acesso Vitalício ao <span className="text-gradient-gold">Atlas</span>
                    </h1>
                    <p className="text-xl atlas-text-muted max-w-2xl mx-auto">
                        Garanta sua posição agora por um valor simbólico e receba todas as atualizações até a vigência plena.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center stagger-children">
                    {/* Pricing Card */}
                    <div className="atlas-surface-card rounded-3xl p-8 relative overflow-hidden hover-lift">
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-atlas-gold/30 to-transparent animate-shimmer" />
                        <div className="absolute top-4 right-4">
                            <span className="bg-atlas-petrol-deep text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                Lote 1, Encerrando
                            </span>
                        </div>

                        <div className="mb-8 text-center md:text-left mt-4">
                            <h3 className="text-lg font-semibold atlas-text-muted mb-2">Licença Profissional</h3>
                            <div className="flex items-baseline justify-center md:justify-start gap-2">
                                <span className="text-2xl text-slate-500 line-through">R$ 297</span>
                                <span className="text-5xl font-black text-atlas-petrol-deep">R$ 89,90</span>
                            </div>
                            <p className="text-sm atlas-text-muted mt-2">Pagamento único. Sem mensalidade.</p>
                        </div>

                        <ul className="space-y-4 mb-8">
                            <FeatureItem text="Acesso ao Painel de Obrigações 2026/2027" />
                            <FeatureItem text="Alertas de Mudança por Email (12 meses)" />
                            <FeatureItem text="Módulo Especial: Setor Imobiliário" />
                            <FeatureItem text="Timeline Interativa da Transição" />
                            <FeatureItem text="Acesso a atualizações da LC 214/2025" />
                        </ul>

                        <CheckoutButton className="block w-full bg-atlas-petrol-deep text-white text-center py-4 rounded-full font-semibold text-base shadow-md hover:bg-atlas-petrol hover:shadow-lg transition-all active:scale-[0.99]">
                            Quero garantir meu acesso
                        </CheckoutButton>
                        <p className="text-center text-xs atlas-text-soft mt-4">Compra segura | Garantia de 7 dias</p>
                    </div>

                    {/* Benefits */}
                    <div className="space-y-8">
                        <Benefit
                            icon={<ShieldCheck className="w-6 h-6 text-emerald-600" />}
                            title="Segurança Jurídica"
                            description="Dados direto do Diário Oficial e do Comitê Gestor. Sem especulação."
                            bg="bg-emerald-50"
                        />
                        <Benefit
                            icon={<Mail className="w-6 h-6 text-blue-600" />}
                            title="Alertas Curados"
                            description="Menos ruído, mais sinal. Só avisamos quando algo realmente mudar."
                            bg="bg-blue-50"
                        />
                        <Benefit
                            icon={<BookOpen className="w-6 h-6 text-atlas-gold-dark" />}
                            title="Base Legal Conectada"
                            description="Cada obrigação tem link direto para o artigo da lei que a instituiu."
                            bg="bg-atlas-gold/10"
                        />
                    </div>
                </div>
            </main>
        </div>
    );
}

function FeatureItem({ text }: { text: string }) {
    return (
        <li className="flex items-center gap-3 atlas-text-primary">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">{text}</span>
        </li>
    );
}

function Benefit({ icon, title, description, bg }: { icon: React.ReactNode, title: string, description: string, bg: string }) {
    return (
        <div className="flex gap-4 atlas-soft-panel rounded-2xl p-4 hover-lift">
            <div className={`${bg} w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border border-atlas-petrol/10`}>{icon}</div>
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">{title}</h3>
                <p className="atlas-text-muted leading-relaxed text-sm">{description}</p>
            </div>
        </div>
    );
}
