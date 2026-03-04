// src/lib/types.ts
// TypeScript Definitions based on DataModel.md

export type ComplianceStatus = 'VIGENTE' | 'EDUCATIVO' | 'EM_CONSTRUCAO' | 'FUTURO' | 'REVOGADO';
export type AudienceType = 'CONTADOR' | 'ADVOGADO' | 'IMOBILIARIO' | 'TODOS';
export type TaxType = 'IBS' | 'CBS' | 'IS' | 'ITBI' | 'OUTROS';

export interface LegalReference {
  id: string;
  title: string;
  source_name: string;
  publication_date: string;
  url_official: string;
  status: ComplianceStatus;
  tags: string[];
}

export interface Obligation {
  id: string;
  reference_title: string;
  title: string;
  description: string;
  audience: AudienceType[];
  compliance_status: ComplianceStatus;
  start_date?: string;
  penalty_grace_period_end?: string;
  source_title?: string;
  source_url?: string;
}

export interface UserPreference {
  id: string;
  email: string;
  is_waitlist: boolean;
  audience_type: AudienceType;
}

export type FavoriteItemType = 'OBRIGACAO' | 'ATUALIZACAO';

export interface FavoriteItem {
  id: string;
  item_type: FavoriteItemType;
  item_id: string;
  title: string;
  summary?: string;
  status?: string;
  source_label?: string;
  source_url?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
}
