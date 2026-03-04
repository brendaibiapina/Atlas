'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { getReformStatus, getRecentFeed, type ReformStatus, type FeedItem } from '@/services/dashboard';
import {
    AlertTriangle, CheckCircle, Clock, ArrowRight, ExternalLink, TrendingUp,
    ListChecks, Radio, Building, Calendar, LogOut, Sparkles, Shield,
    ChevronRight, Zap, BookOpen, Bell, Bookmark
} from 'lucide-react';

function formatDisplayName(rawName: string): string {
    const normalized = rawName
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
        .join(' ');

    const [firstName] = normalized.split(' ');
    return firstName || 'Usuário';
}

/* ───────────────── Quick-Access Module Card ───────────────── */
function ModuleCard({ href, icon: Icon, title, description, accent, badge }: {
    href: string; icon: React.ElementType; title: string; description: string; accent: string; badge?: string;
}) {
    const accents: Record<string, { bg: string; icon: string; border: string; hover: string }> = {
        petrol: { bg: 'bg-atlas-petrol/[0.12]', icon: 'bg-atlas-petrol/12 text-atlas-petrol', border: 'border-atlas-petrol/22', hover: 'hover:border-atlas-petrol/28 hover:shadow-md' },
        gold: { bg: 'bg-atlas-gold/[0.05]', icon: 'bg-atlas-gold/12 text-atlas-gold-dark', border: 'border-atlas-gold/18', hover: 'hover:border-atlas-gold/30 hover:shadow-md' },
        emerald: { bg: 'bg-atlas-verdant-soft/70', icon: 'bg-atlas-verdant-soft text-atlas-verdant', border: 'border-atlas-verdant/15', hover: 'hover:border-atlas-verdant/30 hover:shadow-md' },
        blue: { bg: 'bg-atlas-petrol/[0.12]', icon: 'bg-atlas-petrol/10 text-atlas-petrol', border: 'border-atlas-petrol/20', hover: 'hover:border-atlas-petrol/25 hover:shadow-md' },
    };
    const c = accents[accent] || accents.petrol;

    return (
        <Link href={href} className={`group relative block rounded-2xl border p-5 transition-all duration-300 active:scale-[0.98] ${c.bg} ${c.border} ${c.hover}`}>
            <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.icon} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-atlas-petrol-deep text-sm">{title}</h3>
                        {badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-atlas-gold/10 text-atlas-gold-dark border border-atlas-gold/20 uppercase tracking-wider">
                                {badge}
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-atlas-petrol/82 mt-0.5 leading-relaxed">{description}</p>
                </div>
                <ChevronRight size={16} className="text-atlas-petrol/50 group-hover:text-atlas-petrol/72 group-hover:translate-x-0.5 transition-all mt-0.5" />
            </div>
        </Link>
    );
}

/* ───────────────── Tax Status Pill ───────────────── */
function TaxPill({ tax, status, label }: ReformStatus) {
    const styles: Record<string, { dot: string; text: string; bg: string }> = {
        'VIGENTE': { dot: 'bg-atlas-verdant', text: 'text-atlas-verdant', bg: 'bg-atlas-verdant-soft/70 border-atlas-verdant/20' },
        'PENDING': { dot: 'bg-atlas-gold', text: 'text-atlas-gold-dark', bg: 'bg-atlas-gold/10 border-atlas-gold/25' },
        'EM_CONSTRUCAO': { dot: 'bg-atlas-petrol', text: 'text-atlas-petrol', bg: 'bg-atlas-petrol/[0.1] border-atlas-petrol/20' },
    };
    const s = styles[status] || styles.PENDING;

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${s.bg}`}>
            <div className="relative">
                <span className={`w-2.5 h-2.5 rounded-full block ${s.dot}`} />
                {status === 'VIGENTE' && <span className={`w-2.5 h-2.5 rounded-full block ${s.dot} absolute inset-0 animate-ping opacity-50`} />}
            </div>
            <div>
                <span className="text-sm font-bold text-atlas-petrol-deep">{tax}</span>
                <span className={`block text-[10px] font-semibold uppercase tracking-wider ${s.text}`}>{label}</span>
            </div>
        </div>
    );
}

/* ───────────────── Feed Card ───────────────── */
function FeedCard({ item, index }: { item: FeedItem; index: number }) {
    const [hovered, setHovered] = useState(false);

    return (
        <div
            className="group flex gap-4 p-4 rounded-xl bg-white/95 border border-atlas-petrol/20 hover:border-atlas-petrol/20 hover:shadow-sm transition-all duration-200 cursor-pointer animate-slide-up active:scale-[0.99]"
            style={{ animationDelay: `${index * 60}ms` }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Source badge */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black tracking-wide flex-shrink-0 transition-transform duration-200 ${hovered ? 'scale-110' : ''} ${item.source === 'DOU' ? 'bg-atlas-verdant-soft text-atlas-verdant border border-atlas-verdant/20' :
                    item.source === 'RFB' ? 'bg-atlas-petrol/[0.12] text-atlas-petrol border border-atlas-petrol/28' :
                        'bg-[#f4f0e7] text-atlas-petrol/70 border border-atlas-petrol/20'
                }`}>
                {item.source}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-atlas-petrol-deep leading-snug group-hover:text-atlas-petrol transition-colors">
                    {item.title}
                </h4>
                <p className="text-xs text-atlas-petrol/82 mt-1 line-clamp-1">{item.description}</p>

                {/* Meta */}
                <div className="flex items-center gap-3 mt-2">
                    <span className="text-[11px] text-atlas-petrol/62 font-medium flex items-center gap-1">
                        <Calendar size={10} /> {item.date}
                    </span>
                    {item.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-atlas-petrol/[0.12] text-atlas-petrol/80 border border-atlas-petrol/20 font-medium">
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            {/* Link */}
            {item.url && (
                <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 text-[11px] text-atlas-petrol font-medium opacity-0 group-hover:opacity-100 transition-opacity self-center px-2.5 py-1.5 rounded-lg bg-atlas-petrol/[0.12] hover:bg-atlas-petrol/10 flex-shrink-0"
                >
                    <ExternalLink size={11} /> Fonte
                </a>
            )}
        </div>
    );
}

/* ═══════════════════ MAIN DASHBOARD ═══════════════════ */
export default function DashboardHome() {
    const router = useRouter();
    const [reformStatus, setReformStatus] = useState<ReformStatus[]>([]);
    const [feed, setFeed] = useState<FeedItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState('Usuário');

    useEffect(() => {
        Promise.all([
            getReformStatus(),
            getRecentFeed()
        ]).then(([status, feedData]) => {
            setReformStatus(status);
            setFeed(feedData);
        }).catch(() => { }).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            return;
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );

        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;

            const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
            const metadataName = [metadata.full_name, metadata.name, metadata.nome].find(
                (value): value is string => typeof value === 'string' && value.trim().length > 0
            );

            if (metadataName) {
                setUserName(formatDisplayName(metadataName));
                return;
            }

            if (user.email) {
                const emailPrefix = user.email.split('@')[0]?.replace(/[._-]+/g, ' ');
                if (emailPrefix) {
                    setUserName(formatDisplayName(emailPrefix));
                }
            }
        });
    }, []);

    const handleLogout = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="space-y-8 stagger-children">

            {/* ────── Header with Greeting + Logout ────── */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-atlas-petrol-deep">
                        <span className="text-atlas-petrol-deep">Bom dia, </span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-atlas-petrol-deep via-atlas-petrol to-atlas-gold-dark">
                            {userName}
                        </span>
                        <span className="text-atlas-petrol-deep">.</span>
                    </h1>
                    <p className="text-atlas-petrol/82 text-sm mt-0.5">
                        Aqui está o panorama atualizado da Reforma Tributária.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-atlas-petrol/70 bg-white/95 border border-atlas-petrol/22 hover:border-atlas-petrol/30 hover:text-atlas-petrol hover:bg-atlas-petrol/[0.12] transition-all duration-200 shadow-sm active:scale-[0.97]"
                >
                    <LogOut size={16} /> Sair
                </button>
            </div>

            {/* ────── Status da Reforma, Live Indicators ────── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-atlas-verdant" />
                    <h2 className="text-xs font-bold text-atlas-petrol/75 uppercase tracking-wider">Status dos Tributos</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                    {reformStatus.map((rs) => (
                        <TaxPill key={rs.tax} {...rs} />
                    ))}
                </div>
            </div>

            {/* ────── Quick Access Modules ────── */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-atlas-gold-dark" />
                    <h2 className="text-xs font-bold text-atlas-petrol/75 uppercase tracking-wider">Módulos</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ModuleCard
                        href="/dashboard/obrigacoes"
                        icon={ListChecks}
                        title="Obrigações Acessórias"
                        description="Veja o que já é exigível em 2026 e prepare-se antes do prazo."
                        accent="petrol"
                        badge="4 itens"
                    />
                    <ModuleCard
                        href="/dashboard/timeline"
                        icon={Calendar}
                        title="Linha do Tempo"
                        description="Cronograma completo de 2023 a 2033, marcos e prazos."
                        accent="emerald"
                    />
                    <ModuleCard
                        href="/dashboard/radar"
                        icon={Radio}
                        title="Radar Normativo"
                        description="Publicações oficiais do DOU, RFB e atos do Comitê Gestor."
                        accent="blue"
                    />
                    <ModuleCard
                        href="/dashboard/favoritos"
                        icon={Bookmark}
                        title="Favoritos"
                        description="Salve obrigações e atualizações para montar sua trilha pessoal."
                        accent="petrol"
                    />
                    <ModuleCard
                        href="/dashboard/imobiliario"
                        icon={Building}
                        title="Módulo Imobiliário"
                        description="Simulador de alíquota efetiva e regras por tipo de operação."
                        accent="gold"
                        badge="novo"
                    />
                </div>
            </div>

            {/* ────── CTA: Checklist 2026 ────── */}
            <Link
                href="/dashboard/obrigacoes"
                className="group block relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a354b] via-[#0d4460] to-[#12617a] p-6 hover:shadow-lg transition-all duration-300 active:scale-[0.99]"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-white/[0.06] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
                        <Shield size={22} className="text-atlas-verdant-soft" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-base">Checklist 2026</h3>
                        <p className="text-sm text-white/75 mt-0.5">Saiba exatamente o que já é obrigatório e planeje sua adaptação agora.</p>
                    </div>
                    <ArrowRight size={20} className="text-white/40 group-hover:text-atlas-verdant-soft group-hover:translate-x-1 transition-all" />
                </div>
            </Link>

            {/* ────── Recent Updates Feed ────── */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Bell size={14} className="text-atlas-gold-dark" />
                        <h2 className="text-xs font-bold text-atlas-petrol/75 uppercase tracking-wider">Atualizações Recentes</h2>
                    </div>
                    <Link
                        href="/dashboard/radar"
                        className="text-[11px] font-medium text-atlas-petrol flex items-center gap-1 hover:underline"
                    >
                        Ver todas <ArrowRight size={11} />
                    </Link>
                </div>
                <div className="space-y-2.5">
                    {loading ? (
                        <div className="text-center py-12 text-sm text-atlas-petrol/68">Carregando atualizações...</div>
                    ) : feed.length === 0 ? (
                        <div className="text-center py-12 text-sm text-atlas-petrol/68">Nenhuma atualização encontrada.</div>
                    ) : (
                        feed.map((item, i) => (
                            <FeedCard key={item.id} item={item} index={i} />
                        ))
                    )}
                </div>
            </div>

            {/* ────── Learning Banner ────── */}
            <div className="rounded-2xl bg-gradient-to-r from-atlas-petrol/[0.06] via-transparent to-atlas-verdant-soft/60 border border-atlas-petrol/26 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-atlas-verdant-soft flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-atlas-verdant" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-atlas-petrol-deep">Entenda a Reforma Tributária</h3>
                    <p className="text-xs text-atlas-petrol/82 mt-0.5">Módulo didático com cronograma visual, explicações por fase e impacto por setor.</p>
                </div>
                <Link
                    href="/dashboard/timeline"
                    className="text-xs font-semibold text-atlas-petrol bg-atlas-petrol/[0.12] px-3 py-2 rounded-xl border border-atlas-petrol/20 hover:bg-atlas-petrol/[0.12] transition-colors flex-shrink-0 flex items-center gap-1"
                >
                    Explorar <ArrowRight size={12} />
                </Link>
            </div>
        </div>
    );
}
