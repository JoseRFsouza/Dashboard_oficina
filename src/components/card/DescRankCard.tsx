// src/components/card/DescReasonsByDescricaoCard.tsx
'use client';

import { useOficinaNormalized } from '@/lib/useOficinaNormalized';
import DescReasonsByDescricaoCarouselView from '@/components/DescReasonsByDescricaoCarouselView';

import type { ReasonCategory } from '@/lib/oficina-normalize';
import { groupTopReasonsByDescricao } from '@/services/reasons-by-descricao.service';

export default function DescReasonsByDescricaoCard({
  title = 'Top 3 — Motivos por Descrição',
  intervalMs = 3500,
  include,                   // ex.: ['BLACK SCREEN','INOPERATIVE / NOT WORKING']
  exclude,                   // default remove ['NFF / TEST OK','UNSPECIFIED']
  topReasonsPerDescricao = 3,
}: {
  title?: string;
  intervalMs?: number;
  include?: ReasonCategory[];
  exclude?: ReasonCategory[];
  topReasonsPerDescricao?: number;
}) {
  const normalized = useOficinaNormalized();

  const slides = groupTopReasonsByDescricao(normalized, {
    include,
    exclude,
    topReasonsPerDescricao,
    // countStrategy: 'each-reason-once-per-row',
  });

  return <DescReasonsByDescricaoCarouselView title={title} slides={slides} intervalMs={intervalMs} />;
}