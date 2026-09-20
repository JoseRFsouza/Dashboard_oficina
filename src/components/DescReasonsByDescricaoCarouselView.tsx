'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, Cpu } from 'lucide-react';

export type ReasonsSlide = {
  descricao: string;
  total: number;
  reasons: Array<{ category: string; count: number; percent?: number; color?: string }>;
};

export default function DescReasonsByDescricaoCarouselView({
  title = 'Top 3 — Motivos de Remoção',
  slides,
  intervalMs = 4000,
}: {
  title?: string;
  slides: ReasonsSlide[];
  intervalMs?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => setMounted(true), []);

  // autoplay quando montado e não pausado
  useEffect(() => {
    if (!mounted || !slides?.length || isPaused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(t);
  }, [mounted, slides?.length, intervalMs, isPaused]);

  // sempre que muda o conjunto de slides, volta pro primeiro
  useEffect(() => setIdx(0), [slides?.length]);

  const ready = mounted && !!slides?.length;
  const currentSlide = ready ? slides[idx] : null;

  // mantém 3 linhas no conteúdo (Top 3)
  const reasons = currentSlide ? currentSlide.reasons : [];
  const rows = Array.from({ length: 3 }, (_, i) => reasons[i] ?? null);

  const prevSlide = () => {
    if (!slides.length) return;
    setIdx((i) => (i - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    if (!slides.length) return;
    setIdx((i) => (i + 1) % slides.length);
  };

  return (
    <div
      className="flex flex-col h-full w-full justify-between p-1"
      role="region"
      aria-label={title}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* (1) HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              {title}
            </h3>
            <p className="text-[11px] text-muted-foreground">Classificação de falhas por equipamento</p>
          </div>
        </div>
        {ready && (
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] text-muted-foreground px-1">
              {idx + 1}/{slides.length}
            </span>
            <button
              onClick={nextSlide}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Próximo"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* (2) COMPONENT ACTIVE CAPSULE */}
      <div className="my-2">
        <div className="w-full rounded-lg bg-secondary/70 border border-border/60 px-3 py-2 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <Cpu className="w-4 h-4 text-sky-500 shrink-0" />
            <span className="text-xs font-bold text-foreground truncate" title={currentSlide?.descricao}>
              {currentSlide ? currentSlide.descricao : 'Aguardando dados...'}
            </span>
          </div>
          <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-background border border-border/80 text-foreground shrink-0">
            {currentSlide ? `${currentSlide.total} falhas` : '0 falhas'}
          </span>
        </div>
      </div>

      {/* (3) TOP 3 RANKED REASONS */}
      <div className="flex flex-col gap-2 my-auto">
        {rows.map((r, i) => {
          const rankNumber = i + 1;
          const pct = r?.percent ?? (r && currentSlide?.total ? Math.round((r.count / currentSlide.total) * 100) : 0);

          return (
            <div
              key={i}
              className="relative p-2 rounded-lg bg-secondary/30 border border-border/40 overflow-hidden"
            >
              {r ? (
                <>
                  {/* Progress bar background */}
                  <div
                    className="absolute inset-0 bg-primary/5 dark:bg-primary/10 transition-all duration-500 pointer-events-none"
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />

                  <div className="relative z-10 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-secondary font-mono text-[10px] font-bold text-muted-foreground shrink-0">
                        #{rankNumber}
                      </span>
                      <span
                        className="inline-block h-2 w-2 rounded-full shrink-0"
                        style={{ background: r.color ?? '#0284c7' }}
                      />
                      <span className="truncate font-medium text-foreground text-[11px]" title={r.category}>
                        {r.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="text-[10px] text-muted-foreground">{pct}%</span>
                      <span className="font-bold text-foreground px-1.5 py-0.5 rounded bg-background border border-border/60 text-xs">
                        {r.count}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="h-6 flex items-center justify-center text-[11px] text-muted-foreground/50">
                  — Sem ocorrências adicionais —
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* (4) FOOTER INDICATOR DOTS */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Transição automática</span>
        <div className="flex items-center gap-1" role="tablist">
          {ready &&
            slides.map((s, i) => (
              <button
                key={s.descricao + i}
                role="tab"
                aria-selected={i === idx}
                aria-label={`Ir para ${s.descricao}`}
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === idx ? 'w-5 bg-sky-500' : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
