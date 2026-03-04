// src/lib/mockData.ts
import { Obligation, ComplianceStatus, AudienceType } from './types';

export const MOCK_OBLIGATIONS: Obligation[] = [
    {
        id: '1',
        reference_title: 'Ato Conjunto RFB/CGIBS nº 1/2025',
        title: 'Emitir NFe com destaque de IBS/CBS',
        description: 'Obrigatório o destaque dos novos tributos nos documentos fiscais. Há dispensa de multa por erro de preenchimento nos primeiros 4 meses.',
        audience: ['CONTADOR', 'ADVOGADO'],
        compliance_status: 'EDUCATIVO',
        penalty_grace_period_end: '2026-04-30',
    },
    {
        id: '2',
        reference_title: 'Orientações RFB 2026',
        title: 'Inscrição de Pessoa Física (Contribuintes)',
        description: 'Pessoas físicas que sejam contribuintes da CBS e do IBS deverão se inscrever no CNPJ/CIB.',
        audience: ['CONTADOR', 'IMOBILIARIO'],
        compliance_status: 'FUTURO',
    },
    {
        id: '3',
        reference_title: 'Nota Técnica 2026.001 (Prevista)',
        title: 'Declaração de Regimes Específicos (DeRE)',
        description: 'Entrega da declaração para Instituições Financeiras e Planos de Saúde.',
        audience: ['CONTADOR'],
        compliance_status: 'EM_CONSTRUCAO',
    },
    {
        id: '4',
        reference_title: 'Lei Complementar 214/2025',
        title: 'Pagamento de IBS/CBS (Teste)',
        description: 'Recolhimento dos tributos incidentes na operação (0,1% e 0,9%). Dispensado se emitido documento correto.',
        audience: ['CONTADOR', 'ADVOGADO'],
        compliance_status: 'VIGENTE',
    },
    {
        id: '5',
        reference_title: 'Ato Declaratório (Previsto)',
        title: 'Cadastro de Plataformas Digitais',
        description: 'Marketplaces devem se cadastrar para recolhimento simplificado.',
        audience: ['ADVOGADO'],
        compliance_status: 'EM_CONSTRUCAO',
    }
];
