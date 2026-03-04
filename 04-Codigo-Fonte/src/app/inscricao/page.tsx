'use client';

import React, { Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/public/Header';
import { ArrowRight, Briefcase, CreditCard, Loader2, Mail, ShieldCheck, User } from 'lucide-react';

const PERFIS = [
    { value: 'contador', label: 'Contador' },
    { value: 'advogado', label: 'Advogado' },
    { value: 'investidor', label: 'Investidor Imobiliário' },
    { value: 'geral', label: 'Profissional Geral' },
] as const;

function validarEmail(valor: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

export default function InscricaoPage() {
    return (
        <Suspense fallback={<InscricaoFallback />}>
            <InscricaoContent />
        </Suspense>
    );
}

function InscricaoFallback() {
    return (
        <div className="min-h-screen atlas-public-bg">
            <Header />
            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="atlas-surface-card rounded-3xl p-8 lg:p-10">
                        <p className="text-sm text-atlas-petrol-deep">Carregando inscrição...</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

function InscricaoContent() {
    const searchParams = useSearchParams();
    const emailInicial = useMemo(() => searchParams.get('email') || '', [searchParams]);
    const perfilInicial = useMemo(() => searchParams.get('perfil') || 'geral', [searchParams]);

    const [nome, setNome] = useState('');
    const [email, setEmail] = useState(emailInicial);
    const [perfil, setPerfil] = useState(perfilInicial);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    async function continuarParaPagamento(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setErro('');

        const emailLimpo = email.trim();
        const nomeLimpo = nome.trim();
        const perfilLimpo = perfil.trim() || 'geral';

        if (!nomeLimpo) {
            setErro('Informe seu nome para continuar.');
            return;
        }

        if (!validarEmail(emailLimpo)) {
            setErro('Informe um email válido para continuar.');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome: nomeLimpo,
                    email: emailLimpo,
                    perfil: perfilLimpo,
                }),
            });

            const data = await response.json();

            if (!response.ok || !data?.url) {
                setErro(data?.error || 'Não foi possível iniciar o pagamento. Tente novamente.');
                setLoading(false);
                return;
            }

            window.location.href = data.url;
        } catch {
            setErro('Erro de conexão. Verifique sua internet e tente novamente.');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen atlas-public-bg">
            <Header />

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-8 items-stretch">
                    <section className="atlas-surface-card rounded-3xl p-8 lg:p-10">
                        <div className="inline-flex items-center gap-2 rounded-full bg-atlas-gold/15 border border-atlas-gold/25 px-3.5 py-1.5 text-xs font-semibold text-atlas-gold-dark mb-6">
                            <ShieldCheck size={13} />
                            Etapa 1 de 2 inscrição no sistema
                        </div>

                        <h1 className="text-3xl lg:text-4xl font-serif font-bold text-atlas-petrol-deep leading-tight">
                            Faça sua inscrição no Atlas
                        </h1>
                        <p className="mt-3 text-atlas-text-muted text-sm leading-relaxed">
                            Preencha seus dados para liberar a etapa de pagamento e concluir seu acesso ao sistema.
                        </p>

                        <form onSubmit={continuarParaPagamento} className="mt-8 space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-atlas-petrol-deep uppercase tracking-wider mb-1.5">
                                    Nome completo
                                </label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-petrol/55" />
                                    <input
                                        type="text"
                                        value={nome}
                                        onChange={(event) => setNome(event.target.value)}
                                        placeholder="Digite seu nome"
                                        className="w-full rounded-xl border border-atlas-petrol/22 bg-white pl-10 pr-3 py-3 text-sm text-atlas-petrol-deep outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-atlas-petrol-deep uppercase tracking-wider mb-1.5">
                                    Email profissional
                                </label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-petrol/55" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full rounded-xl border border-atlas-petrol/22 bg-white pl-10 pr-3 py-3 text-sm text-atlas-petrol-deep outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-atlas-petrol-deep uppercase tracking-wider mb-1.5">
                                    Perfil principal
                                </label>
                                <div className="relative">
                                    <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-atlas-petrol/55" />
                                    <select
                                        value={perfil}
                                        onChange={(event) => setPerfil(event.target.value)}
                                        className="w-full rounded-xl border border-atlas-petrol/22 bg-white pl-10 pr-3 py-3 text-sm text-atlas-petrol-deep outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10"
                                    >
                                        {PERFIS.map((item) => (
                                            <option key={item.value} value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {erro && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                                    {erro}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-atlas-petrol-deep text-white py-3.5 px-5 text-sm font-semibold shadow-md hover:bg-atlas-petrol transition-all disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={15} className="animate-spin" />
                                        Abrindo pagamento
                                    </>
                                ) : (
                                    <>
                                        Ir para pagamento
                                        <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </form>

                        <p className="mt-4 text-xs text-atlas-petrol/70">
                            Ao continuar você será redirecionado para um ambiente seguro de pagamento.
                        </p>
                    </section>

                    <section className="atlas-soft-panel rounded-3xl p-8 lg:p-10 border border-atlas-petrol/14 flex flex-col justify-between">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-full bg-atlas-petrol/10 border border-atlas-petrol/20 px-3.5 py-1.5 text-xs font-semibold text-atlas-petrol mb-6">
                                <CreditCard size={13} />
                                Etapa 2 de 2 pagamento
                            </div>

                            <h2 className="text-2xl font-serif font-bold text-atlas-petrol-deep leading-tight">
                                Conclusão rápida e segura
                            </h2>
                            <p className="mt-3 text-sm text-atlas-petrol/80 leading-relaxed">
                                Depois da inscrição você será enviado para o checkout e, após o pagamento, terá acesso ao sistema com suas credenciais.
                            </p>

                            <ul className="mt-6 space-y-3 text-sm text-atlas-petrol-deep">
                                <li className="rounded-xl bg-white border border-atlas-petrol/18 px-3 py-2">
                                    Fluxo guiado com inscrição antes do pagamento
                                </li>
                                <li className="rounded-xl bg-white border border-atlas-petrol/18 px-3 py-2">
                                    Pagamento único com confirmação automática
                                </li>
                                <li className="rounded-xl bg-white border border-atlas-petrol/18 px-3 py-2">
                                    Acesso ao Atlas após validação da compra
                                </li>
                            </ul>
                        </div>

                        <div className="mt-8">
                            <Link href="/preco" className="text-sm font-semibold text-atlas-petrol hover:text-atlas-petrol-deep transition-colors">
                                Ver detalhes do investimento
                            </Link>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
