'use client';

import { useEffect, useState } from "react";
import { getWeek, getYear, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { obterDataSimulada } from "@/lib/simuladorClient";
import { CalendarDays } from "lucide-react";

export default function WeekNum() {
  const [semana, setSemana] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(null);
  const [dataRef, setDataRef] = useState<Date | null>(null);

  useEffect(() => {
    async function buscarData() {
      try {
        const data = await obterDataSimulada();
        setDataRef(data);
        setSemana(getWeek(data));
        setAno(getYear(data));
      } catch (err) {
        console.warn("Erro ao processar semana:", err);
        const agora = new Date();
        setDataRef(agora);
        setSemana(getWeek(agora));
        setAno(getYear(agora));
      }
    }
    buscarData();

    const handleDataChange = () => buscarData();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, []);

  // Determinar trimestre
  const trimestre = dataRef ? Math.floor(dataRef.getMonth() / 3) + 1 : 3;

  return (
    <div className="flex flex-col h-full w-full justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Ciclo Operacional
            </h3>
            <p className="text-[11px] text-muted-foreground">Semana e ano de referência</p>
          </div>
        </div>
        <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-secondary text-secondary-foreground border border-border/60">
          Q{trimestre} {ano ?? 2026}
        </span>
      </div>

      {/* Main Metric */}
      <div className="flex flex-col items-center justify-center my-auto py-4">
        <span className="text-[11px] uppercase tracking-widest font-semibold text-muted-foreground mb-1">
          Semana do Ano
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-6xl font-black tracking-tight text-foreground font-mono">
            {semana ? String(semana).padStart(2, "0") : "--"}
          </span>
          <span className="text-xl font-bold text-sky-600 dark:text-sky-400 font-mono">
            / 52
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground font-mono">{ano ?? "----"}</span>
          <span>•</span>
          <span>Ano Operacional</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-medium text-foreground">Oficina Ativa</span>
        </div>
        {dataRef && (
          <span className="font-mono text-muted-foreground">
            {format(dataRef, "dd/MM/yyyy", { locale: ptBR })}
          </span>
        )}
      </div>
    </div>
  );
}

