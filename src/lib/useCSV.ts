import {useState, useEffect } from "react";

export function useCSV() {
  const [registros, setRegistros] = useState<Record<string, string>[]>([]);

  // Carrega do localStorage na primeira vez
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("csvData");
      if (raw) {
        try {
          setRegistros(JSON.parse(raw));
        } catch {
          setRegistros([]);
        }
      }
    }
  }, []);

  // 🔑 Função para resetar globalmente
  const resetCSV = () => {
    setRegistros([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("csvData");
      localStorage.removeItem("csvHeaders");
      localStorage.removeItem("csvSelectedColumns");
    }
  };

  // 🔑 Função para atualizar (quando fizer upload novo)
  const updateCSV = (rows: Record<string, string>[]) => {
    setRegistros(rows);
    if (typeof window !== "undefined") {
      localStorage.setItem("csvData", JSON.stringify(rows));
    }
  };

  return { registros, resetCSV, updateCSV };
}
