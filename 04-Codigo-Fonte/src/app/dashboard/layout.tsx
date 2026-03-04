'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';
import {
    LayoutDashboard, ListChecks, Clock, Radio, Building, HelpCircle, Menu, X, ShieldCheck, ChevronRight, MessageCircle, Bookmark
} from 'lucide-react';
import { isAdminEmail } from '@/lib/admin';
import FAQChatbot from '@/components/dashboard/FAQChatbot';
import { AtlasLogo } from '@/components/brand/AtlasLogo';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
    { href: '/dashboard/obrigacoes', label: 'Obrigações', icon: ListChecks },
    { href: '/dashboard/timeline', label: 'Timeline', icon: Clock },
    { href: '/dashboard/radar', label: 'Radar', icon: Radio },
    { href: '/dashboard/favoritos', label: 'Favoritos', icon: Bookmark },
    { href: '/dashboard/imobiliario', label: 'Imobiliário', icon: Building },
    { href: '/dashboard/faq', label: 'Dúvidas Frequentes', icon: HelpCircle },
];

function NavItem({ href, label, icon: Icon, active }: { href: string; label: string; icon: React.ElementType; active: boolean }) {
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                ? 'bg-[#f7f4eb] text-atlas-petrol-deep border border-white/55 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/[0.1]'
                }`}
        >
            <Icon size={18} className={active ? 'text-atlas-verdant' : 'text-white/60 group-hover:text-white'} />
            {label}
            {active && <ChevronRight size={14} className="ml-auto text-atlas-petrol/62" />}
        </Link>
    );
}

function NavAction({
    label,
    icon: Icon,
    active,
    onClick,
}: {
    label: string;
    icon: React.ElementType;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${active
                ? 'bg-[#f7f4eb] text-atlas-petrol-deep border border-white/55 shadow-sm'
                : 'text-white/80 hover:text-white hover:bg-white/[0.1]'
                }`}
        >
            <Icon size={18} className={active ? 'text-atlas-verdant' : 'text-white/60 group-hover:text-white'} />
            {label}
            {active && <ChevronRight size={14} className="ml-auto text-atlas-petrol/62" />}
        </button>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [canAccessAdmin, setCanAccessAdmin] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setChatOpen(false);
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    useEffect(() => {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setCanAccessAdmin(false);
            return;
        }

        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        supabase.auth.getUser().then(({ data: { user } }) => {
            setCanAccessAdmin(isAdminEmail(user?.email));
        });
    }, []);

    return (
        <div className="min-h-screen flex">

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="fixed top-4 left-4 z-50 md:hidden w-10 h-10 rounded-xl bg-atlas-petrol-deep border border-white/20 text-white flex items-center justify-center shadow-lg"
                aria-label="Menu"
            >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {chatOpen && (
                <div
                    className="fixed inset-0 md:left-[260px] bg-atlas-graphite/25 backdrop-blur-[1.5px] z-40 animate-fade-in"
                    onClick={() => setChatOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                w-[260px] bg-gradient-to-b from-[#072b3f] via-[#0a3b56] to-[#0f4b62] fixed h-full flex flex-col z-40
                transition-transform duration-300 ease-out
                ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0
            `}>
                {/* Logo */}
                <div className="p-6 pb-4 border-b border-white/[0.08]">
                    <Link href="/dashboard" className="group inline-flex flex-col items-start gap-1 px-1 py-1 rounded-lg">
                        <AtlasLogo
                            variant="fullCompact"
                            className="h-6 w-auto opacity-95 group-hover:opacity-100 transition-opacity"
                        />
                        <p className="pl-0.5 text-[8px] font-medium uppercase tracking-[0.26em] text-atlas-gold/90">painel</p>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 space-y-1 stagger-children">
                    {NAV_ITEMS.map(item => (
                        <NavItem
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                        />
                    ))}
                    <NavAction
                        label="Chat do Sistema"
                        icon={MessageCircle}
                        active={chatOpen}
                        onClick={() => setChatOpen((prev) => !prev)}
                    />
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    {canAccessAdmin && (
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.1] transition-colors"
                        >
                            <ShieldCheck size={14} /> Admin
                        </Link>
                    )}
                </div>
            </aside>

            <aside
                className={`fixed z-50 transition-all duration-300 ease-out
                    left-0 right-0 bottom-0 top-[64px]
                    md:left-auto md:right-6 md:bottom-6 md:top-6 md:w-[430px]
                    ${chatOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none'}
                `}
                aria-hidden={!chatOpen}
            >
                <div className="h-full flex flex-col bg-[#f7f4eb] border border-atlas-petrol/26 md:rounded-3xl shadow-[0_28px_60px_-26px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="h-16 px-4 border-b border-atlas-petrol/20 bg-white/95 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-bold text-atlas-petrol-deep">Chat do Sistema</h2>
                            <p className="text-[11px] text-atlas-petrol/82">Base interna e operacionalidade do Atlas</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setChatOpen(false)}
                            className="w-8 h-8 rounded-lg border border-atlas-petrol/26 text-atlas-petrol/80 hover:text-atlas-petrol-deep hover:bg-atlas-petrol/[0.14] flex items-center justify-center transition-colors"
                            aria-label="Fechar chat"
                        >
                            <X size={15} />
                        </button>
                    </div>

                    <div className="flex-1 p-4 overflow-hidden bg-gradient-to-b from-[#fcfaf3] to-[#f3ede0]">
                        <FAQChatbot embedded className="h-full" />
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 md:ml-[260px] min-h-screen gradient-dashboard-shell">
                <div className="p-6 md:p-8 max-w-[1200px] mx-auto animate-fade-in">
                    {children}
                </div>
            </main>
        </div>
    );
}
