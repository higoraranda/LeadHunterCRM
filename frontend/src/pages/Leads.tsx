import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Upload, Download, Search, RotateCcw, Inbox, Star, ChevronLeft, ChevronRight,
  FolderPlus, MapPin, Tag, DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';
import { fmtData } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import {
  Lead, Page, Nicho, StatusNegociacao, Financeiro, StatusPagamentoSetup,
  CidadePasta, NichoPasta,
  NICHOS, CATEGORIAS, STATUS_NEGOCIACAO, STATUS_SITE, STATUS_PAGAMENTO_SETUP, SEM_CIDADE,
  labelNicho, labelStatus, labelSetupStatus,
} from '@/types';
import { CATEGORIA_META, STATUS_SITE_META, STATUS_META } from '@/lib/status';

const cidadeLabel = (nome: string) => (nome === SEM_CIDADE || nome === '' ? 'Sem cidade' : nome);

export default function Leads() {
  // A navegação em pastas vive na URL (?cidade=&nicho=) para que ao abrir um lead
  // e voltar, o usuário caia exatamente na pasta onde estava.
  const [params, setParams] = useSearchParams();
  const cidade = params.get('cidade');
  const nicho = params.get('nicho') as Nicho | null;

  const setCidade = (c: string | null) => {
    const p = new URLSearchParams(params);
    p.delete('nicho');
    if (c === null) p.delete('cidade'); else p.set('cidade', c);
    setParams(p);
  };
  const setNicho = (n: Nicho | null) => {
    const p = new URLSearchParams(params);
    if (n === null) p.delete('nicho'); else p.set('nicho', n);
    setParams(p);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb cidade={cidade} nicho={nicho} onRoot={() => setCidade(null)} onCidade={() => setNicho(null)} />

      {cidade === null && <CidadesView onOpen={(c) => setCidade(c)} />}
      {cidade !== null && nicho === null && (
        <NichosView cidade={cidade} onOpen={(n) => setNicho(n)} onBack={() => setCidade(null)} />
      )}
      {cidade !== null && nicho !== null && (
        <LeadsListView cidade={cidade} nicho={nicho} onBack={() => setNicho(null)} />
      )}
    </div>
  );
}

function Breadcrumb({ cidade, nicho, onRoot, onCidade }:
  { cidade: string | null; nicho: Nicho | null; onRoot: () => void; onCidade: () => void }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm">
      <button onClick={onRoot} className={cidade === null ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>
        Leads
      </button>
      {cidade !== null && (
        <>
          <ChevronRight size={14} className="text-muted-foreground" />
          <button onClick={onCidade} className={nicho === null ? 'font-semibold text-foreground' : 'text-muted-foreground hover:text-foreground'}>
            {cidadeLabel(cidade)}
          </button>
        </>
      )}
      {cidade !== null && nicho !== null && (
        <>
          <ChevronRight size={14} className="text-muted-foreground" />
          <span className="font-semibold text-foreground">{labelNicho(nicho)}</span>
        </>
      )}
    </nav>
  );
}

/* ============================ Nível 1 — Cidades ============================ */

function CidadesView({ onOpen }: { onOpen: (cidade: string) => void }) {
  const [cidades, setCidades] = useState<CidadePasta[] | null>(null);
  const [novaOpen, setNovaOpen] = useState(false);

  const load = useCallback(() => {
    api.get<CidadePasta[]>('/pastas/cidades')
      .then((r) => setCidades(r.data))
      .catch(() => toast.error('Erro ao carregar cidades'));
  }, []);
  useEffect(() => { load(); }, [load]);

  const exportarTudo = () => exportar({});

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads por cidade</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha uma cidade para abrir os nichos.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportarTudo}><Download size={16} /> Exportar</Button>
          <Button size="sm" onClick={() => setNovaOpen(true)}><FolderPlus size={16} /> Nova cidade</Button>
        </div>
      </header>

      {cidades === null ? (
        <FolderSkeleton />
      ) : cidades.length === 0 ? (
        <EmptyState icon={MapPin} title="Nenhuma cidade ainda" hint="Crie uma pasta de cidade e importe o CSV dos leads dela.">
          <Button size="sm" onClick={() => setNovaOpen(true)}><FolderPlus size={14} /> Nova cidade</Button>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {cidades.map((c) => (
            <FolderCard
              key={c.nome}
              icon={c.nome === SEM_CIDADE ? Inbox : MapPin}
              title={cidadeLabel(c.nome)}
              count={c.total}
              onClick={() => onOpen(c.nome)}
            />
          ))}
        </div>
      )}

      <NovaCidadeDialog open={novaOpen} onClose={() => setNovaOpen(false)} onDone={() => { setNovaOpen(false); load(); }} />
    </>
  );
}

/* ============================ Nível 2 — Nichos ============================ */

function NichosView({ cidade, onOpen, onBack }:
  { cidade: string; onOpen: (n: Nicho) => void; onBack: () => void }) {
  const [nichos, setNichos] = useState<NichoPasta[] | null>(null);

  useEffect(() => {
    api.get<NichoPasta[]>('/pastas/nichos', { params: { cidade } })
      .then((r) => setNichos(r.data))
      .catch(() => toast.error('Erro ao carregar nichos'));
  }, [cidade]);

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={onBack} className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ChevronLeft size={15} /> Cidades
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{cidadeLabel(cidade)}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Escolha um nicho para ver os leads ou importar um CSV.</p>
        </div>
      </header>

      {nichos === null ? (
        <FolderSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {nichos.map((n) => (
            <FolderCard key={n.nicho} icon={Tag} title={labelNicho(n.nicho)} count={n.total} muted={n.total === 0} onClick={() => onOpen(n.nicho)} />
          ))}
        </div>
      )}
    </>
  );
}

/* ============================ Nível 3 — Lista de leads ============================ */

interface ListFilters { busca: string; statusNegociacao: string; categoriaServico: string; statusSite: string; }
const emptyListFilters: ListFilters = { busca: '', statusNegociacao: '', categoriaServico: '', statusSite: '' };

function LeadsListView({ cidade, nicho, onBack }: { cidade: string; nicho: Nicho; onBack: () => void }) {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page<Lead> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [filters, setFilters] = useState<ListFilters>(emptyListFilters);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [financeLead, setFinanceLead] = useState<Lead | null>(null);

  const baseParams = useCallback(() => {
    const p: Record<string, any> = { nicho };
    p.cidade = cidade; // pode ser o sentinel SEM_CIDADE
    if (filters.busca) p.busca = filters.busca;
    if (filters.statusNegociacao) p.statusNegociacao = filters.statusNegociacao;
    if (filters.categoriaServico) p.categoriaServico = filters.categoriaServico;
    if (filters.statusSite) p.statusSite = filters.statusSite;
    return p;
  }, [cidade, nicho, filters]);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    api.get<Page<Lead>>('/leads', { params: { ...baseParams(), page: pageIndex, size: 20, sort: 'updatedAt,desc' } })
      .then((r) => setPage(r.data))
      .catch(() => toast.error('Erro ao listar leads'))
      .finally(() => setLoading(false));
  }, [baseParams, pageIndex]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const activeFilters = Object.values(filters).filter(Boolean).length;
  const clearFilters = () => { setFilters(emptyListFilters); setPageIndex(0); };

  const patchField = async (lead: Lead, body: Record<string, any>) => {
    try {
      await api.patch(`/leads/${lead.id}`, body);
      fetchLeads();
    } catch {
      toast.error('Falha ao salvar alteração');
    }
  };

  const handleStatusChange = async (lead: Lead, status: StatusNegociacao) => {
    try {
      await api.patch(`/leads/${lead.id}/status`, { statusNegociacao: status });
      fetchLeads();
      if (status === 'FECHADO') {
        setFinanceLead({ ...lead, statusNegociacao: status });
        toast.success('Status atualizado — preencha o financeiro');
      } else {
        toast.success('Status atualizado');
      }
    } catch {
      toast.error('Falha ao atualizar status');
    }
  };

  return (
    <>
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <button onClick={onBack} className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ChevronLeft size={15} /> Nichos
          </button>
          <h1 className="text-2xl font-bold tracking-tight">{labelNicho(nicho)} <span className="text-muted-foreground">· {cidadeLabel(cidade)}</span></h1>
          <p className="mt-1 text-sm text-muted-foreground">{page ? `${page.totalElements} leads nesta pasta` : 'Carregando…'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => exportar(baseParams())}><Download size={16} /> Exportar</Button>
          <Button size="sm" onClick={() => setImportOpen(true)}><Upload size={16} /> Importar CSV aqui</Button>
        </div>
      </header>

      {/* Filtros compactos */}
      <div className="flex flex-wrap items-end gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar negócio" value={filters.busca} onChange={(e) => setFilters((f) => ({ ...f, busca: e.target.value }))} />
        </div>
        <Select className="w-[170px]" value={filters.statusNegociacao} onChange={(e) => setFilters((f) => ({ ...f, statusNegociacao: e.target.value }))}>
          <option value="">Status: todos</option>
          {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
        </Select>
        <Select className="w-[150px]" value={filters.categoriaServico} onChange={(e) => setFilters((f) => ({ ...f, categoriaServico: e.target.value }))}>
          <option value="">Categoria: todas</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_META[c].label}</option>)}
        </Select>
        <Select className="w-[150px]" value={filters.statusSite} onChange={(e) => setFilters((f) => ({ ...f, statusSite: e.target.value }))}>
          <option value="">Site: todos</option>
          {STATUS_SITE.map((s) => <option key={s} value={s}>{STATUS_SITE_META[s].label}</option>)}
        </Select>
        {activeFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><RotateCcw size={14} /> Limpar</Button>
        )}
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Negócio</TH>
            <TH>Cidade</TH>
            <TH>Categoria</TH>
            <TH>Site</TH>
            <TH>Avaliação</TH>
            <TH>Status</TH>
          </TR>
        </THead>
        <TBody>
          {loading &&
            Array.from({ length: 8 }).map((_, i) => (
              <TR key={`sk-${i}`} className="hover:bg-transparent">
                {Array.from({ length: 6 }).map((__, j) => (
                  <TD key={j}><div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted" /></TD>
                ))}
              </TR>
            ))}

          {!loading && page?.content.length === 0 && (
            <TR className="hover:bg-transparent">
              <TD colSpan={6}>
                <div className="flex flex-col items-center gap-3 py-14 text-center">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"><Inbox size={22} /></span>
                  <div>
                    <p className="font-medium">Nenhum lead nesta pasta</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activeFilters > 0 ? 'Tente limpar os filtros' : 'Importe um CSV para este nicho e cidade'}
                    </p>
                  </div>
                  {activeFilters > 0 ? (
                    <Button variant="outline" size="sm" onClick={clearFilters}><RotateCcw size={14} /> Limpar filtros</Button>
                  ) : (
                    <Button size="sm" onClick={() => setImportOpen(true)}><Upload size={14} /> Importar CSV aqui</Button>
                  )}
                </div>
              </TD>
            </TR>
          )}

          {!loading && page?.content.map((lead) => (
            <TR key={lead.id} className="cursor-pointer" onClick={() => navigate(`/leads/${lead.id}`)}>
              <TD>
                <div className="font-medium text-foreground">{lead.nomeNegocio}</div>
                {lead.telefone && <div className="text-xs text-muted-foreground tabular">{lead.telefone}</div>}
              </TD>
              <TD onClick={(e) => e.stopPropagation()}>
                <InlineCidade lead={lead} onSave={(v) => patchField(lead, { cidade: v })} />
              </TD>
              <TD onClick={(e) => e.stopPropagation()}>
                <Select
                  className="h-8 w-[132px] text-xs"
                  value={lead.categoriaServico ?? ''}
                  onChange={(e) => patchField(lead, { categoriaServico: e.target.value || null })}
                >
                  <option value="">—</option>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_META[c].label}</option>)}
                </Select>
              </TD>
              <TD onClick={(e) => e.stopPropagation()}>
                <Select
                  className="h-8 w-[148px] text-xs"
                  value={lead.statusSite ?? ''}
                  onChange={(e) => patchField(lead, { statusSite: e.target.value || null })}
                >
                  <option value="">—</option>
                  {STATUS_SITE.map((s) => <option key={s} value={s}>{STATUS_SITE_META[s].label}</option>)}
                </Select>
              </TD>
              <TD>
                {lead.avaliacao ? (
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    <span className="tabular">{lead.avaliacao.toFixed(1)}</span>
                    {lead.numeroReviews ? <span className="text-xs text-muted-foreground tabular">({lead.numeroReviews})</span> : null}
                  </span>
                ) : <span className="text-muted-foreground">—</span>}
              </TD>
              <TD onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5">
                  <Select
                    className="h-8 w-[150px] text-xs"
                    value={lead.statusNegociacao ?? ''}
                    onChange={(e) => handleStatusChange(lead, e.target.value as StatusNegociacao)}
                    style={{ color: lead.statusNegociacao ? STATUS_META[lead.statusNegociacao].hex : undefined }}
                  >
                    {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
                  </Select>
                  {lead.statusNegociacao === 'FECHADO' && (
                    <button
                      onClick={() => setFinanceLead(lead)}
                      title="Editar financeiro"
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-emerald-500 transition-colors hover:bg-emerald-500/10"
                    >
                      <DollarSign size={15} />
                    </button>
                  )}
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>

      {page && page.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground tabular">
            {page.number * page.size + 1}–{Math.min((page.number + 1) * page.size, page.totalElements)} de {page.totalElements}
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page.number === 0} onClick={() => setPageIndex((p) => p - 1)}><ChevronLeft size={15} /> Anterior</Button>
            <Button size="sm" variant="outline" disabled={page.number >= page.totalPages - 1} onClick={() => setPageIndex((p) => p + 1)}>Próxima <ChevronRight size={15} /></Button>
          </div>
        </div>
      )}

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => { setImportOpen(false); fetchLeads(); }}
        presetCidade={cidade === SEM_CIDADE ? '' : cidade}
        presetNicho={nicho}
      />

      <FinanceiroDialog
        lead={financeLead}
        onClose={() => setFinanceLead(null)}
        onDone={() => { setFinanceLead(null); fetchLeads(); }}
      />
    </>
  );
}

/* ============================ Edição inline de cidade ============================ */

function InlineCidade({ lead, onSave }: { lead: Lead; onSave: (v: string | null) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(lead.cidade ?? '');

  const commit = () => {
    setEditing(false);
    const novo = val.trim();
    if (novo === (lead.cidade ?? '')) return;
    onSave(novo || null);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setVal(lead.cidade ?? ''); setEditing(true); }}
        className="rounded-md px-1.5 py-1 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        title="Clique para editar"
      >
        {lead.cidade || '—'}
      </button>
    );
  }
  return (
    <Input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') setEditing(false);
      }}
      className="h-8 w-[140px] text-xs"
    />
  );
}

/* ============================ Exportar ============================ */

async function exportar(params: Record<string, any>) {
  try {
    const r = await api.get('/leads/export', { params, responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([r.data], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads.csv';
    a.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error('Falha ao exportar');
  }
}

/* ============================ Componentes de pasta ============================ */

function FolderCard({ icon: Icon, title, count, onClick, muted }:
  { icon: React.ElementType; title: string; count: number; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-card transition-all hover:border-ring/40 hover:shadow-glow"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg ${muted ? 'bg-muted text-muted-foreground' : 'bg-primary/12 text-primary'}`}>
        <Icon size={20} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground tabular">{count} {count === 1 ? 'lead' : 'leads'}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </button>
  );
}

function FolderSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
          <div className="h-11 w-11 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ icon: Icon, title, hint, children }:
  { icon: React.ElementType; title: string; hint: string; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground"><Icon size={22} /></span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
    </div>
  );
}

/* ============================ Diálogo: nova cidade ============================ */

function NovaCidadeDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [nome, setNome] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return toast.error('Informe o nome da cidade');
    setSubmitting(true);
    try {
      await api.post('/pastas/cidades', { nome: nome.trim() });
      toast.success('Cidade criada');
      setNome('');
      onDone();
    } catch {
      toast.error('Falha ao criar cidade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Nova cidade" className="max-w-sm">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Nome da cidade</Label>
          <Input autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Salto" />
          <p className="mt-1.5 text-xs text-muted-foreground">A pasta aparece mesmo vazia, pronta para importar o CSV.</p>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Criando…' : 'Criar'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/* ============================ Diálogo: financeiro do FECHADO ============================ */

function addDias(iso: string, dias: number) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

function FinanceiroDialog({ lead, onClose, onDone }:
  { lead: Lead | null; onClose: () => void; onDone: () => void }) {
  const fin = lead?.financeiro;
  const [setupValor, setSetupValor] = useState('');
  const [setupStatus, setSetupStatus] = useState<StatusPagamentoSetup>('PAGO_50');
  const [mensalidadeValor, setMensalidadeValor] = useState('');
  const [dataEntrega, setDataEntrega] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!lead) return;
    setSetupValor(fin?.setupValor != null ? String(fin.setupValor) : '');
    setSetupStatus(fin?.setupStatus ?? 'PAGO_50');
    setMensalidadeValor(fin?.mensalidadeValor != null ? String(fin.mensalidadeValor) : '');
    setDataEntrega(fin?.dataEntrega ?? new Date().toISOString().slice(0, 10));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lead]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    setSubmitting(true);
    const body: Financeiro = {
      setupValor: setupValor ? Number(setupValor) : undefined,
      setupStatus,
      mensalidadeValor: mensalidadeValor ? Number(mensalidadeValor) : undefined,
      dataEntrega: dataEntrega || undefined,
    };
    try {
      await api.put(`/leads/${lead.id}/financeiro`, body);
      toast.success('Financeiro salvo');
      onDone();
    } catch {
      toast.error('Falha ao salvar financeiro');
    } finally {
      setSubmitting(false);
    }
  };

  const primeiroVenc = dataEntrega ? addDias(dataEntrega, 30) : '';

  return (
    <Dialog open={!!lead} onClose={onClose} title={`Financeiro — ${lead?.nomeNegocio ?? ''}`}>
      <form onSubmit={submit} className="space-y-3">
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
          Contrato fechado. Informe os valores para entrar no dashboard financeiro.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Valor do setup (R$)</Label>
            <Input type="number" step="0.01" min="0" value={setupValor} onChange={(e) => setSetupValor(e.target.value)} placeholder="Ex: 1500" />
          </div>
          <div>
            <Label>Situação do setup</Label>
            <Select value={setupStatus} onChange={(e) => setSetupStatus(e.target.value as StatusPagamentoSetup)}>
              {STATUS_PAGAMENTO_SETUP.map((s) => <option key={s} value={s}>{labelSetupStatus(s)}</option>)}
            </Select>
          </div>
          <div>
            <Label>Mensalidade (R$)</Label>
            <Input type="number" step="0.01" min="0" value={mensalidadeValor} onChange={(e) => setMensalidadeValor(e.target.value)} placeholder="Ex: 300" />
          </div>
          <div>
            <Label>Data de entrega</Label>
            <Input type="date" value={dataEntrega} onChange={(e) => setDataEntrega(e.target.value)} />
          </div>
        </div>
        {primeiroVenc && mensalidadeValor && (
          <p className="text-xs text-muted-foreground">
            1ª mensalidade vence em <span className="font-medium text-foreground">{fmtData(primeiroVenc)}</span> (30 dias após a entrega) e
            depois todo mês nesse dia. Atraso gera multa de 1% ao dia.
          </p>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Salvando…' : 'Salvar financeiro'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/* ============================ Diálogo: importar CSV ============================ */

function ImportDialog({ open, onClose, onDone, presetCidade, presetNicho }:
  { open: boolean; onClose: () => void; onDone: () => void; presetCidade: string; presetNicho: Nicho }) {
  const [file, setFile] = useState<File | null>(null);
  const [apenasComTelefone, setApenasComTelefone] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Selecione um arquivo CSV');
    setSubmitting(true);
    const form = new FormData();
    form.append('file', file);
    form.append('nicho', presetNicho);
    if (presetCidade.trim()) form.append('cidade', presetCidade.trim());
    form.append('apenasComTelefone', String(apenasComTelefone));
    try {
      const r = await api.post('/leads/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.erro) {
        toast.error(r.data.erro);
      } else {
        toast.success(`Importados: ${r.data.importados} | Ignorados: ${r.data.ignorados}`);
        setFile(null);
        onDone();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.erro || e?.response?.data?.message || e?.message || 'Falha ao importar';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Importar CSV nesta pasta">
      <form onSubmit={submit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <MapPin size={15} className="text-primary" />
            <span className="truncate">{presetCidade || 'Sem cidade'}</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
            <Tag size={15} className="text-primary" />
            <span className="truncate">{labelNicho(presetNicho)}</span>
          </div>
        </div>
        <div>
          <Label>Arquivo CSV</Label>
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Os leads entram já nesta cidade e nicho. Aceita exportações do Instant Data Scraper.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Categoria definida automaticamente</p>
          <p className="mt-0.5">Lead com site → <span className="font-medium text-foreground">Automação</span>. Lead sem site → <span className="font-medium text-foreground">Combo</span> (site + automação).</p>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input type="checkbox" checked={apenasComTelefone} onChange={(e) => setApenasComTelefone(e.target.checked)} className="h-4 w-4 accent-primary" />
          Importar apenas leads com telefone
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Enviando…' : 'Importar'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
