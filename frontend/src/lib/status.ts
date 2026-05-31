import type { StatusNegociacao, CategoriaServico, StatusSite } from '@/types';

type Meta = {
  label: string;
  /** classes para "pílula" (badge) — funciona em claro e escuro */
  badge: string;
  /** classe de cor para o "ponto" indicador */
  dot: string;
  /** cor sólida (hex) para gráficos */
  hex: string;
};

export const STATUS_META: Record<StatusNegociacao, Meta> = {
  NAO_CONTATADO: {
    label: 'Não contatado',
    badge: 'bg-slate-500/12 text-slate-600 dark:text-slate-300 ring-slate-500/25',
    dot: 'bg-slate-400',
    hex: '#94a3b8',
  },
  TENTATIVA_1: {
    label: 'Tentativa 1',
    badge: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-amber-500/25',
    dot: 'bg-amber-400',
    hex: '#fbbf24',
  },
  TENTATIVA_2: {
    label: 'Tentativa 2',
    badge: 'bg-orange-500/12 text-orange-600 dark:text-orange-400 ring-orange-500/25',
    dot: 'bg-orange-400',
    hex: '#fb923c',
  },
  TENTATIVA_3: {
    label: 'Tentativa 3',
    badge: 'bg-red-500/12 text-red-600 dark:text-red-400 ring-red-500/25',
    dot: 'bg-red-400',
    hex: '#f87171',
  },
  EM_NEGOCIACAO: {
    label: 'Em negociação',
    badge: 'bg-blue-500/12 text-blue-600 dark:text-blue-400 ring-blue-500/25',
    dot: 'bg-blue-400',
    hex: '#60a5fa',
  },
  REUNIAO_AGENDADA: {
    label: 'Reunião agendada',
    badge: 'bg-violet-500/12 text-violet-600 dark:text-violet-400 ring-violet-500/25',
    dot: 'bg-violet-400',
    hex: '#a78bfa',
  },
  PROPOSTA_ENVIADA: {
    label: 'Proposta enviada',
    badge: 'bg-cyan-500/12 text-cyan-600 dark:text-cyan-400 ring-cyan-500/25',
    dot: 'bg-cyan-400',
    hex: '#22d3ee',
  },
  FECHADO: {
    label: 'Fechado',
    badge: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25',
    dot: 'bg-emerald-400',
    hex: '#34d399',
  },
  PERDIDO: {
    label: 'Perdido',
    badge: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 ring-rose-500/25',
    dot: 'bg-rose-400',
    hex: '#fb7185',
  },
};

export const CATEGORIA_META: Record<CategoriaServico, { label: string; badge: string; hex: string }> = {
  AUTOMACAO: {
    label: 'Automação',
    badge: 'bg-indigo-500/12 text-indigo-600 dark:text-indigo-400 ring-indigo-500/25',
    hex: '#818cf8',
  },
  SITE: {
    label: 'Site',
    badge: 'bg-sky-500/12 text-sky-600 dark:text-sky-400 ring-sky-500/25',
    hex: '#38bdf8',
  },
  COMBO: {
    label: 'Combo',
    badge: 'bg-fuchsia-500/12 text-fuchsia-600 dark:text-fuchsia-400 ring-fuchsia-500/25',
    hex: '#e879f9',
  },
};

export const STATUS_SITE_META: Record<StatusSite, { label: string; badge: string }> = {
  SIM: { label: 'Tem site', badge: 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400 ring-emerald-500/25' },
  NAO: { label: 'Sem site', badge: 'bg-rose-500/12 text-rose-600 dark:text-rose-400 ring-rose-500/25' },
  DESATUALIZADO: { label: 'Desatualizado', badge: 'bg-amber-500/12 text-amber-600 dark:text-amber-400 ring-amber-500/25' },
  NAO_VERIFICADO: { label: 'Não verificado', badge: 'bg-slate-500/12 text-slate-600 dark:text-slate-300 ring-slate-500/25' },
};

/** Paleta para gráficos (genérica, usada quando não há mapeamento direto). */
export const CHART_PALETTE = ['#6366f1', '#a78bfa', '#22d3ee', '#34d399', '#fbbf24', '#fb7185', '#38bdf8', '#e879f9'];
