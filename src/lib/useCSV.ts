import { useState, useEffect } from "react";
import { gerarDadosExemplo } from "./sampleData";

export function useCSV() {
  const [registros, setRegistros] = useState<Record<string, string>[]>([]);
  const [isSampleData, setIsSampleData] = useState<boolean>(false);

  // Carrega do localStorage na primeira vez ou inicializa dados de exemplo
  useEffect(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("csvData");
      const isExplicitReset = localStorage.getItem("csvExplicitReset") === "true";

      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setRegistros(parsed);
            setIsSampleData(localStorage.getItem("csvIsSample") === "true");
            return;
          }
        } catch {
          // fall through
        }
      }

      if (!isExplicitReset) {
        // Inicializa com dados de demonstração da Oficina IFE
        const demo = gerarDadosExemplo();
        setRegistros(demo);
        setIsSampleData(true);
        try {
          localStorage.setItem("csvData", JSON.stringify(demo));
          localStorage.setItem("csvIsSample", "true");
        } catch {
          // localStorage pode falhar em cotas estritas
        }
      } else {
        setRegistros([]);
        setIsSampleData(false);
      }
    }
  }, []);

  // 🔑 Função para resetar globalmente
  const resetCSV = () => {
    setRegistros([]);
    setIsSampleData(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("csvData", "[]");
      localStorage.setItem("csvExplicitReset", "true");
      localStorage.removeItem("csvIsSample");
      localStorage.removeItem("csvHeaders");
      localStorage.removeItem("csvSelectedColumns");
    }
  };

  // 🔑 Função para recarregar dados de demonstração
  const loadSampleData = () => {
    const demo = gerarDadosExemplo();
    setRegistros(demo);
    setIsSampleData(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("csvData", JSON.stringify(demo));
      localStorage.setItem("csvIsSample", "true");
      localStorage.removeItem("csvExplicitReset");
    }
  };

  // 🔑 Função para atualizar (quando fizer upload novo)
  const updateCSV = (rows: Record<string, string>[]) => {
    setRegistros(rows);
    setIsSampleData(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("csvData", JSON.stringify(rows));
      localStorage.removeItem("csvIsSample");
      localStorage.removeItem("csvExplicitReset");
    }
  };

  return { registros, resetCSV, updateCSV, loadSampleData, isSampleData };
}
