// src/lib/color.util.ts
const PALETTE = [
  '#0ea5e9', '#f97316', '#22c55e', '#a855f7', '#ef4444',
  '#14b8a6', '#eab308', '#64748b', '#db2777', '#4ade80',
];

function hashLabel(s: string) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33) ^ s.charCodeAt(i);
  return h >>> 0;
}

export function colorFor(label: string, palette = PALETTE) {
  const idx = hashLabel(label) % palette.length;
  return palette[idx];
}
