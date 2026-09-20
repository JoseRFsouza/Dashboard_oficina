'use client';

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { calcularTatMensal } from "@/lib/tatMensal";
import { obterDataSimulada } from "@/lib/simuladorClient";
import { Timer, CheckCircle2, AlertTriangle } from "lucide-react";

interface TatMensal {
  mes: string;
  tat: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    payload?: TatMensal;
  }>;
  label?: string;
}

const CustomTatTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const val = Math.round(Number(payload[0].value || 0));
  const isOk = val <= 30;

  return (
    <div className="rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="font-semibold text-foreground">{label}</div>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="text-muted-foreground">TAT Médio:</span>
        <span className="font-mono font-bold text-foreground">{val} dias</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 pt-1 border-t border-border/60">
        {isOk ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              Dentro da meta (≤ 30d)
            </span>
          </>
        ) : (
          <>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
            <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400">
              Acima da meta (&gt; 30d)
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default function TatMensalChart() {
  const { registros } = useCSV();
  const [dados, setDados] = useState<TatMensal[]>([]);

  useEffect(() => {
    async function carregarDados() {
      if (registros.length > 0) {
        let dataRef = new Date();
        try {
          dataRef = await obterDataSimulada();
        } catch (err) {
          console.warn("Aviso ao obter data simulada no TAT:", err);
        }

        try {
          const resultado = calcularTatMensal(registros, dataRef);
          setDados(resultado);
        } catch (err) {
          console.error("Erro ao calcular TAT mensal:", err);
        }
      }
    }
    carregarDados();

    const handleDataChange = () => carregarDados();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, [registros]);

  const validos = dados.filter((d) => d.tat > 0);
  const mediaTat = validos.length > 0
    ? Math.round(validos.reduce((acc, curr) => acc + curr.tat, 0) / validos.length)
    : 0;

  const mesesDentroMeta = validos.filter((d) => d.tat <= 30).length;

  return (
    <div className="flex flex-col h-full w-full justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Turn Around Time (TAT) — Últimos 6 Meses
            </h3>
            <p className="text-[11px] text-muted-foreground">Tempo médio de reparo em dias</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Meta: ≤ 30 dias
          </span>
          {mediaTat > 0 && (
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-secondary text-secondary-foreground border border-border/60">
              Média: <strong className="font-mono text-foreground">{mediaTat}d</strong>
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />
            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax * 1.15, 36))]}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
            />
            <Tooltip content={<CustomTatTooltip />} />

            {/* Linha de Meta 30 dias */}
            <ReferenceLine
              y={30}
              stroke="#f43f5e"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              label={{
                value: "Meta SLA (30d)",
                position: "insideTopRight",
                fill: "#f43f5e",
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            <Bar dataKey="tat" name="TAT (dias)" radius={[6, 6, 0, 0]}>
              {dados.map((entry, index) => {
                const isOverSLA = entry.tat > 30;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isOverSLA ? "#f43f5e" : "#0284c7"}
                  />
                );
              })}
              <LabelList
                dataKey="tat"
                position="top"
                formatter={(value: number) => (value > 0 ? `${Math.round(value)}d` : "")}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  fill: "var(--foreground)",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-600" /> Dentro do SLA (≤ 30d)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500" /> Acima do SLA (&gt; 30d)
          </span>
        </div>
        <span className="font-medium text-foreground">
          {mesesDentroMeta} de {validos.length} meses em conformidade
        </span>
      </div>
    </div>
  );
}
