'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { Lock, Mail, ArrowRight, Loader2, ShieldCheck, Radio, BarChart3 } from 'lucide-react';
import { AtlasLogo } from '@/components/brand/AtlasLogo';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ));

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError('Email ou senha inválidos');
            setLoading(false);
        } else {
            router.push('/dashboard');
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen flex bg-[#f8f5ed]">
            {/* Left, Brand Side */}
            <div className="hidden lg:flex lg:w-1/2 bg-atlas-petrol-deep relative overflow-hidden items-center justify-center">
                {/* Subtle glow */}
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-atlas-petrol-light/35 rounded-full blur-3xl animate-glow-breathe" />
                <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-atlas-gold/15 rounded-full blur-3xl animate-glow-breathe" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 text-center px-12 max-w-md">
                    <div className="rounded-2xl bg-white/90 border border-white/70 px-4 py-2.5 inline-flex items-center justify-center mx-auto mb-8">
                        <AtlasLogo variant="fullCompact" className="h-7 w-auto" priority />
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-white mb-4 leading-tight">
                        Atlas da Reforma<br />Tributária
                    </h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-10">
                        Monitoramento em tempo real do DOU, alertas inteligentes
                        e a base legal sempre atualizada.
                    </p>

                    {/* Feature pills */}
                    <div className="space-y-3">
                        {[
                            { icon: <ShieldCheck size={14} />, text: 'Fontes 100% oficiais' },
                            { icon: <Radio size={14} />, text: 'Radar normativo diário' },
                            { icon: <BarChart3 size={14} />, text: 'Simulador imobiliário' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-3 bg-white/[0.06] rounded-full px-5 py-2.5 mx-auto max-w-xs">
                                <span className="text-atlas-gold">{f.icon}</span>
                                <span className="text-white/60 text-sm">{f.text}</span>
                            </div>
                        ))}
                    </div>

                    <p className="text-white/15 text-xs mt-10 flex items-center justify-center gap-1">
                        <Lock size={10} /> Dados protegidos com Supabase Auth
                    </p>
                </div>
            </div>

            {/* Right, Login Form */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden mb-10 text-center">
                        <div className="inline-flex rounded-2xl bg-white border border-atlas-petrol/15 px-4 py-2.5 shadow-sm mx-auto mb-4">
                            <AtlasLogo variant="fullCompact" className="h-6 w-auto" />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-atlas-petrol-deep">Atlas da Reforma</h2>
                    </div>

                    <div className="bg-white rounded-3xl border border-atlas-petrol/10 shadow-lg p-8">
                        <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep mb-1">Entrar</h1>
                        <p className="text-gray-400 text-sm mb-8">Acesse seu painel de monitoramento.</p>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="seu@email.com"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 rounded-xl outline-none focus:border-atlas-petrol/30 focus:ring-2 focus:ring-atlas-petrol/10 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Senha</label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="||||||||"
                                        className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-300 rounded-xl outline-none focus:border-atlas-petrol/30 focus:ring-2 focus:ring-atlas-petrol/10 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-atlas-petrol-deep text-white font-semibold py-3.5 rounded-full text-sm shadow-md hover:bg-atlas-petrol hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 active:scale-[0.99]"
                            >
                                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Entrar <ArrowRight size={16} /></>}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-300 mt-6">
                            <Link href="/" className="text-atlas-petrol hover:underline">← Voltar para o início</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
