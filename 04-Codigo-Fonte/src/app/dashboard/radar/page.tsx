'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { getRadarNorms, type LegalReference } from '@/services/radar';
import { listFavorites, toggleFavorite, toFavoriteKey } from '@/services/favorites';
import { Radio, Search, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';

export default function RadarPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [norms, setNorms] = useState<LegalReference[]>([]);
    const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
    const [togglingKey, setTogglingKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    async function loadNorms() {
        setLoading(true);
        setError(null);
        try {
            const data = await getRadarNorms();
            setNorms(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro ao carregar normativos.');
            setNorms([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadNorms();
    }, []);

    useEffect(() => {
        async function loadFavorites() {
            const favorites = await listFavorites('ATUALIZACAO');
            const keys = favorites.map((item) => toFavoriteKey(item.item_type, item.item_id));
            setFavoriteKeys(new Set(keys));
        }

        void loadFavorites();
    }, []);

    const filtered = norms.filter(n =>
        n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.tags.some((t: string) => t.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    async function handleToggleFavorite(norm: LegalReference) {
        const favoriteKey = toFavoriteKey('ATUALIZACAO', norm.id);
        setTogglingKey(favoriteKey);

        const result = await toggleFavorite({
            item_type: 'ATUALIZACAO',
            item_id: norm.id,
            title: norm.title,
            summary: norm.summary,
            status: norm.status,
            source_label: norm.source_type,
            source_url: norm.full_text_url,
            tags: norm.tags || [],
            metadata: {
                publication_date: norm.publication_date,
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
                    <Radio size={18} className="text-atlas-petrol" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-atlas-petrol-deep">Radar Normativo</h1>
                    <p className="text-atlas-petrol/82 text-sm">Publicações oficiais monitoradas</p>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-atlas-petrol/58" />
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por palavra-chave, tema ou tag..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/95 border border-atlas-petrol/26 text-atlas-petrol-deep placeholder-atlas-petrol/35 rounded-xl outline-none focus:border-atlas-petrol/45 focus:ring-2 focus:ring-atlas-petrol/10 transition-all text-sm shadow-sm"
                />
            </div>

            {/* Results Count */}
            <div className="text-xs text-atlas-petrol/75 font-medium">
                {filtered.length} {filtered.length === 1 ? 'resultado' : 'resultados'} encontrados
            </div>

            {/* Results */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl flex items-center justify-between shadow-sm">
                    <div>
                        <p className="font-semibold text-sm">Problema de Conexão</p>
                        <p className="text-xs opacity-90 mt-0.5">{error}</p>
                    </div>
                    <button onClick={() => void loadNorms()} className="bg-white text-red-600 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors border border-red-200 shadow-sm ml-4 shrink-0">
                        Tentar novamente
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-12 mb-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-atlas-petrol/60 border-t-transparent"></div>
                </div>
            )}

            {!loading && !error && (
                <div className="space-y-3">
                    {filtered.map((norm, i) => (
                        <Card key={norm.id} className="p-5 group hover:border-atlas-petrol/30 animate-slide-up" style={{ animationDelay: `${i * 50}ms` }}>
                            {(() => {
                                const favoriteKey = toFavoriteKey('ATUALIZACAO', norm.id);
                                const isFavorite = favoriteKeys.has(favoriteKey);
                                const isToggling = togglingKey === favoriteKey;

                                return (
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Badge status={norm.status} />
                                                <span className="text-[10px] text-atlas-petrol-deep font-semibold uppercase tracking-wider bg-white border border-atlas-petrol/25 rounded-full px-2 py-0.5">{norm.source_type}</span>
                                                <span className="text-[10px] text-atlas-petrol-deep font-medium bg-white border border-atlas-petrol/20 rounded-full px-2 py-0.5">
                                                    {new Date(norm.publication_date).toLocaleDateString('pt-BR')}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-atlas-petrol-deep text-sm group-hover:text-atlas-petrol transition-colors">{norm.title}</h3>
                                            <p className="text-sm text-atlas-petrol/82 mt-1 line-clamp-2">{norm.summary}</p>
                                            <div className="flex flex-wrap gap-1.5 mt-3">
                                                {norm.tags.map((tag: string) => (
                                                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-lg bg-white text-atlas-petrol-deep border border-atlas-petrol/30 font-semibold">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <button
                                                type="button"
                                                onClick={() => void handleToggleFavorite(norm)}
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

                                            {norm.full_text_url && (
                                                <a href={norm.full_text_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-lg px-2.5 py-1.5 text-atlas-petrol/58 hover:text-atlas-petrol hover:bg-atlas-petrol/[0.12] transition-colors">
                                                    <ExternalLink size={16} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })()}
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
