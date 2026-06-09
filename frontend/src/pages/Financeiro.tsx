import { useCallback, useEffect, useState, FormEvent } from 'react';
import { toast } from 'sonner';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from 'recharts';
import {
  Wallet, TrendingUp, TrendingDown, Percent, Repeat, AlertTriangle, Plus, Trash2, Check,
} from 'lucide-react';
import { api } from '@/lib/api';
import { fmtBRL, fmtData, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import { useTheme } from '@/lib/use-theme';
import { CATEGORIA_META } from '@/lib/status';
import type { ResumoMes, SeriePonto, CobrancaItem, Despesa, CategoriaServico } from '@/types';

const hojeMes = () => new Date().toISOString().slice(0, 7);

export default function Financeiro() {
  const { theme } = useTheme();
  const [mes, setMes] = useState(hojeMes());
  const [resumo, setResumo] = useState<ResumoMes | null>(null);
  const [serie, setSerie] = useState<SeriePonto[]>([]);
  const [cobrancas, setCobrancas] = useState<CobrancaItem[]>([]);
  const [despesas, setDespesas] = useState<Despesa[]>([]);

  const loadMes = useCallback(() => {
    Promise.all([
      api.get<ResumoMes>('/financeiro/resumo', { params: { mes } }),
      api.get<SeriePonto[]>('/financeiro/serie', { params: { mes, meses: 6 } }),
      api.get<Despesa[]>('/despesas', { params: { mes } }),
    ])
      .then(([r, s, d]) => { setResumo(r.data); setSerie(s.data); setDespesas(d.data); })
      .catch(() => toast.error('Erro ao carregar financeiro'));
  }, [mes]);

  const loadCobrancas = useCallback(() => {
    api.get<CobrancaItem[]>('/financeiro/cobrancas').then((r) => setCobrancas(r.data)).catch(() => {});
  }, []);

  useEffect(() => { loadMes(); }, [loadMes]);
  useEffect(() => { loadCobrancas(); }, [loadCobrancas]);

  const axisColor = theme === 'dark' ? '#94a3b8' : '#64748b';
  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(2,6,23,0.06)';
  const tooltipStyle = {
    background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12,
    color: 'hsl(var(--foreground))', fontSize: 12, boxShadow: '0 10px 30px -12px rgba(0,0,0,0.5)',
  } as const;

  const serieData = serie.map((p) => ({ ...p, mesLabel: p.mes.slice(5) + '/' + p.mes.slice(2, 4) }));
  const totalAtrasado = cobrancas.filter((c) => c.situacao === 'ATRASADO').reduce((s, c) => s + c.totalDevido, 0);

  const marcarPago = async (c: CobrancaItem) => {
    try {
      await api.post(`/leads/${c.leadId}/mensalidades/pagar`, { vencimento: c.vencimento });
      toast.success('Mensalidade baixada');
      loadCobrancas();
      loadMes();
    } catch {
      toast.error('Falha ao baixar mensalidade');
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Financeiro</h1>
          <p className="mt-1 text-sm text-muted-foreground">Receita dos contratos, gastos e ROI do mês.</p>
        </div>
        <div>
          <Label>Mês de referência</Label>
          <Input type="month" value={mes} onChange={(e) => setMes(e.target.value || hojeMes())} className="w-[180px]" />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Receita do mês" value={fmtBRL(resumo?.receitaTotal)} Icon={Wallet} tone="success"
          hint={`Setup ${fmtBRL(resumo?.receitaSetup)} · Mensalidades ${fmtBRL(resumo?.receitaMensalidades)}`} />
        <StatCard title="Gastos do mês" value={fmtBRL(resumo?.despesas)} Icon={TrendingDown} tone="rose" hint="Investimento lançado" />
        <StatCard title="Lucro do mês" value={fmtBRL(resumo?.lucro)} Icon={TrendingUp} tone={(resumo?.lucro ?? 0) >= 0 ? 'success' : 'rose'} hint="Receita − gastos" />
        <StatCard title="ROI do mês" value={resumo?.roi != null ? `${resumo.roi}%` : '—'} Icon={Percent} tone="accent"
          hint={resumo?.roi != null ? 'Lucro / gastos' : 'Lance um gasto para calcular'} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Receita × Gastos (últimos 6 meses)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={serieData} margin={{ top: 8, right: 8, bottom: 4, left: -8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="mesLabel" tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={{ stroke: gridColor }} />
                <YAxis tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={false} width={44}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => fmtBRL(v)} />
                <Legend iconType="circle" formatter={(v) => <span className="text-xs text-muted-foreground">{v}</span>} />
                <Bar name="Receita" dataKey="receita" fill="#34d399" radius={[5, 5, 0, 0]} barSize={18} />
                <Bar name="Gastos" dataKey="despesas" fill="#fb7185" radius={[5, 5, 0, 0]} barSize={18} />
                <Line name="Lucro" type="monotone" dataKey="lucro" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receita recorrente</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl bg-primary/8 p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Repeat size={15} className="text-primary" /> MRR ativo (mensalidades)
              </div>
              <p className="tabular mt-1 text-2xl font-bold">{fmtBRL(resumo?.mrrAtivo)}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Soma das mensalidades de todos os contratos fechados.</p>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Receita por serviço (mês)</p>
              {!resumo || Object.keys(resumo.porServico).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem receita neste mês.</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(resumo.porServico).map(([servico, valor]) => (
                    <div key={servico} className="flex items-center justify-between text-sm">
                      <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
                        CATEGORIA_META[servico as CategoriaServico]?.badge ?? 'bg-muted text-muted-foreground ring-border')}>
                        {CATEGORIA_META[servico as CategoriaServico]?.label ?? servico}
                      </span>
                      <span className="tabular font-medium">{fmtBRL(valor)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cobranças */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            Cobranças em aberto
            {totalAtrasado > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/12 px-2 py-0.5 text-xs font-medium text-rose-500 ring-1 ring-inset ring-rose-500/25">
                <AlertTriangle size={12} /> {fmtBRL(totalAtrasado)} atrasado
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {cobrancas.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma mensalidade em aberto. 🎉</p>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Cliente</TH>
                  <TH>Vencimento</TH>
                  <TH>Situação</TH>
                  <TH>Mensalidade</TH>
                  <TH>Multa (1%/dia)</TH>
                  <TH>Total a cobrar</TH>
                  <TH></TH>
                </TR>
              </THead>
              <TBody>
                {cobrancas.map((c) => (
                  <TR key={`${c.leadId}-${c.vencimento}`} className="hover:bg-transparent">
                    <TD>
                      <div className="font-medium text-foreground">{c.nome}</div>
                      {c.cidade && <div className="text-xs text-muted-foreground">{c.cidade}</div>}
                    </TD>
                    <TD className="tabular text-sm">{fmtData(c.vencimento)}</TD>
                    <TD><SituacaoBadge situacao={c.situacao} dias={c.diasAtraso} /></TD>
                    <TD className="tabular text-sm">{fmtBRL(c.mensalidade)}</TD>
                    <TD className={cn('tabular text-sm', c.multa > 0 && 'font-medium text-rose-500')}>{fmtBRL(c.multa)}</TD>
                    <TD className="tabular text-sm font-semibold">{fmtBRL(c.totalDevido)}</TD>
                    <TD>
                      <Button size="sm" variant="outline" onClick={() => marcarPago(c)}><Check size={14} /> Pago</Button>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Receita por cliente */}
        <Card>
          <CardHeader><CardTitle>Ganho por cliente (mês)</CardTitle></CardHeader>
          <CardContent>
            {!resumo || resumo.porCliente.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Sem receita lançada neste mês.</p>
            ) : (
              <Table>
                <THead>
                  <TR><TH>Cliente</TH><TH>Serviço</TH><TH>Setup</TH><TH>Mensal.</TH><TH>Total</TH></TR>
                </THead>
                <TBody>
                  {resumo.porCliente.map((c) => (
                    <TR key={c.leadId} className="hover:bg-transparent">
                      <TD className="font-medium">{c.nome}</TD>
                      <TD>
                        {c.servico ? (
                          <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', CATEGORIA_META[c.servico].badge)}>
                            {CATEGORIA_META[c.servico].label}
                          </span>
                        ) : '—'}
                      </TD>
                      <TD className="tabular text-sm">{fmtBRL(c.setup)}</TD>
                      <TD className="tabular text-sm">{fmtBRL(c.mensalidades)}</TD>
                      <TD className="tabular text-sm font-semibold">{fmtBRL(c.total)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Despesas do mês */}
        <DespesasCard mes={mes} despesas={despesas} onChanged={loadMes} />
      </div>
    </div>
  );
}

function SituacaoBadge({ situacao, dias }: { situacao: CobrancaItem['situacao']; dias: number }) {
  const meta = {
    ATRASADO: { label: `Atrasado ${dias}d`, cls: 'bg-rose-500/12 text-rose-500 ring-rose-500/25' },
    VENCE_HOJE: { label: 'Vence hoje', cls: 'bg-amber-500/12 text-amber-500 ring-amber-500/25' },
    ABERTO: { label: 'Em aberto', cls: 'bg-slate-500/12 text-slate-500 dark:text-slate-300 ring-slate-500/25' },
  }[situacao];
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', meta.cls)}>{meta.label}</span>;
}

function DespesasCard({ mes, despesas, onChanged }: { mes: string; despesas: Despesa[]; onChanged: () => void }) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [data, setData] = useState(`${mes}-01`);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { setData(`${mes}-01`); }, [mes]);

  const total = despesas.reduce((s, d) => s + (d.valor ?? 0), 0);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    if (!valor) return toast.error('Informe o valor do gasto');
    setSubmitting(true);
    try {
      await api.post('/despesas', { descricao: descricao || undefined, valor: Number(valor), data });
      toast.success('Gasto lançado');
      setDescricao(''); setValor('');
      onChanged();
    } catch {
      toast.error('Falha ao lançar gasto');
    } finally {
      setSubmitting(false);
    }
  };

  const remover = async (id: string) => {
    try {
      await api.delete(`/despesas/${id}`);
      onChanged();
    } catch {
      toast.error('Falha ao remover');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gastos do mês</CardTitle>
        <span className="tabular text-sm font-semibold text-rose-500">{fmtBRL(total)}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={add} className="flex flex-wrap items-end gap-2">
          <div className="min-w-[140px] flex-1">
            <Label>Descrição</Label>
            <Input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Anúncios Meta" />
          </div>
          <div className="w-[110px]">
            <Label>Valor (R$)</Label>
            <Input type="number" step="0.01" min="0" value={valor} onChange={(e) => setValor(e.target.value)} />
          </div>
          <div className="w-[150px]">
            <Label>Data</Label>
            <Input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <Button type="submit" size="sm" disabled={submitting}><Plus size={14} /> Lançar</Button>
        </form>

        {despesas.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum gasto lançado neste mês.</p>
        ) : (
          <div className="divide-y divide-border">
            {despesas.map((d) => (
              <div key={d.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium">{d.descricao || 'Gasto'}</div>
                  <div className="text-xs text-muted-foreground tabular">{fmtData(d.data)}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="tabular font-medium text-rose-500">{fmtBRL(d.valor)}</span>
                  <button onClick={() => remover(d.id)} className="text-muted-foreground transition-colors hover:text-rose-500" title="Remover">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

const TONES: Record<string, string> = {
  primary: 'bg-primary/12 text-primary',
  success: 'bg-success/12 text-success',
  rose: 'bg-rose-500/12 text-rose-500 dark:text-rose-400',
  accent: 'bg-accent/12 text-accent',
};

function StatCard({ title, value, Icon, tone, hint }:
  { title: string; value: number | string; Icon: React.ElementType; tone: string; hint?: React.ReactNode }) {
  return (
    <Card className="group relative overflow-hidden transition-shadow hover:shadow-glow">
      <CardContent className="py-5">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <span className={cn('grid h-9 w-9 place-items-center rounded-lg', TONES[tone] ?? TONES.primary)}>
            <Icon size={18} />
          </span>
        </div>
        <p className="tabular mt-3 text-2xl font-bold tracking-tight">{value}</p>
        {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
