import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata um número como moeda brasileira (R$). */
export function fmtBRL(v?: number | null) {
  return BRL.format(v ?? 0);
}

/** Formata uma data ISO (yyyy-MM-dd) como dd/MM/yyyy, sem fuso. */
export function fmtData(iso?: string | null) {
  if (!iso) return '—';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return d && m && y ? `${d}/${m}/${y}` : iso;
}
