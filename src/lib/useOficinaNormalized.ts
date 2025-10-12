// src/lib/useOficinaNormalized.ts
'use client';

import { useMemo } from 'react';
import { useCSV } from '@/lib/useCSV';
import { normalizeDataset, type NormalizeOptions, type Row } from './oficina-normalize';

export function useOficinaNormalized(options?: NormalizeOptions) {
  const rows = useCSV(); // vindo do localStorage via seu uploader
  return useMemo<Row[]>(() => {
    return normalizeDataset(rows, {
      applySpellfix: true,
      applyCategory: true,
      applyMonthYear: true,
      ...options,
    });
  }, [rows, options]);
}