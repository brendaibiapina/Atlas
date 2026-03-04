import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { FavoriteItem, FavoriteItemType } from '@/lib/types';

export type FavoriteInput = {
    item_type: FavoriteItemType;
    item_id: string;
    title: string;
    summary?: string;
    status?: string;
    source_label?: string;
    source_url?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
};

type FavoriteApiListResponse = {
    favorites?: FavoriteItem[];
    warning?: string;
    error?: string;
};

type FavoriteApiToggleResponse = {
    saved?: boolean;
    favorite?: FavoriteItem;
    id?: string;
    error?: string;
};

const LOCAL_STORAGE_PREFIX = 'atlas_favorites_v1';

function isBrowser(): boolean {
    return typeof window !== 'undefined';
}

export function toFavoriteKey(itemType: FavoriteItemType, itemId: string): string {
    return `${itemType}:${itemId}`;
}

async function getAuthUserId(): Promise<string> {
    if (!isSupabaseConfigured() || !supabase) return 'guest';
    const { data } = await supabase.auth.getUser();
    return data.user?.id || 'guest';
}

async function getLocalStorageKey(): Promise<string> {
    const userId = await getAuthUserId();
    return `${LOCAL_STORAGE_PREFIX}:${userId}`;
}

async function readLocalFavorites(): Promise<FavoriteItem[]> {
    if (!isBrowser()) return [];
    const storageKey = await getLocalStorageKey();
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return [];

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

async function writeLocalFavorites(favorites: FavoriteItem[]): Promise<void> {
    if (!isBrowser()) return;
    const storageKey = await getLocalStorageKey();
    window.localStorage.setItem(storageKey, JSON.stringify(favorites));
}

async function fetchApi<T>(input: RequestInfo, init?: RequestInit): Promise<{ ok: boolean; data?: T }> {
    try {
        const response = await fetch(input, init);
        const data = (await response.json()) as T;
        return { ok: response.ok, data };
    } catch {
        return { ok: false };
    }
}

export async function listFavorites(itemType?: FavoriteItemType): Promise<FavoriteItem[]> {
    const query = itemType ? `?item_type=${encodeURIComponent(itemType)}` : '';
    const { ok, data } = await fetchApi<FavoriteApiListResponse>(`/api/favorites${query}`, {
        method: 'GET',
        cache: 'no-store',
    });

    if (ok && data?.favorites) {
        return data.favorites;
    }

    return readLocalFavorites();
}

export async function toggleFavorite(input: FavoriteInput): Promise<{ saved: boolean; favorite?: FavoriteItem }> {
    const { ok, data } = await fetchApi<FavoriteApiToggleResponse>('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
    });

    if (ok && typeof data?.saved === 'boolean') {
        return {
            saved: data.saved,
            favorite: data.favorite,
        };
    }

    const current = await readLocalFavorites();
    const key = toFavoriteKey(input.item_type, input.item_id);
    const existing = current.find((item) => toFavoriteKey(item.item_type, item.item_id) === key);

    if (existing) {
        const filtered = current.filter((item) => toFavoriteKey(item.item_type, item.item_id) !== key);
        await writeLocalFavorites(filtered);
        return { saved: false };
    }

    const favorite: FavoriteItem = {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        item_type: input.item_type,
        item_id: input.item_id,
        title: input.title,
        summary: input.summary,
        status: input.status,
        source_label: input.source_label,
        source_url: input.source_url,
        tags: input.tags || [],
        metadata: input.metadata || {},
        created_at: new Date().toISOString(),
    };

    const updated = [favorite, ...current];
    await writeLocalFavorites(updated);
    return { saved: true, favorite };
}

export async function removeFavorite(favorite: { id?: string; item_type: FavoriteItemType; item_id: string }): Promise<boolean> {
    if (favorite.id) {
        const { ok } = await fetchApi<{ success?: boolean }>('/api/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: favorite.id }),
        });

        if (ok) return true;
    } else {
        const { ok } = await fetchApi<{ success?: boolean }>('/api/favorites', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ item_type: favorite.item_type, item_id: favorite.item_id }),
        });

        if (ok) return true;
    }

    const current = await readLocalFavorites();
    const filtered = current.filter((item) => {
        if (favorite.id) return item.id !== favorite.id;
        return !(item.item_type === favorite.item_type && item.item_id === favorite.item_id);
    });
    await writeLocalFavorites(filtered);
    return true;
}
