// src/services/reasons-by-descricao.service.ts
import { extractNormalizedReasonsFromRow, type ReasonCategory, type Row } from '@/lib/oficina-normalize';

import { colorFor } from '@/lib/color.util';

// Estratégia de contagem por linha:
// - 'each-reason-once-per-row' (default): para cada motivo listado naquela linha, soma +1 naquela categoria (sem duplicar motivo na mesma linha).
// - 'by-reason' (idem ao default, dado que extractNormalizedReasonsFromRow já deduplica por linha).
export type CountStrategy = 'each-reason-once-per-row' | 'by-reason';

export interface GroupTopReasonsOptions {
  descriptionKeys?: string[];               // headers possíveis para Descrição
  include?: ReasonCategory[];               // categorias a considerar (ex.: ['BLACK SCREEN', ...])
  exclude?: ReasonCategory[];               // ex.: ['NFF / TEST OK','UNSPECIFIED'] (default recomendado)
  countStrategy?: CountStrategy;            // default: 'each-reason-once-per-row'
  topReasonsPerDescricao?: number;          // default: 3
  minTotalPerDescricao?: number;            // default: 1 (filtra descrições sem ocorrência)
}

const DEFAULT_DESC_KEYS = ['Descricao', 'Descrição', 'Descri��o'];
const DEFAULT_EXCLUDE: ReasonCategory[] = ['NFF / TEST OK', 'UNSPECIFIED'];

function pickFirst(obj: Record<string, any>, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

/**
 * Retorna "slides" prontos:
 * [
 *   {
 *     descricao: 'SEAT 27B',
 *     total: 12,
 *     reasons: [
 *       { category: 'BLACK SCREEN', count: 7, percent: 58, color: '#...' },
 *       { category: 'INOPERATIVE / NOT WORKING', count: 3, percent: 25, color: '#...' },
 *       { category: 'SOFTWARE / BOOT', count: 2, percent: 17, color: '#...' }
 *     ]
 *   },
 *   ...
 * ]
 */
export function groupTopReasonsByDescricao(
  rows: Row[],
  {
    descriptionKeys = DEFAULT_DESC_KEYS,
    include,
    exclude = DEFAULT_EXCLUDE,
    countStrategy = 'each-reason-once-per-row',
    topReasonsPerDescricao = 3,
    minTotalPerDescricao = 1,
  }: GroupTopReasonsOptions = {}
) {
  // Mapa: descricao -> (categoria -> contagem)
  const byDesc: Map<string, Map<ReasonCategory, number>> = new Map();

  for (const r of rows) {
    const descricao = pickFirst(r, descriptionKeys);
    if (!descricao) continue;

    const reasons = extractNormalizedReasonsFromRow(r); // já faz split + spellfix + categoria + dedupe
    if (!reasons.length) continue;

    // Filtro include/exclude
    const filtered = reasons.filter((cat) => {
      const inInclude = include ? include.includes(cat) : true;
      const inExclude = exclude?.includes(cat);
      return inInclude && !inExclude;
    });
    if (!filtered.length) continue;

    // Contagem por descrição
    if (!byDesc.has(descricao)) byDesc.set(descricao, new Map());
    const catMap = byDesc.get(descricao)!;

    if (countStrategy === 'each-reason-once-per-row' || countStrategy === 'by-reason') {
      // incrementa 1 para cada motivo presente (dedup por linha já aplicado)
      for (const c of filtered) {
        catMap.set(c, (catMap.get(c) || 0) + 1);
      }
    }
  }

  // Monta slides
  const slides = [...byDesc.entries()].map(([descricao, catMap]) => {
    const list = [...catMap.entries()]
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    const total = list.reduce((s, it) => s + it.count, 0);
    if (total < minTotalPerDescricao) return null;

    const top = list.slice(0, topReasonsPerDescricao).map((it) => ({
      category: it.category,
      count: it.count,
      percent: Math.round((it.count / Math.max(total, 1)) * 100),
      color: colorFor(it.category),
    }));

    return { descricao, total, reasons: top };
  }).filter(Boolean) as Array<{
    descricao: string;
    total: number;
    reasons: Array<{ category: ReasonCategory; count: number; percent: number; color: string }>;
  }>;

  // Ordena slides por total desc (opcional)
  slides.sort((a, b) => b.total - a.total);

  return slides;
}