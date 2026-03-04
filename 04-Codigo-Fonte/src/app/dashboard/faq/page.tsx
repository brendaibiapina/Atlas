'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
    Search,
    ChevronDown,
    ExternalLink,
    ArrowLeft,
    HelpCircle,
    Sparkles,
    BookOpen,
    ClipboardList,
    Landmark,
    ShieldAlert,
    CalendarDays,
    Home,
    Coins,
    Store,
    Briefcase,
    type LucideIcon,
} from 'lucide-react';
import {
    getFAQItems,
    FAQ_CATEGORIES,
    FAQ_SOURCE_URL,
    type FAQCategory,
    type FAQCategoryIcon,
    type FAQItem,
} from '@/services/faq';

const CATEGORY_ICON_MAP: Record<FAQCategoryIcon, LucideIcon> = {
    CLIPBOARD: ClipboardList,
    LANDMARK: Landmark,
    SHIELD: ShieldAlert,
    CALENDAR: CalendarDays,
    HOME: Home,
    COINS: Coins,
    STORE: Store,
    BRIEFCASE: Briefcase,
};

function CategoryIcon({ icon }: { icon: FAQCategoryIcon }) {
    const Icon = CATEGORY_ICON_MAP[icon] || HelpCircle;
    return <Icon size={13} className="text-current" />;
}

function AccordionItem({ item, isOpen, onToggle }: { item: FAQItem; isOpen: boolean; onToggle: () => void }) {
    return (
        <div
            className={`rounded-xl border transition-all duration-300 overflow-hidden ${isOpen
                ? 'bg-white border-atlas-petrol/25 shadow-md'
                : 'bg-white/95 border-atlas-petrol/20 hover:border-atlas-petrol/20 hover:shadow-sm'
                }`}
        >
            <button onClick={onToggle} className="w-full text-left px-5 py-4 flex items-start gap-3 group">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors duration-200 ${isOpen
                    ? 'bg-atlas-petrol text-white'
                    : 'bg-[#f4f0e7] text-atlas-petrol/58 group-hover:bg-atlas-petrol/10 group-hover:text-atlas-petrol'
                    }`}>
                    <HelpCircle size={14} />
                </div>
                <span className={`text-sm font-semibold leading-snug flex-1 transition-colors ${isOpen ? 'text-atlas-petrol' : 'text-atlas-petrol-deep group-hover:text-atlas-petrol'
                    }`}>
                    {item.question}
                </span>
                <div className={`flex-shrink-0 mt-0.5 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    <ChevronDown size={16} className={isOpen ? 'text-atlas-petrol' : 'text-atlas-petrol/62'} />
                </div>
            </button>

            <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[700px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="px-5 pb-5 pl-[3.25rem]">
                    <div className="text-sm text-atlas-petrol/70 leading-relaxed whitespace-pre-line">{item.answer}</div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                        {item.tags.map((tag) => (
                            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-atlas-petrol/[0.12] text-atlas-petrol border border-atlas-petrol/20 font-medium">
                                {tag}
                            </span>
                        ))}
                    </div>

                    <div className="mt-3 pt-3 border-t border-atlas-petrol/8 flex items-center gap-1.5 text-[11px] text-atlas-petrol/68">
                        <BookOpen size={10} />
                        <span>Fonte: {item.source}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function FAQPage() {
    const allItems = useMemo(() => getFAQItems(), []);
    const [selectedCategory, setSelectedCategory] = useState<FAQCategory | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [openId, setOpenId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let items = allItems;

        if (selectedCategory !== 'ALL') {
            items = items.filter((item) => item.category === selectedCategory);
        }

        if (searchTerm.trim()) {
            const lower = searchTerm.toLowerCase();
            items = items.filter(
                (item) =>
                    item.question.toLowerCase().includes(lower) ||
                    item.answer.toLowerCase().includes(lower) ||
                    item.tags.some((tag) => tag.toLowerCase().includes(lower))
            );
        }

        return items;
    }, [allItems, selectedCategory, searchTerm]);

    const categories = Object.entries(FAQ_CATEGORIES) as [FAQCategory, typeof FAQ_CATEGORIES[FAQCategory]][];

    const counts = useMemo(() => {
        const mapped: Record<string, number> = {};
        for (const item of allItems) {
            mapped[item.category] = (mapped[item.category] || 0) + 1;
        }
        return mapped;
    }, [allItems]);

    return (
        <div className="space-y-6 stagger-children">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard" className="text-atlas-petrol/58 hover:text-atlas-petrol transition-colors">
                            <ArrowLeft size={16} />
                        </Link>
                        <h1 className="text-xl font-serif font-bold text-atlas-petrol-deep">Perguntas Frequentes</h1>
                    </div>
                    <p className="text-xs text-atlas-petrol/82 ml-6">
                        Fonte oficial: Ministério da Fazenda, Perguntas e Respostas sobre a Reforma Tributária
                    </p>
                </div>

                <a
                    href={FAQ_SOURCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs font-medium text-atlas-petrol bg-atlas-petrol/[0.12] px-3 py-2 rounded-xl border border-atlas-petrol/20 hover:bg-atlas-petrol/10 transition-colors"
                >
                    <ExternalLink size={12} /> PDF Original
                </a>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-atlas-petrol/58" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar por pergunta, palavra chave ou tema"
                        className="w-full pl-11 pr-4 py-3.5 bg-white/95 border border-atlas-petrol/26 text-atlas-petrol-deep placeholder-atlas-petrol/35 rounded-xl outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10 transition-all text-sm shadow-sm"
                    />
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory('ALL');
                            setOpenId(null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${selectedCategory === 'ALL'
                            ? 'bg-atlas-petrol text-white shadow-sm'
                            : 'bg-white border border-atlas-petrol/20 text-atlas-petrol/82 hover:border-atlas-petrol/20 hover:text-atlas-petrol'
                            }`}
                    >
                        Todas ({allItems.length})
                    </button>

                    {categories.map(([key, category]) => (
                        <button
                            key={key}
                            onClick={() => {
                                setSelectedCategory(key);
                                setOpenId(null);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${selectedCategory === key
                                ? 'bg-atlas-petrol text-white shadow-sm'
                                : 'bg-white border border-atlas-petrol/20 text-atlas-petrol/82 hover:border-atlas-petrol/20 hover:text-atlas-petrol'
                                }`}
                        >
                            <CategoryIcon icon={category.icon} />
                            {category.label}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${selectedCategory === key ? 'bg-white/20' : 'bg-atlas-petrol/[0.1]'
                                }`}>
                                {counts[key] || 0}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="text-xs text-atlas-petrol/75 font-medium">
                    {filtered.length} {filtered.length === 1 ? 'pergunta encontrada' : 'perguntas encontradas'}
                </div>

                <div className="space-y-2.5">
                    {filtered.length === 0 ? (
                        <div className="text-center py-16">
                            <HelpCircle size={32} className="text-atlas-petrol/20 mx-auto mb-3" />
                            <p className="text-sm text-atlas-petrol/75">Nenhuma pergunta encontrada para esta busca.</p>
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setSelectedCategory('ALL');
                                }}
                                className="text-xs text-atlas-petrol font-medium mt-2 hover:underline"
                            >
                                Limpar filtros
                            </button>
                        </div>
                    ) : (
                        filtered.map((item, index) => (
                            <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                                <AccordionItem
                                    item={item}
                                    isOpen={openId === item.id}
                                    onToggle={() => setOpenId(openId === item.id ? null : item.id)}
                                />
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="rounded-2xl bg-gradient-to-r from-atlas-gold/[0.06] via-transparent to-atlas-gold/[0.04] border border-atlas-gold/15 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-atlas-gold/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-atlas-gold-dark" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-bold text-atlas-petrol-deep">Não encontrou sua dúvida?</h3>
                    <p className="text-xs text-atlas-petrol/82 mt-0.5">Consulte o documento completo com todas as perguntas e respostas oficiais do Ministério da Fazenda.</p>
                </div>
                <a
                    href={FAQ_SOURCE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold text-atlas-gold-dark bg-atlas-gold/10 px-3 py-2 rounded-xl border border-atlas-gold/20 hover:bg-atlas-gold/15 transition-colors flex-shrink-0 flex items-center gap-1"
                >
                    Abrir PDF <ExternalLink size={11} />
                </a>
            </div>
        </div>
    );
}
