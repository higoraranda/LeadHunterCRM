import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { Nicho, labelNicho } from '@/types';

/**
 * Labels customizados das pastas de nicho, buscados uma vez por sessão e
 * compartilhados entre todas as telas (cache de módulo + assinantes).
 */
type LabelMap = Record<string, string>;

let cache: LabelMap | null = null;
let pending: Promise<LabelMap> | null = null;
const subs = new Set<(m: LabelMap) => void>();

function fetchLabels(): Promise<LabelMap> {
  if (cache) return Promise.resolve(cache);
  pending ??= api
    .get<LabelMap>('/nichos/labels')
    .then((r) => aplicarLabels(r.data))
    .catch(() => ({}) as LabelMap)
    .finally(() => { pending = null; });
  return pending;
}

/** Atualiza o cache (ex.: com o mapa retornado pelo PATCH) e notifica as telas montadas. */
export function aplicarLabels(map: LabelMap): LabelMap {
  cache = map;
  subs.forEach((fn) => fn(map));
  return map;
}

export function useNichoLabels() {
  const [labels, setLabels] = useState<LabelMap>(cache ?? {});

  useEffect(() => {
    subs.add(setLabels);
    fetchLabels().then(setLabels);
    return () => { subs.delete(setLabels); };
  }, []);

  return (n?: Nicho) => (n && labels[n]) || labelNicho(n);
}
