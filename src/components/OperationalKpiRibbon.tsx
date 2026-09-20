'use client';

import { useEffect, useState } from "react";
import { useCSV } from "@/lib/useCSV";
import { obterDataSimulada } from "@/lib/simuladorClient";
import { calcularTatMensal } from "@/lib/tatMensal";
import { getWeek, getYear } from "date-fns";
import { Calendar, Layers, Clock, ShieldCheck } from "lucide-react";

export default function OperationalKpiRibbon() {
  const { registros } = useCSV();
  const [semana, setSemana] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(null);
  const [tatMedio, setTatMedio] = useState<number>(0);
  const [totalLiberados, setTotalLiberados] = useState<number>(0);

  useEffect(() => {
    async function calcular() {
      try {
        const data = await obterDataSimulada();
        setSemana(getWeek(data));
        setAno(getYear(data));

        if (registros.length > 0) {
          const meses = calcularTatMensal(registros, data);
          const validos = meses.filter((m) => m.tat > 0);
          if (validos.length > 0) {
            const media = Math.round(
              validos.reduce((acc, curr) => acc + curr.tat, 0) / validos.length
            );
            setTatMedio(media);
          }

          // Total liberados (registros com SegVoo preenchido)
          const liberados = registros.filter((r) => Boolean(r.SegVoo || r["Seg Voo"])).length;
          setTotalLiberados(liberados > 0 ? liberados : registros.length);
        }
      } catch (err) {
        console.warn("Aviso no KPI Ribbon:", err);
      }
    }
    calcular();

    const handleDataChange = () => calcular();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, [registros]);

  const dentroSla = tatMedio > 0 && tatMedio <= 30;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* KPI 1 */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Ciclo Atual
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              Semana {semana ? String(semana).padStart(2, "0") : "--"}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              /{ano ?? "2026"}
            </span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* KPI 2 */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Volume em Oficina
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              {registros.length}
            </span>
            <span className="text-xs text-muted-foreground">componentes</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      {/* KPI 3 */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              TAT Médio
            </p>
            {tatMedio > 0 && (
              <span
                className={`inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                  dentroSla
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                }`}
              >
                {dentroSla ? "No Alvo" : "Atenção"}
              </span>
            )}
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              {tatMedio > 0 ? `${tatMedio} dias` : "--"}
            </span>
            <span className="text-xs text-muted-foreground">meta ≤30d</span>
          </div>
        </div>
        <div
          className={`p-2.5 rounded-lg ${
            dentroSla
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
          }`}
        >
          <Clock className="w-4 h-4" />
        </div>
      </div>

      {/* KPI 4 */}
      <div className="rounded-xl border border-border/70 bg-card p-3.5 shadow-xs flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
            Liberações SegVoo
          </p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-bold tracking-tight text-foreground font-mono">
              {totalLiberados}
            </span>
            <span className="text-xs text-muted-foreground">certificações</span>
          </div>
        </div>
        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
