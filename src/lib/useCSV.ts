import { useMemo } from "react";

export function useCSV() {
  // sempre chama o hook
  const raw = typeof window !== "undefined" ? localStorage.getItem("csvData") : null;

  return useMemo(() => {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Record<string, string>[];
    } catch {
      return [];
    }
  }, [raw]);
}
