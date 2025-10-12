// src/components/DescRankCarouselView.tsx
'use client';

import { useEffect, useState } from 'react';

export type DescRankItem = {
  descricao: string;
  count: number;
  color?: string;
};

export default function DescRankCarouselView({
  title = 'Top 3 — Falhas por Descrição',
  items,
  intervalMs = 3500,
}: {
  title?: string;
  items: DescRankItem[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!items?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % items.length), intervalMs);
    return () => clearInterval(t);
  }, [items, intervalMs]);

  // 🔧 Sempre renderiza o mesmo wrapper + header + badge
  if (!items?.length) {
    return (
      <div
        className="rounded-lg border border-border bg-primary-foreground p-4"
        role="region"
        aria-label={title}
      >
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Top 0
          </span>
        </div>

        {/* Conteúdo vazio estável */}
        <div className="flex flex-col items-start gap-1">
          <div className="text-sm text-muted-foreground">Sem dados para exibir</div>
        </div>

        {/* Dots vazios (opcional) */}
        <div className="mt-3 flex gap-1" role="tablist" aria-label="Navegação">
          {/* sem dots quando não há itens */}
        </div>
      </div>
    );
  }

  const active = items[idx];

  return (
    <div
      className="rounded-lg border border-border bg-primary-foreground p-4"
      role="region"
      aria-label={title}
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          Top {items.length}
        </span>
      </div>

      <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ background: active.color ?? '#93c5fd' }}
          />
          {active.descricao}
        </div>
        <div className="text-3xl font-extrabold text-orange-600 border border-gray-900">{active.count}</div>
        <div className="text-xs text-muted-foreground">ocorrências</div>
      </div>

      <div className="mt-3 flex gap-1" role="tablist" aria-label="Navegação">
        {items.map((_, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === idx}
            aria-label={`Ir para slide ${i + 1}`}
            onClick={() => setIdx(i)}
            className={[
              'h-2 w-2 rounded-full',
              i === idx ? 'bg-blue-300' : 'bg-muted',
            ].join(' ')}
          />
        ))}
      </div>
    </div>
  );
}