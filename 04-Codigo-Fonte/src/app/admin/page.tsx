'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Save, Loader2, Trash2, List } from 'lucide-react';
import Link from 'next/link';

type NormaRecord = {
    id: string;
    title: string;
    source_type: string;
    publication_date: string;
    status: string;
};

type ObligationRecord = {
    id: string;
    title: string;
    reference_title?: string | null;
    compliance_status: string;
    audience?: string[];
};

type AdminRecordsResponse = {
    normas: NormaRecord[];
    obligations: ObligationRecord[];
};

type AlertDispatchFeedback = {
    status: 'sent' | 'partial' | 'failed' | 'skipped';
    recipients: number;
    sent: number;
    failed: number;
    reason?: string;
};

type AdminWriteResponse = {
    success: boolean;
    alerts?: AlertDispatchFeedback;
};

async function parseJsonResponse<T>(response: Response): Promise<T> {
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data?.error || 'Erro na comunicação com o servidor');
    }
    return data as T;
}

export default function AdminPage() {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'NORMA' | 'OBRIGACAO'>('NORMA');

    // --- Existing Records ---
    const [normas, setNormas] = useState<NormaRecord[]>([]);
    const [obligations, setObligations] = useState<ObligationRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(true);

    // Norma Form State
    const [formData, setFormData] = useState({
        title: '',
        source_type: 'DOU',
        publication_date: new Date().toISOString().split('T')[0],
        summary: '',
        status: 'PENDING',
        tags: '',
        full_text_url: ''
    });

    // Obligation Form State
    const [obsData, setObsData] = useState({
        title: '',
        description: '',
        reference_title: '',
        audience: [] as string[],
        compliance_status: 'FUTURO',
        start_date: '',
        penalty_grace_period_end: ''
    });

    // --- Load Existing Records ---
    const loadRecords = async () => {
        setLoadingRecords(true);
        try {
            const response = await fetch('/api/admin/records', {
                method: 'GET',
                cache: 'no-store',
            });
            const data = await parseJsonResponse<AdminRecordsResponse>(response);
            setNormas(data.normas || []);
            setObligations(data.obligations || []);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar registros');
        } finally {
            setLoadingRecords(false);
        }
    };

    useEffect(() => { loadRecords(); }, []);

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleObsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setObsData({ ...obsData, [e.target.name]: e.target.value });
    };

    const toggleAudience = (role: string) => {
        const current = obsData.audience;
        if (current.includes(role)) {
            setObsData({ ...obsData, audience: current.filter(r => r !== role) });
        } else {
            setObsData({ ...obsData, audience: [...current, role] });
        }
    };

    const buildAlertFeedback = (alerts?: AlertDispatchFeedback) => {
        if (!alerts) return '';
        if (alerts.status === 'sent') {
            return ` Alerta enviado para ${alerts.sent} usuário(s).`;
        }
        if (alerts.status === 'partial') {
            return ` Alerta enviado para ${alerts.sent} usuário(s), com ${alerts.failed} falha(s).`;
        }
        if (alerts.status === 'skipped') {
            return ` Alerta não enviado: ${alerts.reason || 'sem usuários elegíveis'}.`;
        }
        return ` Alerta não enviado: ${alerts.reason || 'falha no disparo'}.`;
    };

    const handleNormaSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
            const response = await fetch('/api/admin/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'NORMA',
                    payload: {
                        title: formData.title,
                        source_type: formData.source_type,
                        publication_date: formData.publication_date,
                        summary: formData.summary,
                        status: formData.status,
                        tags: tagsArray,
                        full_text_url: formData.full_text_url,
                    },
                }),
            });
            const data = await parseJsonResponse<AdminWriteResponse>(response);
            setSuccess(`Norma cadastrada com sucesso.${buildAlertFeedback(data.alerts)}`);
            setFormData({ ...formData, title: '', summary: '', full_text_url: '', tags: '' });
            loadRecords(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleObligationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetch('/api/admin/records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'OBRIGACAO',
                    payload: {
                        title: obsData.title,
                        description: obsData.description,
                        reference_title: obsData.reference_title,
                        audience: obsData.audience,
                        compliance_status: obsData.compliance_status,
                        start_date: obsData.start_date || null,
                        penalty_grace_period_end: obsData.penalty_grace_period_end || null,
                    },
                }),
            });
            const data = await parseJsonResponse<AdminWriteResponse>(response);
            setSuccess(`Obrigação cadastrada com sucesso.${buildAlertFeedback(data.alerts)}`);
            setObsData({ ...obsData, title: '', description: '', reference_title: '', start_date: '' });
            loadRecords(); // Refresh list
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (table: string, id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        try {
            const response = await fetch('/api/admin/records', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, id }),
            });
            await parseJsonResponse<{ success: boolean }>(response);

            setSuccess('Item excluído.');
            loadRecords();
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard" className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-900">Painel de Administração</h1>
                </div>

                {/* TABS */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => { setActiveTab('NORMA'); setSuccess(''); setError(''); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'NORMA' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Normas ({normas.length})
                    </button>
                    <button
                        onClick={() => { setActiveTab('OBRIGACAO'); setSuccess(''); setError(''); }}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'OBRIGACAO' ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
                    >
                        Obrigações ({obligations.length})
                    </button>
                </div>

                {/* Messages */}
                {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">{success}</div>}
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">{error}</div>}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* LEFT: Form */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">
                            {activeTab === 'NORMA' ? 'Cadastrar Nova Norma' : 'Cadastrar Nova Obrigação'}
                        </h2>

                        {activeTab === 'NORMA' ? (
                            <form onSubmit={handleNormaSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Título Oficial</label>
                                    <input required name="title" value={formData.title} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Ex: Lei Complementar nº 214/2025" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fonte</label>
                                        <select name="source_type" value={formData.source_type} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                            <option value="DOU">DOU</option>
                                            <option value="RFB">RFB</option>
                                            <option value="CAMARA">Câmara</option>
                                            <option value="SENADO">Senado</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Publicação</label>
                                        <input type="date" name="publication_date" value={formData.publication_date} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo</label>
                                    <textarea required name="summary" value={formData.summary} onChange={handleChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="Breve resumo do conteúdo da norma..." />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm">
                                            <option value="PENDING">Pendente</option>
                                            <option value="VIGENTE">Vigente</option>
                                            <option value="EM_CONSTRUCAO">Em Construção</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (separadas por vírgula)</label>
                                        <input name="tags" value={formData.tags} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="IBS, CBS, GERAL" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Link para Texto Oficial</label>
                                    <input name="full_text_url" value={formData.full_text_url} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder="https://www.planalto.gov.br/..." />
                                </div>
                                <Button type="submit" disabled={loading} className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-sm">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save className="mr-2" size={16} /> Salvar Norma</>}
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleObligationSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Obrigação (O que fazer?)</label>
                                    <input required name="title" value={obsData.title} onChange={handleObsChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="Ex: Emitir NFe com destaque de IBS" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição Detalhada</label>
                                    <textarea required name="description" value={obsData.description} onChange={handleObsChange} rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="Detalhes técnicos..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Base Legal (Qual lei criou?)</label>
                                    <input name="reference_title" value={obsData.reference_title} onChange={handleObsChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="Ex: LC 214/2025" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status de Compliance</label>
                                        <select name="compliance_status" value={obsData.compliance_status} onChange={handleObsChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm">
                                            <option value="FUTURO">Futuro (Ainda não vige)</option>
                                            <option value="EDUCATIVO">Educativo (Sem Multa)</option>
                                            <option value="VIGENTE">Vigente (Com Multa)</option>
                                            <option value="EM_CONSTRUCAO">Em Construção</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fim do Período Educativo</label>
                                        <input type="date" name="penalty_grace_period_end" value={obsData.penalty_grace_period_end} onChange={handleObsChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prazo de Início (quando aplicável)</label>
                                    <input type="date" name="start_date" value={obsData.start_date} onChange={handleObsChange} className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Quem deve cumprir?</label>
                                    <div className="flex gap-3">
                                        {['CONTADOR', 'ADVOGADO', 'IMOBILIARIO'].map(role => (
                                            <button
                                                key={role}
                                                type="button"
                                                onClick={() => toggleAudience(role)}
                                                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${obsData.audience.includes(role) ? 'bg-orange-100 border-orange-300 text-orange-800' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                            >
                                                {role}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button type="submit" disabled={loading} className="w-full h-10 bg-orange-700 hover:bg-orange-800 text-sm">
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save className="mr-2" size={16} /> Salvar Obrigação</>}
                                </Button>
                            </form>
                        )}
                    </div>

                    {/* RIGHT: Existing Records List */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <List size={18} /> Registros Existentes
                        </h2>

                        {loadingRecords ? (
                            <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400" /></div>
                        ) : activeTab === 'NORMA' ? (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {normas.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">Nenhuma norma cadastrada.</p>
                                ) : normas.map(n => (
                                    <div key={n.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">{n.source_type} | {new Date(n.publication_date).toLocaleDateString()} | <span className={`font-bold ${n.status === 'VIGENTE' ? 'text-green-600' : 'text-amber-600'}`}>{n.status}</span></p>
                                            </div>
                                            <button
                                                onClick={() => handleDelete('legal_references', n.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {obligations.length === 0 ? (
                                    <p className="text-gray-400 text-sm text-center py-8">Nenhuma obrigação cadastrada.</p>
                                ) : obligations.map(o => (
                                    <div key={o.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="text-sm font-semibold text-gray-900 leading-tight">{o.title}</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {o.reference_title || 'Sem referência'} | <span className={`font-bold ${o.compliance_status === 'VIGENTE' ? 'text-green-600' : o.compliance_status === 'EDUCATIVO' ? 'text-amber-600' : 'text-gray-500'}`}>{o.compliance_status}</span>
                                                </p>
                                                {o.audience && o.audience.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {o.audience.map((a: string) => (
                                                            <span key={a} className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">{a}</span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleDelete('obligations', o.id)}
                                                className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
