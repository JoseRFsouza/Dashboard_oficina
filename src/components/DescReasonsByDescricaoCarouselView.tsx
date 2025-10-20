// src/components/DescReasonsByDescricaoCarouselView.tsx
'use client';

import { useEffect, useState } from 'react';

export type ReasonsSlide = {
  descricao: string;
  total: number;
  reasons: Array<{ category: string; count: number; percent?: number; color?: string }>;
};

export default function DescReasonsByDescricaoCarouselView({
  title = 'Rank — Removal Reasons by Work Order',
  slides,
  intervalMs = 3500,
}: {
  title?: string;
  slides: ReasonsSlide[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // autoplay só depois de montar e com dados
  useEffect(() => {
    if (!mounted || !slides?.length) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(t);
  }, [mounted, slides?.length, intervalMs]);

  // sempre que muda o conjunto de slides, volta pro primeiro
  useEffect(() => setIdx(0), [slides?.length]);

  const ready = mounted && !!slides?.length;

  // mantém 3 linhas no conteúdo (Top 3)
  const reasons = ready ? slides[idx].reasons : [];
  const rows = Array.from({ length: 3 }, (_, i) => reasons[i] ?? null);

  return (
    <div
      // 4 blocos: título (topo) | cápsula | conteúdo | dots (rodapé)
      className="h-full grid grid-rows-[auto,auto,1fr,auto] gap-y-2 rounded-lg border border-border bg-primary-foreground p-4"
      role="region"
      aria-label={title}
    >
      {/* (1) TÍTULO — centralizado e encostado no topo do card (sem margin-top extra) */}
      <div className="text-center">
        <h3 className="text-l font-semibold text-foreground">{title}</h3>
      </div>

      {/* (2) CÁPSULA — descrição à esquerda, total à direita (text-xl) */}
      <div>
        <div
          className="w-full rounded-full bg-muted px-3 py-2 text-xl text-muted-foreground flex items-center justify-between gap-3"
          suppressHydrationWarning
        >
          <span className="truncate" title={ready ? slides[idx].descricao : ''}>
            {ready ? slides[idx].descricao : '—'}
          </span>
          <span className="font-bold">
            {ready ? slides[idx].total : 'Top 0'}
          </span>
        </div>
      </div>

      {/* (3) CONTEÚDO — 3 linhas iguais (Top 3 motivos), exatamente como estava */}
      <div className="grid grid-rows-3 gap-2">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3">
            {r ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ background: r.color ?? '#93c5fd' }}
                  />
                  <span className="text-xs text-foreground truncate" title={r.category}>
                    {r.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {typeof r.percent === 'number' && (
                    <span className="text-xs text-muted-foreground">{r.percent}%</span>
                  )}
                  <span className="text-xl font-bold 
                    text-[rgb(101,67,33)] dark:text-yellow-300">
                    {r.count}
                  </span>
                </div>
              </>
            ) : (
              // Slot vazio para manter a distribuição quando houver < 3 itens
              <div className="w-full h-full opacity-50" />
            )}
          </div>
        ))}
      </div>

      {/* (4) RODAPÉ — dots centralizados e encostados ao fundo do card */}
      <div className="flex justify-center" role="tablist" aria-label="Navegação">
        {ready &&
          slides.map((s, i) => (
            <button
              key={s.descricao + i}
              role="tab"
              aria-selected={i === idx}
              aria-label={`Ir para ${s.descricao}`}
              onClick={() => setIdx(i)}
              className={[
                'h-2 w-2 rounded-full transition-colors',
                i === idx ? 'bg-blue-300' : 'bg-muted',
              ].join(' ')}
            />
          ))}
      </div>
    </div>
  );
}