import { useEffect, useState, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Trash2, Plus } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Lead, Interacao, Canal, CATEGORIAS, NICHOS, STATUS_NEGOCIACAO,
  STATUS_SITE, CANAIS, labelStatus,
} from '@/types';
import { useNichoLabels } from '@/lib/nichos';

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const nichoLabel = useNichoLabels();
  const [lead, setLead] = useState<Lead | null>(null);
  const [interacoes, setInteracoes] = useState<Interacao[]>([]);
  const [saving, setSaving] = useState(false);
  const [dlgOpen, setDlgOpen] = useState(false);

  const load = () => {
    api.get<Lead>(`/leads/${id}`).then((r) => setLead(r.data)).catch(() => toast.error('Lead não encontrado'));
    api.get<Interacao[]>(`/leads/${id}/interacoes`).then((r) => setInteracoes(r.data)).catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const set = <K extends keyof Lead>(k: K, v: Lead[K]) => setLead((l) => l ? { ...l, [k]: v } : l);

  const salvar = async () => {
    if (!lead) return;
    setSaving(true);
    try {
      const { id: _i, createdAt, updatedAt, ...body } = lead;
      await api.put(`/leads/${id}`, body);
      toast.success('Lead atualizado');
      load();
    } catch {
      toast.error('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const deletar = async () => {
    if (!confirm('Deletar este lead?')) return;
    try {
      await api.delete(`/leads/${id}`);
      toast.success('Lead deletado');
      navigate('/leads');
    } catch {
      toast.error('Erro ao deletar');
    }
  };

  if (!lead) return <div className="p-6 text-muted-foreground">Carregando…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft size={16} />Voltar
        </button>
        <div className="flex gap-2">
          <Button variant="destructive" size="sm" onClick={deletar}><Trash2 size={14} className="mr-1" />Deletar</Button>
          <Button onClick={salvar} disabled={saving}>{saving ? 'Salvando…' : 'Salvar alterações'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>{lead.nomeNegocio}</CardTitle>
              <div className="mt-2"><Badge status={lead.statusNegociacao} /></div>
            </div>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nome do negócio"><Input value={lead.nomeNegocio} onChange={(e) => set('nomeNegocio', e.target.value)} /></Field>
            <Field label="Telefone"><Input value={lead.telefone ?? ''} onChange={(e) => set('telefone', e.target.value)} /></Field>
            <Field label="Site atual"><Input value={lead.siteAtual ?? ''} onChange={(e) => set('siteAtual', e.target.value)} /></Field>
            <Field label="Status do site">
              <Select value={lead.statusSite ?? ''} onChange={(e) => set('statusSite', (e.target.value || undefined) as any)}>
                <option value="">—</option>
                {STATUS_SITE.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="Endereço" className="md:col-span-2"><Input value={lead.endereco ?? ''} onChange={(e) => set('endereco', e.target.value)} /></Field>
            <Field label="Cidade"><Input value={lead.cidade ?? ''} onChange={(e) => set('cidade', e.target.value)} /></Field>
            <Field label="Avaliação"><Input type="number" step="0.1" min="0" max="5" value={lead.avaliacao ?? ''} onChange={(e) => set('avaliacao', e.target.value ? Number(e.target.value) : undefined)} /></Field>
            <Field label="Nº reviews"><Input type="number" min="0" value={lead.numeroReviews ?? ''} onChange={(e) => set('numeroReviews', e.target.value ? Number(e.target.value) : undefined)} /></Field>
            <Field label="Nicho">
              <Select value={lead.nicho ?? ''} onChange={(e) => set('nicho', (e.target.value || undefined) as any)}>
                <option value="">—</option>
                {NICHOS.map((n) => <option key={n} value={n}>{nichoLabel(n)}</option>)}
              </Select>
            </Field>
            <Field label="Categoria">
              <Select value={lead.categoriaServico ?? ''} onChange={(e) => set('categoriaServico', (e.target.value || undefined) as any)}>
                <option value="">—</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Status negociação">
              <Select value={lead.statusNegociacao ?? ''} onChange={(e) => set('statusNegociacao', (e.target.value || undefined) as any)}>
                {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
              </Select>
            </Field>
            <Field label="Canal último contato">
              <Select value={lead.canalUltimoContato ?? ''} onChange={(e) => set('canalUltimoContato', (e.target.value || undefined) as any)}>
                <option value="">—</option>
                {CANAIS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="Data último contato">
              <Input type="date" value={lead.dataUltimoContato ?? ''} onChange={(e) => set('dataUltimoContato', e.target.value || undefined)} />
            </Field>
            <Field label="Observações" className="md:col-span-2">
              <Textarea value={lead.observacoes ?? ''} onChange={(e) => set('observacoes', e.target.value)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Timeline</CardTitle>
            <Button size="sm" onClick={() => setDlgOpen(true)}><Plus size={14} className="mr-1" />Nova</Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {interacoes.length === 0 && (
              <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                Nenhuma interação registrada ainda.
              </div>
            )}
            {interacoes.map((i) => (
              <div key={i.id} className="relative border-l-2 border-primary/40 pb-4 pl-4">
                <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-primary">{i.canal}</span>
                  <span className="text-xs text-muted-foreground tabular">{new Date(i.dataHora).toLocaleString('pt-BR')}</span>
                </div>
                {i.resultado && <p className="mt-1 text-sm text-foreground/90">{i.resultado}</p>}
                {i.proximoPasso && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Próx.: {i.proximoPasso}{i.dataProximoPasso ? ` (${i.dataProximoPasso})` : ''}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <InteracaoDialog
        open={dlgOpen}
        onClose={() => setDlgOpen(false)}
        onDone={() => { setDlgOpen(false); load(); }}
        leadId={id!}
      />
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InteracaoDialog({ open, onClose, onDone, leadId }:
  { open: boolean; onClose: () => void; onDone: () => void; leadId: string }) {
  const [canal, setCanal] = useState<Canal>('COLD_CALL');
  const [resultado, setResultado] = useState('');
  const [proximoPasso, setProximoPasso] = useState('');
  const [dataProximoPasso, setDataProximoPasso] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/leads/${leadId}/interacoes`, {
        canal, resultado: resultado || undefined,
        proximoPasso: proximoPasso || undefined,
        dataProximoPasso: dataProximoPasso || undefined,
      });
      toast.success('Interação registrada');
      setResultado(''); setProximoPasso(''); setDataProximoPasso('');
      onDone();
    } catch {
      toast.error('Erro ao registrar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Nova interação">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Canal</Label>
          <Select value={canal} onChange={(e) => setCanal(e.target.value as Canal)}>
            {CANAIS.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div>
          <Label>Resultado</Label>
          <Textarea value={resultado} onChange={(e) => setResultado(e.target.value)} placeholder="O que aconteceu no contato?" />
        </div>
        <div>
          <Label>Próximo passo</Label>
          <Input value={proximoPasso} onChange={(e) => setProximoPasso(e.target.value)} />
        </div>
        <div>
          <Label>Data próximo passo</Label>
          <Input type="date" value={dataProximoPasso} onChange={(e) => setDataProximoPasso(e.target.value)} />
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit" disabled={submitting}>{submitting ? 'Salvando…' : 'Registrar'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
