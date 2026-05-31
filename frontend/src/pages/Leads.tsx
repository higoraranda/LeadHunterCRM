import { useEffect, useState, useCallback, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Upload, Download, Search, RotateCcw, Inbox, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/table';
import {
  Lead, Page, Nicho, CategoriaServico, StatusNegociacao,
  NICHOS, CATEGORIAS, STATUS_NEGOCIACAO, STATUS_SITE, labelNicho, labelStatus,
} from '@/types';
import { CATEGORIA_META, STATUS_SITE_META, STATUS_META } from '@/lib/status';

interface Filters {
  busca: string;
  nicho: string;
  cidade: string;
  statusNegociacao: string;
  categoriaServico: string;
  statusSite: string;
}

const emptyFilters: Filters = {
  busca: '', nicho: '', cidade: '', statusNegociacao: '', categoriaServico: '', statusSite: '',
};

export default function Leads() {
  const navigate = useNavigate();
  const [page, setPage] = useState<Page<Lead> | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    const params: Record<string, any> = { page: pageIndex, size: 20, sort: 'updatedAt,desc' };
    (Object.keys(filters) as (keyof Filters)[]).forEach((k) => {
      if (filters[k]) params[k] = filters[k];
    });
    api.get<Page<Lead>>('/leads', { params })
      .then((r) => setPage(r.data))
      .catch(() => toast.error('Erro ao listar leads'))
      .finally(() => setLoading(false));
  }, [pageIndex, filters]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const applyFilters = (e: FormEvent) => {
    e.preventDefault();
    setPageIndex(0);
    fetchLeads();
  };

  const clearFilters = () => {
    setFilters(emptyFilters);
    setPageIndex(0);
  };

  const activeFilters = Object.values(filters).filter(Boolean).length;

  const handleStatusChange = async (lead: Lead, status: StatusNegociacao) => {
    try {
      await api.patch(`/leads/${lead.id}/status`, { statusNegociacao: status });
      toast.success('Status atualizado');
      fetchLeads();
    } catch {
      toast.error('Falha ao atualizar status');
    }
  };

  const exportar = async () => {
    try {
      const params: Record<string, any> = {};
      (Object.keys(filters) as (keyof Filters)[]).forEach((k) => {
        if (filters[k]) params[k] = filters[k];
      });
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
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {page ? `${page.totalElements} leads na base` : 'Carregando base…'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportar}>
            <Download size={16} /> Exportar
          </Button>
          <Button size="sm" onClick={() => setImportOpen(true)}>
            <Upload size={16} /> Importar CSV
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-5">
        {/* Filtros */}
        <Card className="col-span-12 self-start md:sticky md:top-6 md:col-span-3">
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Filtros</span>
              {activeFilters > 0 && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  <RotateCcw size={12} /> Limpar ({activeFilters})
                </button>
              )}
            </div>
            <form onSubmit={applyFilters} className="space-y-3">
              <div>
                <Label>Busca</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    placeholder="Nome do negócio"
                    value={filters.busca}
                    onChange={(e) => setFilters((f) => ({ ...f, busca: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label>Nicho</Label>
                <Select value={filters.nicho} onChange={(e) => setFilters((f) => ({ ...f, nicho: e.target.value }))}>
                  <option value="">Todos</option>
                  {NICHOS.map((n) => <option key={n} value={n}>{labelNicho(n)}</option>)}
                </Select>
              </div>
              <div>
                <Label>Cidade</Label>
                <Input value={filters.cidade} onChange={(e) => setFilters((f) => ({ ...f, cidade: e.target.value }))} />
              </div>
              <div>
                <Label>Status da negociação</Label>
                <Select value={filters.statusNegociacao} onChange={(e) => setFilters((f) => ({ ...f, statusNegociacao: e.target.value }))}>
                  <option value="">Todos</option>
                  {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
                </Select>
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={filters.categoriaServico} onChange={(e) => setFilters((f) => ({ ...f, categoriaServico: e.target.value }))}>
                  <option value="">Todas</option>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_META[c].label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Tem site?</Label>
                <Select value={filters.statusSite} onChange={(e) => setFilters((f) => ({ ...f, statusSite: e.target.value }))}>
                  <option value="">Todos</option>
                  {STATUS_SITE.map((s) => <option key={s} value={s}>{STATUS_SITE_META[s].label}</option>)}
                </Select>
              </div>
              <Button type="submit" size="sm" className="w-full">Aplicar filtros</Button>
            </form>
          </CardContent>
        </Card>

        {/* Tabela */}
        <div className="col-span-12 space-y-3 md:col-span-9">
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
                      <TD key={j}>
                        <div className="h-4 w-full max-w-[120px] animate-pulse rounded bg-muted" />
                      </TD>
                    ))}
                  </TR>
                ))}

              {!loading && page?.content.length === 0 && (
                <TR className="hover:bg-transparent">
                  <TD colSpan={6}>
                    <div className="flex flex-col items-center gap-3 py-14 text-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-muted text-muted-foreground">
                        <Inbox size={22} />
                      </span>
                      <div>
                        <p className="font-medium">Nenhum lead encontrado</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activeFilters > 0 ? 'Tente limpar os filtros' : 'Importe um CSV ou cadastre um lead'}
                        </p>
                      </div>
                      {activeFilters > 0 ? (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          <RotateCcw size={14} /> Limpar filtros
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => navigate('/leads/novo')}>Cadastrar lead</Button>
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
                  <TD className="text-sm text-muted-foreground">{lead.cidade ?? '—'}</TD>
                  <TD>
                    {lead.categoriaServico ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${CATEGORIA_META[lead.categoriaServico].badge}`}>
                        {CATEGORIA_META[lead.categoriaServico].label}
                      </span>
                    ) : '—'}
                  </TD>
                  <TD>
                    {lead.statusSite ? (
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${STATUS_SITE_META[lead.statusSite].badge}`}>
                        {STATUS_SITE_META[lead.statusSite].label}
                      </span>
                    ) : '—'}
                  </TD>
                  <TD>
                    {lead.avaliacao ? (
                      <span className="inline-flex items-center gap-1 text-sm">
                        <Star size={13} className="fill-amber-400 text-amber-400" />
                        <span className="tabular">{lead.avaliacao.toFixed(1)}</span>
                        {lead.numeroReviews ? (
                          <span className="text-xs text-muted-foreground tabular">({lead.numeroReviews})</span>
                        ) : null}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TD>
                  <TD onClick={(e) => e.stopPropagation()}>
                    <Select
                      className="h-8 w-[150px] text-xs"
                      value={lead.statusNegociacao ?? ''}
                      onChange={(e) => handleStatusChange(lead, e.target.value as StatusNegociacao)}
                      style={{ color: lead.statusNegociacao ? STATUS_META[lead.statusNegociacao].hex : undefined }}
                    >
                      {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
                    </Select>
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
                <Button size="sm" variant="outline" disabled={page.number === 0} onClick={() => setPageIndex((p) => p - 1)}>
                  <ChevronLeft size={15} /> Anterior
                </Button>
                <Button size="sm" variant="outline" disabled={page.number >= page.totalPages - 1} onClick={() => setPageIndex((p) => p + 1)}>
                  Próxima <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <ImportDialog
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onDone={() => { setImportOpen(false); fetchLeads(); }}
      />
    </div>
  );
}

function ImportDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [nicho, setNicho] = useState<Nicho>('OUTRO');
  const [categoria, setCategoria] = useState<CategoriaServico>('SITE');
  const [cidade, setCidade] = useState('');
  const [apenasComTelefone, setApenasComTelefone] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return toast.error('Selecione um arquivo CSV');
    setSubmitting(true);
    const form = new FormData();
    form.append('file', file);
    form.append('nicho', nicho);
    form.append('categoriaServico', categoria);
    if (cidade.trim()) form.append('cidade', cidade.trim());
    form.append('apenasComTelefone', String(apenasComTelefone));
    try {
      const r = await api.post('/leads/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (r.data.erro) {
        toast.error(r.data.erro);
      } else {
        toast.success(`Importados: ${r.data.importados} | Ignorados: ${r.data.ignorados}`);
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
    <Dialog open={open} onClose={onClose} title="Importar CSV">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Arquivo CSV</Label>
          <Input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          <p className="mt-1.5 text-xs text-muted-foreground">
            Aceita exportações do Instant Data Scraper (detecta colunas automaticamente).
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Nicho</Label>
            <Select value={nicho} onChange={(e) => setNicho(e.target.value as Nicho)}>
              {NICHOS.map((n) => <option key={n} value={n}>{labelNicho(n)}</option>)}
            </Select>
          </div>
          <div>
            <Label>Categoria de serviço</Label>
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaServico)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{CATEGORIA_META[c].label}</option>)}
            </Select>
          </div>
        </div>
        <div>
          <Label>Cidade (usada quando o CSV não tem coluna de cidade)</Label>
          <Input value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Ex: Salto" />
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={apenasComTelefone}
            onChange={(e) => setApenasComTelefone(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
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
