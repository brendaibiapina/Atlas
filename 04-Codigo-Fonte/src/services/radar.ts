import { supabase } from '@/lib/supabase';

export type LegalReference = {
    id: string;
    title: string;
    source_type: string;
    publication_date: string;
    summary: string;
    status: string;
    tags: string[];
    full_text_url?: string;
};

function isAuditTestTitle(title: string | null | undefined): boolean {
    const normalized = (title ?? '').trim().toUpperCase();
    return normalized.startsWith('ZZ_AUDIT') || normalized.startsWith('ZZ_TEST');
}

export async function getRadarNorms(query?: string): Promise<LegalReference[]> {
    // 1. Try Supabase
    if (supabase) {
        let dbQuery = supabase
            .from('legal_references')
            .select('*')
            .order('publication_date', { ascending: false });

        if (query) {
            dbQuery = dbQuery.ilike('title', `%${query}%`);
        }

        const { data, error } = await dbQuery;

        if (error) {
            console.error('Radar Service Error:', error);
            throw new Error('Falha ao carregar as atualizações normativas.');
        }

        if (data) {
            return (data as LegalReference[]).filter((item) => !isAuditTestTitle(item.title));
        }
    } else {
        throw new Error('Configuração do banco de dados ausente. Verifique as credenciais do sistema.');
    }

    return [];
}

// Compatibilidade temporária com chamadas legadas
export const getRadardNorms = getRadarNorms;
