// src/services/desc-rank.service.ts
import type { Row } from '@/lib/oficina-normalize';
import { colorFor } from '@/lib/color.util';

// Top por descrição em um dataset já normalizado (usa 'Descricao_norm')
export function topByDescription(
  rows: Row[],
  {
    topN = 3,
    descriptionKey = 'Descricao_norm',
    reasonKey,            // ex.: 'Reason_normalized_v2' | 'Reason_spellfix' (opcional)
    reasonEquals,         // ex.: 'BLACK SCREEN' (opcional)
  }: {
    topN?: number;
    descriptionKey?: string;
    reasonKey?: string;
    reasonEquals?: string;
  } = {}
) {
  const map = new Map<string, number>();
  for (const r of rows) {
    if (reasonKey && typeof reasonEquals === 'string') {
      const rv = String(r?.[reasonKey] ?? '').trim();
      if (rv !== reasonEquals) continue;
    }
    const desc = String(r?.[descriptionKey] ?? '').trim();
    if (!desc) continue;
    map.set(desc, (map.get(desc) || 0) + 1);
  }
  const items = [...map.entries()]
    .map(([descricao, count]) => ({ descricao, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);

  // anexa cor estável
  return items.map((it) => ({ ...it, color: colorFor(it.descricao) }));
}

/** View-model pronto para o card */
export function buildDescRankVM(
  rowsNormalized: Row[],
  opts?: Parameters<typeof topByDescription>[1]
) {
  const items = topByDescription(rowsNormalized, opts);
  return {
    title: 'Top 3 — Falhas por Descrição',
    items, // { descricao, count, color }[]
  };
}