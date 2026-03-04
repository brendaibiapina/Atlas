'use client';

import React, { useMemo, useState } from 'react';
import { Bot, Send, MessageSquareQuote, ExternalLink, Loader2 } from 'lucide-react';
import { answerFAQQuestion } from '@/services/faq-chat';
import { cn } from '@/lib/utils';

type ChatRole = 'assistant' | 'user';

type ChatMessage = {
    id: string;
    role: ChatRole;
    text: string;
    source_question?: string;
    source_label?: string;
    source_url?: string;
};

const EXAMPLE_QUESTION = 'A partir de quantos imóveis em aluguel, incidirá IBS/CBS?';

function newMessage(role: ChatRole, text: string): ChatMessage {
    return {
        id: `${Date.now()}${Math.random().toString(16).slice(2, 6)}`,
        role,
        text,
    };
}

type FAQChatbotProps = {
    className?: string;
    embedded?: boolean;
};

export default function FAQChatbot({ className, embedded = false }: FAQChatbotProps) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: 'assistant-welcome',
            role: 'assistant',
            text: 'Assistente com base interna ativa. Respostas com dados do sistema e orientações de uso da plataforma. Para análise individual procure advogado especialista. Curadoria jurídica por Brenda Ibiapina OAB/DF 83.671. Instagram @brendaibiapina: https://instagram.com/brendaibiapina.',
        },
    ]);

    const hasMessages = useMemo(() => messages.length > 0, [messages.length]);

    async function submitQuestion(rawQuestion: string) {
        const asked = rawQuestion.trim();
        if (!asked || loading) return;

        const userMessage = newMessage('user', asked);
        setMessages((prev) => [...prev, userMessage]);
        setQuestion('');
        setLoading(true);

        try {
            const result = await answerFAQQuestion(asked);

            const assistantMessage: ChatMessage = {
                id: `${Date.now()}assistant`,
                role: 'assistant',
                text: result.answer,
                source_question: result.source?.question,
                source_label: result.source?.source,
                source_url: result.source?.source_url,
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: `${Date.now()}assistant-error`,
                    role: 'assistant',
                    text: 'Não foi possível consultar a base interna neste momento.',
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section
            className={cn(
                'rounded-3xl border border-atlas-petrol/22 bg-gradient-to-br from-white via-[#fdfbf6] to-atlas-petrol/[0.03] p-4 shadow-sm flex flex-col',
                className,
                embedded && 'rounded-none border-0 bg-transparent p-0 shadow-none'
            )}
        >
            <div className="rounded-2xl bg-gradient-to-r from-[#0b3a54] to-[#12506d] p-4 text-white">
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-white/12 ring-1 ring-atlas-verdant/40 flex items-center justify-center">
                        <Bot size={18} className="text-atlas-verdant-soft" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black tracking-wide uppercase">Chat de Dúvidas</h3>
                        <p className="text-xs text-white/75">Respostas ancoradas na base oficial do Atlas</p>
                    </div>
                </div>

            </div>

            <div className="mt-4 rounded-2xl border border-atlas-petrol/20 bg-white/95 p-3">
                <p className="text-[11px] uppercase tracking-wider text-atlas-petrol/80 font-semibold">Pergunta de exemplo</p>
                <button
                    type="button"
                    onClick={() => {
                        void submitQuestion(EXAMPLE_QUESTION);
                    }}
                    className="mt-1 w-full rounded-xl border border-atlas-petrol/26 bg-atlas-petrol/[0.12] px-3 py-2 text-left text-xs text-atlas-petrol font-semibold hover:bg-atlas-petrol/[0.14] transition-colors"
                >
                    {`"${EXAMPLE_QUESTION}"`}
                </button>
            </div>

            <div className="mt-4 rounded-2xl border border-atlas-petrol/20 bg-white p-3 flex-1 min-h-0 flex flex-col">
                <div className="flex items-center gap-2 text-xs text-atlas-petrol/75 mb-2">
                    <MessageSquareQuote size={13} className="text-atlas-petrol" />
                    Histórico
                </div>

                <div className="flex-1 min-h-[220px] overflow-auto space-y-2 pr-1">
                    {!hasMessages && <p className="text-xs text-atlas-petrol/72">Sem mensagens.</p>}

                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`rounded-xl px-3 py-2 text-sm ${message.role === 'assistant'
                                ? 'bg-[#f4f0e7] border border-atlas-petrol/20 text-atlas-petrol-deep'
                                : 'bg-atlas-petrol-deep text-white'
                                }`}
                        >
                            <p className="leading-relaxed">{message.text}</p>

                            {message.role === 'assistant' && message.source_question && (
                                <div className="mt-2 pt-2 border-t border-atlas-petrol/26 text-[11px] text-atlas-petrol/70">
                                    <p className="font-semibold">Base usada</p>
                                    <p>{message.source_question}</p>
                                    {message.source_url && (
                                        <a
                                            href={message.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-1 inline-flex items-center gap-1 text-atlas-petrol hover:underline"
                                        >
                                            Fonte oficial {message.source_label || 'Atlas'} <ExternalLink size={10} />
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {loading && (
                        <div className="rounded-xl px-3 py-2 text-sm bg-[#f4f0e7] border border-atlas-petrol/20 text-atlas-petrol/75 flex items-center gap-2">
                            <Loader2 size={14} className="animate-spin text-atlas-petrol" />
                            Consultando a base interna...
                        </div>
                    )}
                </div>

                <form
                    className="mt-3 flex items-center gap-2"
                    onSubmit={(event) => {
                        event.preventDefault();
                        void submitQuestion(question);
                    }}
                >
                    <input
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        placeholder="Digite sua pergunta"
                        disabled={loading}
                        className="flex-1 rounded-xl border border-atlas-petrol/26 px-3 py-2 text-sm outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-xl bg-atlas-petrol-deep text-white p-2.5 hover:bg-atlas-petrol transition-colors disabled:opacity-60"
                        aria-label="Enviar pergunta"
                    >
                        {loading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    </button>
                </form>
            </div>
        </section>
    );
}
