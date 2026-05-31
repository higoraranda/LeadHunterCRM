import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  NICHOS, CATEGORIAS, STATUS_SITE, STATUS_NEGOCIACAO, CANAIS,
  labelNicho, labelStatus,
} from '@/types';

export default function NewLead() {
  const navigate = useNavigate();
  const [f, setF] = useState<Record<string, string>>({
    nomeNegocio: '', telefone: '', siteAtual: '', statusSite: 'NAO_VERIFICADO',
    endereco: '', cidade: '', avaliacao: '', numeroReviews: '',
    nicho: '', categoriaServico: '', statusNegociacao: 'NAO_CONTATADO',
    canalUltimoContato: '', dataUltimoContato: '', observacoes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!f.nomeNegocio.trim()) {
      toast.error('Nome do negócio é obrigatório');
      return;
    }
    const body: Record<string, any> = {};
    Object.entries(f).forEach(([k, v]) => {
      if (v === '') return;
      if (k === 'avaliacao') body[k] = Number(v);
      else if (k === 'numeroReviews') body[k] = parseInt(v, 10);
      else body[k] = v;
    });
    setSubmitting(true);
    try {
      const r = await api.post('/leads', body);
      toast.success('Lead criado');
      navigate(`/leads/${r.data.id}`);
    } catch {
      toast.error('Erro ao criar lead');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-4">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
        <ArrowLeft size={16} />Voltar
      </button>
      <Card>
        <CardHeader><CardTitle>Novo Lead</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Nome do negócio *</Label>
              <Input value={f.nomeNegocio} onChange={(e) => set('nomeNegocio', e.target.value)} />
            </div>
            <div><Label>Telefone</Label><Input value={f.telefone} onChange={(e) => set('telefone', e.target.value)} /></div>
            <div><Label>Cidade</Label><Input value={f.cidade} onChange={(e) => set('cidade', e.target.value)} /></div>
            <div><Label>Site atual</Label><Input value={f.siteAtual} onChange={(e) => set('siteAtual', e.target.value)} /></div>
            <div>
              <Label>Status do site</Label>
              <Select value={f.statusSite} onChange={(e) => set('statusSite', e.target.value)}>
                {STATUS_SITE.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
            <div className="md:col-span-2"><Label>Endereço</Label><Input value={f.endereco} onChange={(e) => set('endereco', e.target.value)} /></div>
            <div><Label>Avaliação (0–5)</Label><Input type="number" step="0.1" value={f.avaliacao} onChange={(e) => set('avaliacao', e.target.value)} /></div>
            <div><Label>Nº de reviews</Label><Input type="number" value={f.numeroReviews} onChange={(e) => set('numeroReviews', e.target.value)} /></div>
            <div>
              <Label>Nicho</Label>
              <Select value={f.nicho} onChange={(e) => set('nicho', e.target.value)}>
                <option value="">—</option>
                {NICHOS.map((n) => <option key={n} value={n}>{labelNicho(n)}</option>)}
              </Select>
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={f.categoriaServico} onChange={(e) => set('categoriaServico', e.target.value)}>
                <option value="">—</option>
                {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>Status negociação</Label>
              <Select value={f.statusNegociacao} onChange={(e) => set('statusNegociacao', e.target.value)}>
                {STATUS_NEGOCIACAO.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
              </Select>
            </div>
            <div>
              <Label>Canal último contato</Label>
              <Select value={f.canalUltimoContato} onChange={(e) => set('canalUltimoContato', e.target.value)}>
                <option value="">—</option>
                {CANAIS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div><Label>Data último contato</Label><Input type="date" value={f.dataUltimoContato} onChange={(e) => set('dataUltimoContato', e.target.value)} /></div>
            <div className="md:col-span-2"><Label>Observações</Label><Textarea value={f.observacoes} onChange={(e) => set('observacoes', e.target.value)} /></div>
            <div className="md:col-span-2 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => navigate('/leads')}>Cancelar</Button>
              <Button type="submit" disabled={submitting}>{submitting ? 'Salvando…' : 'Criar Lead'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
