'use client';

import React, { useMemo, useState } from 'react';
import {
    AlertTriangle,
    BadgeCheck,
    BarChart3,
    Briefcase,
    Building,
    Calculator,
    ChevronDown,
    Home,
    Landmark,
    Plus,
    Sparkles,
    Trash2,
    User,
    Wallet,
} from 'lucide-react';
import {
    PREMISSAS_DEFAULT,
    calcularComparativos,
    calcularSimulador,
    criarInputDefaultSimulador,
    criarItemRedutorAjuste,
    type RedutorAjusteItem,
    type SimuladorInput,
} from '@/services/imobiliario';

function formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
}

function formatPercent(value: number): string {
    return `${(value * 100).toFixed(2)}%`;
}

function parseNumber(raw: string): number {
    const normalized = raw.replace(',', '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
}

function toPercentInput(value: number): string {
    return String(Number((value * 100).toFixed(4)));
}

function fromPercentInput(raw: string): number {
    return parseNumber(raw) / 100;
}

const PRESETS_LOCACAO = [10000, 20000, 50000, 120000];
const PRESETS_ALIENACAO = [500000, 1000000, 2500000, 5000000];

export default function SimuladorImobiliario() {
    const [input, setInput] = useState<SimuladorInput>(() => criarInputDefaultSimulador());
    const [showRedutorTable, setShowRedutorTable] = useState(true);

    const resultado = useMemo(() => calcularSimulador(input, PREMISSAS_DEFAULT), [input]);
    const comparativos = useMemo(() => calcularComparativos(input, PREMISSAS_DEFAULT), [input]);

    function updateInput<K extends keyof SimuladorInput>(key: K, value: SimuladorInput[K]) {
        setInput((prev) => ({ ...prev, [key]: value }));
    }

    function addRedutorItem() {
        setInput((prev) => ({
            ...prev,
            redutor_ajuste_itens: [...prev.redutor_ajuste_itens, criarItemRedutorAjuste()],
        }));
    }

    function updateRedutorItem<K extends keyof RedutorAjusteItem>(id: string, key: K, value: RedutorAjusteItem[K]) {
        setInput((prev) => ({
            ...prev,
            redutor_ajuste_itens: prev.redutor_ajuste_itens.map((item) =>
                item.id === id ? { ...item, [key]: value } : item
            ),
        }));
    }

    function removeRedutorItem(id: string) {
        setInput((prev) => ({
            ...prev,
            redutor_ajuste_itens: prev.redutor_ajuste_itens.filter((item) => item.id !== id),
        }));
    }

    function resetScenario() {
        setInput(criarInputDefaultSimulador());
    }

    const isLocacao = input.operacao === 'LOCACAO';
    const isAlienacao = input.operacao === 'ALIENACAO';
    const isPF = input.perfil === 'PF';
    const isPJ = input.perfil === 'PJ';

    const totalReference = resultado.total > 0 ? resultado.total : 1;
    const consumoShare = Math.min(100, (resultado.consumo.imposto / totalReference) * 100);
    const rendaShare = Math.min(100, (resultado.renda.imposto_total / totalReference) * 100);

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-3xl border border-atlas-petrol/20 bg-gradient-to-br from-[#0a334c] via-[#0f4a67] to-[#145c66] p-6 text-white shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)]">
                <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-atlas-gold/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-20 w-64 h-64 rounded-full bg-atlas-verdant/25 blur-3xl" />

                <div className="relative z-10 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                            <Calculator size={22} className="text-atlas-verdant-soft" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black tracking-tight">Simulador Investidor Imobiliário</h3>
                            <p className="text-sm text-white/80">Cenário fiscal com visão clara para decisão de investimento</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <HeroTag icon={<Sparkles size={12} />} label="Visual executivo" />
                        <HeroTag icon={<BarChart3 size={12} />} label="Leitura instantânea" />
                        <HeroTag icon={<BadgeCheck size={12} />} label="Base auditável" />
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                <section className="xl:col-span-7 space-y-5">
                    <CardShell>
                        <SectionTitle
                            title="1. Cenário da operação"
                            subtitle="Escolha o contexto do cálculo para obter uma leitura mais precisa"
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <FieldLabel>Operação</FieldLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    <SelectChip
                                        icon={<Building size={14} />}
                                        label="Locação"
                                        active={isLocacao}
                                        onClick={() => updateInput('operacao', 'LOCACAO')}
                                    />
                                    <SelectChip
                                        icon={<Home size={14} />}
                                        label="Alienação"
                                        active={isAlienacao}
                                        onClick={() => updateInput('operacao', 'ALIENACAO')}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <FieldLabel>Perfil</FieldLabel>
                                <div className="grid grid-cols-2 gap-2">
                                    <SelectChip
                                        icon={<User size={14} />}
                                        label="Pessoa Física"
                                        active={isPF}
                                        onClick={() => updateInput('perfil', 'PF')}
                                    />
                                    <SelectChip
                                        icon={<Briefcase size={14} />}
                                        label="Pessoa Jurídica"
                                        active={isPJ}
                                        onClick={() => updateInput('perfil', 'PJ')}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardShell>

                    <CardShell>
                        <SectionTitle
                            title="2. Dados da transação"
                            subtitle={isLocacao ? 'Informe a receita de locação e a dinâmica do contrato' : 'Informe venda, custo e composição do ativo'}
                        />

                        {isLocacao && (
                            <div className="space-y-3">
                                <div>
                                    <FieldLabel>Receita de locação</FieldLabel>
                                    <CurrencyInput
                                        value={input.valor_locacao}
                                        onChange={(value) => updateInput('valor_locacao', value)}
                                    />
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {PRESETS_LOCACAO.map((preset) => (
                                            <PresetButton
                                                key={preset}
                                                active={input.valor_locacao === preset}
                                                label={formatCurrency(preset)}
                                                onClick={() => updateInput('valor_locacao', preset)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    <div>
                                        <FieldLabel>Período</FieldLabel>
                                        <select
                                            value={input.periodo_locacao}
                                            onChange={(e) => updateInput('periodo_locacao', e.target.value as SimuladorInput['periodo_locacao'])}
                                            className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 text-sm"
                                        >
                                            <option value="MENSAL">Mensal</option>
                                            <option value="ANUAL">Anual</option>
                                        </select>
                                    </div>
                                    <div>
                                        <FieldLabel>Modalidade</FieldLabel>
                                        <select
                                            value={input.tipo_locacao}
                                            onChange={(e) => updateInput('tipo_locacao', e.target.value as SimuladorInput['tipo_locacao'])}
                                            className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 text-sm"
                                        >
                                            <option value="CONVENCIONAL">Convencional</option>
                                            <option value="TEMPORADA">Temporada</option>
                                        </select>
                                    </div>
                                </div>

                                {isPF && (
                                    <label className="flex items-start gap-2 rounded-xl border border-atlas-petrol/30 bg-white p-3 text-sm text-atlas-petrol-deep">
                                        <input
                                            type="checkbox"
                                            checked={input.pf_acima_limite_legal}
                                            onChange={(e) => updateInput('pf_acima_limite_legal', e.target.checked)}
                                            className="mt-1"
                                        />
                                        <span>PF acima do limite legal para enquadramento em IBS e CBS na locação</span>
                                    </label>
                                )}
                            </div>
                        )}

                        {isAlienacao && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                    <div>
                                        <FieldLabel>Preço de venda PV</FieldLabel>
                                        <CurrencyInput
                                            value={input.valor_venda}
                                            onChange={(value) => updateInput('valor_venda', value)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Custo de aquisição CA</FieldLabel>
                                        <CurrencyInput
                                            value={input.custo_aquisicao}
                                            onChange={(value) => updateInput('custo_aquisicao', value)}
                                        />
                                    </div>
                                    <div>
                                        <FieldLabel>Despesas elegíveis</FieldLabel>
                                        <CurrencyInput
                                            value={input.despesas_elegiveis}
                                            onChange={(value) => updateInput('despesas_elegiveis', value)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-1 flex flex-wrap gap-2">
                                    {PRESETS_ALIENACAO.map((preset) => (
                                        <PresetButton
                                            key={preset}
                                            active={input.valor_venda === preset}
                                            label={formatCurrency(preset)}
                                            onClick={() => updateInput('valor_venda', preset)}
                                        />
                                    ))}
                                </div>

                                {isPJ && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        <div>
                                            <FieldLabel>Natureza do bem para PJ</FieldLabel>
                                            <select
                                                value={input.natureza_bem_pj}
                                                onChange={(e) => updateInput('natureza_bem_pj', e.target.value as SimuladorInput['natureza_bem_pj'])}
                                                className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 text-sm"
                                            >
                                                <option value="ESTOQUE">Estoque</option>
                                                <option value="IMOBILIZADO_INVESTIMENTO">Imobilizado ou investimento</option>
                                            </select>
                                        </div>
                                        <div>
                                            <FieldLabel>Custos capitalizáveis para PJ</FieldLabel>
                                            <CurrencyInput
                                                value={input.custos_capitalizaveis_pj}
                                                onChange={(value) => updateInput('custos_capitalizaveis_pj', value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardShell>

                    {isPF && (
                        <CardShell>
                            <SectionTitle
                                title="3. Método de renda para PF"
                                subtitle="Escolha cálculo simplificado por alíquota ou imposto informado"
                            />

                            {isLocacao && (
                                <MetodoRendaPF
                                    label="IRPF da locação"
                                    metodo={input.metodo_irpf_locacao}
                                    aliquota={input.aliquota_irpf_locacao_simplificada}
                                    informado={input.irpf_locacao_informado}
                                    onMetodoChange={(value) => updateInput('metodo_irpf_locacao', value)}
                                    onAliquotaChange={(value) => updateInput('aliquota_irpf_locacao_simplificada', value)}
                                    onInformadoChange={(value) => updateInput('irpf_locacao_informado', value)}
                                />
                            )}
                            {isAlienacao && (
                                <MetodoRendaPF
                                    label="IRPF do ganho de capital"
                                    metodo={input.metodo_irpf_venda}
                                    aliquota={input.aliquota_irpf_venda_simplificada}
                                    informado={input.irpf_venda_informado}
                                    onMetodoChange={(value) => updateInput('metodo_irpf_venda', value)}
                                    onAliquotaChange={(value) => updateInput('aliquota_irpf_venda_simplificada', value)}
                                    onInformadoChange={(value) => updateInput('irpf_venda_informado', value)}
                                />
                            )}
                        </CardShell>
                    )}

                    {isAlienacao && (
                        <CardShell>
                            <div className="flex items-center justify-between gap-2">
                                <SectionTitle
                                    title="4. Trilha do redutor de ajuste"
                                    subtitle="Cada item compõe o cálculo auditável da margem"
                                />
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRedutorTable((v) => !v)}
                                        className="inline-flex items-center gap-1 rounded-lg border border-atlas-petrol/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-atlas-petrol-deep hover:bg-[#f8f5ed]"
                                    >
                                        <ChevronDown size={12} className={showRedutorTable ? 'rotate-180 transition-transform' : 'transition-transform'} />
                                        {showRedutorTable ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addRedutorItem}
                                        className="inline-flex items-center gap-1 rounded-lg border border-atlas-petrol/30 bg-white px-2.5 py-1.5 text-xs font-semibold text-atlas-petrol-deep hover:bg-[#f8f5ed]"
                                    >
                                        <Plus size={12} /> Adicionar item
                                    </button>
                                </div>
                            </div>

                            {showRedutorTable && (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs">
                                        <thead>
                                            <tr className="text-left text-atlas-petrol-deep border-b border-atlas-petrol/22">
                                                <th className="py-2 pr-2">Data</th>
                                                <th className="py-2 pr-2">Tipo</th>
                                                <th className="py-2 pr-2">Valor</th>
                                                <th className="py-2 pr-2">Fator</th>
                                                <th className="py-2 pr-2">Elegível</th>
                                                <th className="py-2"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {input.redutor_ajuste_itens.map((item) => (
                                                <tr key={item.id} className="border-b border-atlas-petrol/8">
                                                    <td className="py-2 pr-2">
                                                        <input
                                                            type="date"
                                                            value={item.data_evento}
                                                            onChange={(e) => updateRedutorItem(item.id, 'data_evento', e.target.value)}
                                                            className="w-full rounded-md border border-atlas-petrol/26 px-2 py-1"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-2">
                                                        <input
                                                            type="text"
                                                            value={item.tipo_evento}
                                                            onChange={(e) => updateRedutorItem(item.id, 'tipo_evento', e.target.value)}
                                                            className="w-full rounded-md border border-atlas-petrol/26 px-2 py-1"
                                                            placeholder="Aquisição, ITBI, laudêmio"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={item.valor_evento}
                                                            onChange={(e) => updateRedutorItem(item.id, 'valor_evento', parseNumber(e.target.value))}
                                                            className="w-full rounded-md border border-atlas-petrol/26 px-2 py-1"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.0001"
                                                            value={item.fator_atualizacao}
                                                            onChange={(e) => updateRedutorItem(item.id, 'fator_atualizacao', parseNumber(e.target.value))}
                                                            className="w-full rounded-md border border-atlas-petrol/26 px-2 py-1"
                                                        />
                                                    </td>
                                                    <td className="py-2 pr-2">
                                                        <input
                                                            type="checkbox"
                                                            checked={item.elegivel}
                                                            onChange={(e) => updateRedutorItem(item.id, 'elegivel', e.target.checked)}
                                                        />
                                                    </td>
                                                    <td className="py-2 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRedutorItem(item.id)}
                                                            className="inline-flex items-center rounded-md border border-atlas-petrol/30 p-1 text-atlas-petrol-deep hover:bg-[#f8f5ed]"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardShell>
                    )}
                </section>

                <section className="xl:col-span-5">
                    <div className="xl:sticky xl:top-24 space-y-5">
                        <div className="rounded-3xl border border-atlas-petrol/22 bg-white p-5 shadow-sm">
                            <div className="rounded-2xl bg-gradient-to-br from-[#0b3550] to-[#0e4a67] p-5 text-white">
                                <p className="text-xs font-semibold uppercase tracking-wider text-white/70">Total estimado</p>
                                <p className="text-4xl font-black mt-1">{formatCurrency(resultado.total)}</p>
                                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                                    <span className="rounded-full bg-white/10 px-2.5 py-1">{isLocacao ? 'Locação' : 'Alienação'}</span>
                                    <span className="rounded-full bg-white/10 px-2.5 py-1">{isPF ? 'Pessoa Física' : 'Pessoa Jurídica'}</span>
                                    <span className={`rounded-full px-2.5 py-1 ${resultado.enquadramento.status === 'ELEGIVEL' ? 'bg-atlas-verdant/25 text-atlas-verdant-soft' : 'bg-atlas-gold/25 text-[#f9ebd0]'}`}>
                                        {resultado.enquadramento.status === 'ELEGIVEL' ? 'Elegível' : 'Não elegível'}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <MiniMetric icon={<Building size={14} />} label="Consumo" value={formatCurrency(resultado.consumo.imposto)} tone="petrol" />
                                <MiniMetric icon={<Landmark size={14} />} label="Renda" value={formatCurrency(resultado.renda.imposto_total)} tone="gold" />
                                <MiniMetric icon={<Wallet size={14} />} label="Alíquota efetiva" value={formatPercent(resultado.consumo.aliquota_efetiva)} tone="soft" />
                                <MiniMetric icon={resultado.enquadramento.status === 'ELEGIVEL' ? <BadgeCheck size={14} /> : <AlertTriangle size={14} />} label="Status" value={resultado.enquadramento.status === 'ELEGIVEL' ? 'Ok' : 'Atenção'} tone={resultado.enquadramento.status === 'ELEGIVEL' ? 'verdant' : 'warn'} />
                            </div>
                        </div>

                        <CardShell>
                            <SectionTitle
                                title="Composição do total"
                                subtitle="Distribuição entre consumo e renda"
                            />

                            <ShareBar label="Consumo IBS e CBS" percent={consumoShare} value={formatCurrency(resultado.consumo.imposto)} color="bg-atlas-petrol" />
                            <ShareBar label="Renda" percent={rendaShare} value={formatCurrency(resultado.renda.imposto_total)} color="bg-atlas-gold" />
                        </CardShell>

                        <CardShell>
                            <SectionTitle
                                title="Comparativos instantâneos"
                                subtitle="Leitura rápida de alternativas"
                            />

                            <CompareRow
                                label="Perfil alternativo"
                                value={`${comparativos.perfil_alternativo.perfil} | ${formatCurrency(comparativos.perfil_alternativo.total)}`}
                            />
                            <CompareRow
                                label="Operação alternativa"
                                value={`${comparativos.operacao_alternativa.operacao} | ${formatCurrency(comparativos.operacao_alternativa.total)}`}
                            />
                            <p className="text-xs text-atlas-petrol-deep mt-3">Regra aplicada: {resultado.enquadramento.regra}</p>
                        </CardShell>

                        {resultado.bases_alienacao && (
                            <CardShell>
                                <SectionTitle
                                    title="Resumo da alienação"
                                    subtitle="Base de consumo e base de renda em variáveis distintas"
                                />

                                <div className="grid grid-cols-2 gap-2">
                                    <Metric label="PV" value={formatCurrency(resultado.bases_alienacao.preco_venda)} />
                                    <Metric label="CA" value={formatCurrency(resultado.bases_alienacao.custo_aquisicao)} />
                                    <Metric label="RA" value={formatCurrency(resultado.bases_alienacao.redutor_ajuste_total)} />
                                    <Metric label="Margem" value={formatCurrency(resultado.bases_alienacao.margem_utilizada)} />
                                    <Metric label="Ganho" value={formatCurrency(input.perfil === 'PF' ? resultado.bases_alienacao.ganho_pf : resultado.bases_alienacao.ganho_pj)} />
                                    <Metric label="Consumo" value={formatCurrency(resultado.consumo.imposto)} />
                                </div>
                            </CardShell>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={resetScenario}
                                className="inline-flex items-center gap-2 rounded-xl border border-atlas-petrol/30 bg-white px-3 py-2 text-xs font-semibold text-atlas-petrol-deep hover:bg-[#f8f5ed]"
                            >
                                <Sparkles size={12} /> Restaurar cenário base
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}

function CardShell({ children }: { children: React.ReactNode }) {
    return <section className="rounded-3xl border border-atlas-petrol/22 bg-white p-5 shadow-sm space-y-4">{children}</section>;
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
    return (
        <div>
            <h4 className="text-lg font-bold text-atlas-petrol-deep">{title}</h4>
            <p className="text-sm text-atlas-petrol-deep">{subtitle}</p>
        </div>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return <label className="block text-xs font-semibold text-atlas-petrol-deep uppercase tracking-wider mb-1">{children}</label>;
}

function HeroTag({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
            {icon}
            {label}
        </span>
    );
}

function SelectChip({
    icon,
    label,
    active,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-all inline-flex items-center gap-2 ${
                active
                    ? 'border-atlas-petrol/30 bg-atlas-petrol/10 text-atlas-petrol shadow-sm'
                    : 'border-atlas-petrol/30 bg-white text-atlas-petrol-deep hover:bg-[#f8f5ed]'
            }`}
        >
            {icon}
            {label}
        </button>
    );
}

function PresetButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                active ? 'border-atlas-petrol/40 bg-atlas-petrol/10 text-atlas-petrol-deep' : 'border-atlas-petrol/30 bg-white text-atlas-petrol-deep hover:bg-[#f8f5ed]'
            }`}
        >
            {label}
        </button>
    );
}

function CurrencyInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
    return (
        <input
            type="number"
            min="0"
            step="0.01"
            value={value}
            onChange={(e) => onChange(parseNumber(e.target.value))}
            className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 text-sm"
        />
    );
}

function MetodoRendaPF({
    label,
    metodo,
    aliquota,
    informado,
    onMetodoChange,
    onAliquotaChange,
    onInformadoChange,
}: {
    label: string;
    metodo: SimuladorInput['metodo_irpf_locacao'] | SimuladorInput['metodo_irpf_venda'];
    aliquota: number;
    informado: number;
    onMetodoChange: (value: SimuladorInput['metodo_irpf_locacao']) => void;
    onAliquotaChange: (value: number) => void;
    onInformadoChange: (value: number) => void;
}) {
    return (
        <div className="rounded-xl border border-atlas-petrol/30 bg-white p-3 space-y-2">
            <p className="text-sm font-medium text-atlas-petrol-deep">{label}</p>
            <select
                value={metodo}
                onChange={(e) => onMetodoChange(e.target.value as SimuladorInput['metodo_irpf_locacao'])}
                className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 text-sm"
            >
                <option value="SIMPLIFICADO">Simplificado com alíquota parametrizada</option>
                <option value="INFORMADO">Imposto informado com cálculo externo</option>
            </select>

            {metodo === 'SIMPLIFICADO' ? (
                <div>
                    <FieldLabel>Alíquota simplificada</FieldLabel>
                    <div className="relative">
                        <input
                            type="number"
                            step="0.01"
                            value={toPercentInput(aliquota)}
                            onChange={(e) => onAliquotaChange(fromPercentInput(e.target.value))}
                            className="w-full rounded-xl border border-atlas-petrol/26 bg-white px-3 py-2.5 pr-7 text-sm"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-atlas-petrol-deep">%</span>
                    </div>
                </div>
            ) : (
                <div>
                    <FieldLabel>IRPF informado</FieldLabel>
                    <CurrencyInput value={informado} onChange={onInformadoChange} />
                </div>
            )}
        </div>
    );
}

function MiniMetric({
    icon,
    label,
    value,
    tone,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: 'petrol' | 'gold' | 'soft' | 'verdant' | 'warn';
}) {
    const tones = {
        petrol: 'bg-white border-atlas-petrol/35 text-atlas-petrol-deep',
        gold: 'bg-white border-atlas-gold/35 text-atlas-petrol-deep',
        soft: 'bg-white border-atlas-petrol/35 text-atlas-petrol-deep',
        verdant: 'bg-white border-atlas-verdant/35 text-atlas-petrol-deep',
        warn: 'bg-white border-atlas-gold/35 text-atlas-petrol-deep',
    };

    return (
        <div className={`rounded-xl border p-3 ${tones[tone]}`}>
            <div className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider opacity-80">
                {icon}
                {label}
            </div>
            <p className="text-sm font-extrabold mt-1">{value}</p>
        </div>
    );
}

function ShareBar({ label, percent, value, color }: { label: string; percent: number; value: string; color: string }) {
    const safePercent = Number.isFinite(percent) ? Math.max(0, Math.min(100, percent)) : 0;

    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-atlas-petrol-deep">
                <span className="font-semibold">{label}</span>
                <span>{value}</span>
            </div>
            <div className="h-2 rounded-full bg-atlas-petrol/10 overflow-hidden">
                <div className={`h-full rounded-full ${color}`} style={{ width: `${safePercent}%` }} />
            </div>
        </div>
    );
}

function CompareRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-atlas-petrol/30 bg-white px-3 py-2.5">
            <p className="text-xs font-semibold text-atlas-petrol-deep uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-atlas-petrol-deep mt-1">{value}</p>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-atlas-petrol/30 bg-white px-3 py-2.5">
            <p className="text-[11px] uppercase tracking-wider text-atlas-petrol-deep font-semibold">{label}</p>
            <p className="text-sm font-bold text-atlas-petrol-deep">{value}</p>
        </div>
    );
}
