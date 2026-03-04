'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FilterButton } from '@/components/ui/Button';
import {
    getObligations,
    DEFAULT_OBLIGATION_SOURCE_TITLE,
    DEFAULT_OBLIGATION_SOURCE_URL,
} from '@/services/obligations';
import { listFavorites, toggleFavorite, toFavoriteKey } from '@/services/favorites';
import { Obligation } from '@/lib/types';
import { ListChecks, ArrowRight, Calendar, Bookmark, BookmarkCheck } from 'lucide-react';

const FILTERS = [
    { key: 'ALL', label: 'Todas' },
    { key: 'VIGENTE', label: 'Vigentes' },
    { key: 'EM_CONSTRUCAO', label: 'Em Construção' },
    { key: 'FUTURO', label: 'Futuras' },
];

function formatDate(dateValue?: string): string {
    if (!dateValue) return 'A definir';
    const parsed = new Date(`${dateValue}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateValue;
    return parsed.toLocaleDateString('pt-BR');
}

export default function ObrigacoesPage() {
    const [filter, setFilter] = useState('ALL');
    const [obrigacoes, setObrigacoes] = useState<Obligation[]>([]);
    const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
    const [togglingKey, setTogglingKey] = useState<string | null>(null);

    useEffect(() => {
        getObligations().then(setObrigacoes).catch(() => setObrigacoes([]));
    }, []);

    useEffect(() => {
        async function loadFavorites() {
            const favorites = await listFavorites('OBRIGACAO');
            const keys = favorites.map((item) => toFavoriteKey(item.item_type, item.item_id));
            setFavoriteKeys(new Set(keys));
        }

        void loadFavorites();
    }, []);

    const filtered = filter === 'ALL' ? obrigacoes : obrigacoes.filter(o => o.compliance_status === filter);

    const counts = obrigacoes.reduce((acc, o) => {
        acc[o.compliance_status] = (acc[o.compliance_status] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    async function handleToggleFavorite(ob: Obligation) {
        const favoriteKey = toFavoriteKey('OBRIGACAO', ob.id);
        setTogglingKey(favoriteKey);

        const result = await toggleFavorite({
            item_type: 'OBRIGACAO',
            item_id: ob.id,
            title: ob.title,
            summary: ob.description,
            status: ob.compliance_status,
            source_label: ob.source_title || ob.reference_title || DEFAULT_OBLIGATION_SOURCE_TITLE,
            source_url: ob.source_url || DEFAULT_OBLIGATION_SOURCE_URL,
            tags: [...(ob.audience || []), ob.compliance_status],
            metadata: {
                start_date: ob.start_date || null,
                penalty_grace_period_end: ob.penalty_grace_period_end || null,
            },
        });

        setFavoriteKeys((prev) => {
            const next = new Set(prev);
            if (result.saved) {
                next.add(favoriteKey);
            } else {
                next.delete(favoriteKey);
            }
            return next;
        });

        setTogglingKey(null);
    }

    return (
        <div className="space-y-7 stagger-children">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-atlas-petrol/[0.12] border border-atlas-petrol/26 flex items-center justify-center">
                    <ListChecks size={18} className="text-atlas-petrol" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep">Obrigações Acessórias</h1>
                    <p className="text-atlas-petrol/82 text-sm">Acompanhe as obrigações oficiais monitoradas</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                    <FilterButton
                        key={f.key}
                        active={filter === f.key}
                        onClick={() => setFilter(f.key)}
                    >
                        {f.label}
                        {f.key !== 'ALL' && counts[f.key] ? (
                            <span className="ml-1 text-[10px] bg-white text-atlas-petrol-deep border border-atlas-petrol/30 px-1.5 py-0.5 rounded-full">{counts[f.key]}</span>
                        ) : null}
                    </FilterButton>
                ))}
            </div>

            {/* Obligations List */}
            <div className="space-y-3">
                {filtered.length === 0 ? (
                    <div className="text-center text-atlas-petrol/75 py-12 text-sm">Nenhuma obrigação encontrada.</div>
                ) : (
                    filtered.map((ob, i) => {
                        const sourceUrl = ob.source_url || DEFAULT_OBLIGATION_SOURCE_URL;
                        const sourceTitle = ob.source_title || DEFAULT_OBLIGATION_SOURCE_TITLE;
                        const startDate = ob.start_date ? formatDate(ob.start_date) : null;
                        const graceDate = formatDate(ob.penalty_grace_period_end);
                        const favoriteKey = toFavoriteKey('OBRIGACAO', ob.id);
                        const isFavorite = favoriteKeys.has(favoriteKey);
                        const isToggling = togglingKey === favoriteKey;

                        return (
                        <Card key={ob.id} className="p-5 group hover:border-atlas-petrol/30 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge status={ob.compliance_status} />
                                        <span className="text-[10px] text-atlas-petrol-deep font-semibold uppercase tracking-wider bg-white border border-atlas-petrol/25 rounded-full px-2 py-0.5">
                                            {ob.reference_title || sourceTitle}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-atlas-petrol-deep text-sm group-hover:text-atlas-petrol transition-colors">{ob.title}</h3>
                                    <p className="text-sm text-atlas-petrol/82 mt-1 line-clamp-2">{ob.description}</p>

                                    {startDate && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-atlas-verdant">
                                            <Calendar size={12} />
                                            <span>Início: {startDate}</span>
                                        </div>
                                    )}

                                    {ob.penalty_grace_period_end && (
                                        <div className="flex items-center gap-1.5 mt-3 text-xs text-atlas-gold-dark">
                                            <Calendar size={12} />
                                            <span>Período educativo até: {graceDate}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => void handleToggleFavorite(ob)}
                                        disabled={isToggling}
                                        className={`inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 transition-colors ${isFavorite
                                            ? 'text-atlas-gold-dark bg-atlas-gold/10 hover:bg-atlas-gold/15'
                                            : 'text-atlas-petrol/58 hover:text-atlas-petrol hover:bg-atlas-petrol/[0.12]'
                                            }`}
                                        title={isFavorite ? 'Remover dos favoritos' : 'Salvar em favoritos'}
                                        aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar em favoritos'}
                                    >
                                        {isFavorite ? <BookmarkCheck size={15} /> : <Bookmark size={15} />}
                                    </button>

                                    <Link
                                        href={sourceUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        title={sourceTitle}
                                        aria-label={`Abrir fonte oficial: ${sourceTitle}`}
                                        className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-atlas-petrol opacity-70 group-hover:opacity-100 hover:bg-atlas-petrol/[0.12] transition-opacity"
                                    >
                                        <ArrowRight size={14} />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    );
                    })
                )}
            </div>
        </div>
    );
}
