'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/public/Header';
import { CheckCircle, Mail, ArrowRight, Sparkles, Shield, Clock, AlertTriangle, Loader2 } from 'lucide-react';

type VerificationState = 'loading' | 'paid' | 'not_paid' | 'invalid';

export default function SuccessPage() {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [verification, setVerification] = useState<VerificationState>('loading');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('session_id');
        setSessionId(id);

        if (!id) {
            setVerification('invalid');
            return;
        }

        const verifySession = async () => {
            setVerification('loading');
            try {
                const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(id)}`);
                const data = await response.json();
                if (!response.ok) {
                    setVerification('invalid');
                    return;
                }

                setVerification(data.paid ? 'paid' : 'not_paid');
            } catch {
                setVerification('invalid');
            }
        };

        verifySession();
    }, []);

    const isPaid = verification === 'paid';
    const isLoading = verification === 'loading';
    const isInvalid = verification === 'invalid' || verification === 'not_paid';

    return (
        <div className="min-h-screen bg-white">
            <Header />

            <main className="pt-36 pb-20 px-8 md:px-12 lg:px-16 xl:px-24">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Success Icon */}
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 animate-slide-up ${isPaid ? 'bg-emerald-50' : isLoading ? 'bg-blue-50' : 'bg-amber-50'
                        }`}>
                        {isPaid ? (
                            <CheckCircle size={40} className="text-emerald-500" />
                        ) : isLoading ? (
                            <Loader2 size={36} className="text-blue-500 animate-spin" />
                        ) : (
                            <AlertTriangle size={38} className="text-amber-500" />
                        )}
                    </div>

                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-atlas-petrol-deep mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        {isPaid ? 'Pagamento confirmado!' : isLoading ? 'Confirmando pagamento...' : 'Não foi possível confirmar o pagamento'}
                    </h1>

                    <p className="text-lg text-gray-400 mb-12 animate-slide-up" style={{ animationDelay: '200ms' }}>
                        {isPaid
                            ? 'Seu acesso vitalício ao Atlas da Reforma Tributária foi ativado.'
                            : isLoading
                                ? 'Estamos validando sua sessão de checkout com segurança.'
                                : 'Se você já pagou, aguarde alguns segundos e recarregue esta página.'}
                    </p>

                    {/* Steps */}
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-left mb-10 animate-slide-up" style={{ animationDelay: '300ms' }}>
                        <h2 className="text-lg font-bold text-atlas-petrol-deep mb-6 flex items-center gap-2">
                            <Sparkles size={18} className="text-atlas-gold" />
                            {isPaid ? 'Próximos passos' : 'Status da sessão'}
                        </h2>

                        <div className="space-y-6">
                            {isPaid ? (
                                <>
                                    <StepItem
                                        step={1}
                                        icon={<Mail size={18} />}
                                        title="Verifique seu email"
                                        description="Enviamos um link para você definir sua senha de acesso. Confira também a pasta de spam."
                                    />
                                    <StepItem
                                        step={2}
                                        icon={<Shield size={18} />}
                                        title="Defina sua senha"
                                        description="Clique no link do email e escolha uma senha segura para acessar o painel."
                                    />
                                    <StepItem
                                        step={3}
                                        icon={<ArrowRight size={18} />}
                                        title="Acesse o Dashboard"
                                        description="Faça login e comece a monitorar a Reforma Tributária com segurança."
                                    />
                                </>
                            ) : (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 text-amber-700 px-4 py-3 text-sm">
                                    Sessão: {sessionId || 'não informada'}. Se você concluiu o pagamento, aguarde a confirmação do Stripe e recarregue.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '400ms' }}>
                        <Link
                            href="/login"
                            className="bg-atlas-petrol-deep text-white px-8 py-3.5 rounded-full font-semibold shadow-md hover:bg-atlas-petrol hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
                        >
                            {isInvalid ? 'Voltar para o Login' : 'Ir para o Login'} <ArrowRight size={16} />
                        </Link>
                        {isInvalid && (
                            <Link
                                href="/preco"
                                className="bg-white text-gray-700 px-8 py-3.5 rounded-full font-semibold border border-gray-200 hover:border-atlas-petrol/20 hover:shadow-md transition-all"
                            >
                                Voltar ao Checkout
                            </Link>
                        )}
                    </div>

                    <p className="text-xs text-gray-300 mt-8 flex items-center justify-center gap-1.5">
                        <Clock size={12} />
                        {isPaid ? 'O email pode levar até 5 minutos para chegar' : 'A confirmação pode levar alguns instantes'}
                    </p>
                </div>
            </main>
        </div>
    );
}

function StepItem({ step, icon, title, description }: { step: number; icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-atlas-petrol/10 flex items-center justify-center text-atlas-petrol">
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-gray-800 mb-0.5">
                    <span className="text-atlas-gold mr-1.5">{step}.</span>
                    {title}
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
