'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { FilterButton } from '@/components/ui/Button';
import { listFavorites, removeFavorite } from '@/services/favorites';
import type { FavoriteItem, FavoriteItemType } from '@/lib/types';
import { Bookmark, ExternalLink, Search, Trash2, ListChecks, Radio } from 'lucide-react';

const FILTERS: Array<{ key: 'ALL' | FavoriteItemType; label: string }> = [
    { key: 'ALL', label: 'Todos' },
    { key: 'OBRIGACAO', label: 'Obrigações' },
    { key: 'ATUALIZACAO', label: 'Atualizações' },
];

function getItemTypeLabel(type: FavoriteItemType): string {
    if (type === 'OBRIGACAO') return 'Obrigação';
    return 'Atualização';
}

function getDestinationPath(type: FavoriteItemType): string {
    return type === 'OBRIGACAO' ? '/dashboard/obrigacoes' : '/dashboard/radar';
}

export default function FavoritosPage() {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);
    const [filter, setFilter] = useState<'ALL' | FavoriteItemType>('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function load() {
            setLoading(true);
            const data = await listFavorites();
            setFavorites(data);
            setLoading(false);
        }

        void load();
    }, []);

    const filtered = useMemo(() => {
        const byType = filter === 'ALL' ? favorites : favorites.filter((item) => item.item_type === filter);
        const query = searchTerm.trim().toLowerCase();
        if (!query) return byType;

        return byType.filter((item) => {
            const tags = (item.tags || []).join(' ').toLowerCase();
            return (
                item.title.toLowerCase().includes(query) ||
                (item.summary || '').toLowerCase().includes(query) ||
                tags.includes(query)
            );
        });
    }, [favorites, filter, searchTerm]);

    async function handleRemove(item: FavoriteItem) {
        setRemovingId(item.id);
        await removeFavorite({
            id: item.id,
            item_type: item.item_type,
            item_id: item.item_id,
        });
        setFavorites((prev) => prev.filter((current) => current.id !== item.id));
        setRemovingId(null);
    }

    const counts = useMemo(() => {
        return favorites.reduce((acc, item) => {
            acc[item.item_type] = (acc[item.item_type] || 0) + 1;
            return acc;
        }, {} as Record<FavoriteItemType, number>);
    }, [favorites]);

    return (
        <div className="space-y-7 stagger-children">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-atlas-petrol/[0.12] border border-atlas-petrol/26 flex items-center justify-center">
                    <Bookmark size={18} className="text-atlas-petrol" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep">Favoritos</h1>
                    <p className="text-atlas-petrol/82 text-sm">Itens salvos para consulta rápida no seu painel</p>
                </div>
            </div>

            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-atlas-petrol/58" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Buscar em favoritos..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/95 border border-atlas-petrol/26 text-atlas-petrol-deep placeholder-atlas-petrol/35 rounded-xl outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10 transition-all text-sm shadow-sm"
                />
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((item) => (
                    <FilterButton
                        key={item.key}
                        active={filter === item.key}
                        onClick={() => setFilter(item.key)}
                    >
                        {item.label}
                        {item.key !== 'ALL' ? (
                            <span className="ml-1 text-[10px] bg-atlas-petrol/[0.12] text-atlas-petrol px-1.5 py-0.5 rounded-full">
                                {counts[item.key] || 0}
                            </span>
                        ) : null}
                    </FilterButton>
                ))}
            </div>

            <div className="text-xs text-atlas-petrol/75 font-medium">
                {filtered.length} {filtered.length === 1 ? 'item salvo' : 'itens salvos'}
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-sm text-atlas-petrol/68">Carregando favoritos...</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-12 text-sm text-atlas-petrol/75">
                        Nenhum favorito encontrado para este filtro.
                    </div>
                ) : (
                    filtered.map((item, index) => {
                        const destination = getDestinationPath(item.item_type);
                        const typeLabel = getItemTypeLabel(item.item_type);
                        const isRemoving = removingId === item.id;

                        return (
                            <Card
                                key={item.id}
                                className="p-5 group hover:border-atlas-petrol/30 animate-slide-up"
                                style={{ animationDelay: `${index * 40}ms` }}
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-atlas-petrol/[0.12] text-atlas-petrol px-2.5 py-0.5 text-[11px] font-semibold">
                                                {item.item_type === 'OBRIGACAO' ? <ListChecks size={11} /> : <Radio size={11} />}
                                                {typeLabel}
                                            </span>
                                            {item.status ? <Badge status={item.status} /> : null}
                                        </div>

                                        <h3 className="font-bold text-atlas-petrol-deep text-sm group-hover:text-atlas-petrol transition-colors">
                                            {item.title}
                                        </h3>

                                        {item.summary ? (
                                            <p className="text-sm text-atlas-petrol/82 mt-1 line-clamp-2">{item.summary}</p>
                                        ) : null}

                                        {item.tags && item.tags.length > 0 ? (
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {item.tags.slice(0, 4).map((tag) => (
                                                    <span
                                                        key={`${item.id}-${tag}`}
                                                        className="text-[10px] px-2 py-0.5 rounded-lg bg-atlas-petrol/[0.1] text-atlas-petrol border border-atlas-petrol/24 font-medium"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-1.5">
                                        <Link
                                            href={destination}
                                            className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-atlas-petrol/62 hover:text-atlas-petrol hover:bg-atlas-petrol/[0.12] transition-colors"
                                            title="Abrir módulo"
                                        >
                                            <Bookmark size={14} />
                                        </Link>

                                        {item.source_url ? (
                                            <a
                                                href={item.source_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-atlas-petrol/62 hover:text-atlas-petrol hover:bg-atlas-petrol/[0.12] transition-colors"
                                                title="Abrir fonte oficial"
                                            >
                                                <ExternalLink size={14} />
                                            </a>
                                        ) : null}

                                        <button
                                            type="button"
                                            onClick={() => void handleRemove(item)}
                                            disabled={isRemoving}
                                            className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-atlas-petrol/62 hover:text-atlas-gold-dark hover:bg-atlas-gold/10 transition-colors disabled:opacity-50"
                                            title="Remover dos favoritos"
                                        >
                                            <Trash2 size={14} />
                                        </button>
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
