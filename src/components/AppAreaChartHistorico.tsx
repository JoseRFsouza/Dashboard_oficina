'use client';

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { calcularSegvooMensalTotal } from "@/lib/filtroHistoricoSegVoo";
import {
  calcularMediaMensal,
  calcularVariacaoPercentual,
  gerarLegendaComVariação,
} from "@/lib/estatisticaSegVoo";
import { obterDataSimulada } from "@/lib/simuladorClient";
import { ShieldCheck, TrendingUp, TrendingDown, Award } from "lucide-react";

interface DadosMensais {
  mes: string;
  atual: number;
  anterior: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number;
    name?: string;
    dataKey?: string;
    color?: string;
  }>;
  label?: string;
}

const CustomAreaTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="font-semibold text-foreground mb-1.5 pb-1 border-b border-border/60">
        {label}
      </div>
      <div className="space-y-1">
        {payload.map((p, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: p.dataKey === "atual" ? "#0284c7" : "#94a3b8" }}
              />
              {p.name}:
            </span>
            <span className="font-mono font-bold text-foreground">
              {p.value ?? 0} cert.
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function AppAreaChartHistorico() {
  const { registros } = useCSV();
  const [dados, setDados] = useState<DadosMensais[]>([]);
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [picoHistorico, setPicoHistorico] = useState<number>(0);
  const [variacao, setVariacao] = useState<number | null>(null);

  useEffect(() => {
    async function buscarDataSimulada() {
      try {
        const novaData = await obterDataSimulada();
        setDataRef(novaData);
      } catch (err) {
        console.warn("Aviso ao buscar data simulada:", err);
        setDataRef(new Date());
      }
    }
    buscarDataSimulada();

    const handleDataChange = () => buscarDataSimulada();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, []);

  useEffect(() => {
    if (registros.length > 0) {
      try {
        const { dados: dadosCalculados, picoHistorico: pico } =
          calcularSegvooMensalTotal(registros as any, dataRef);

        const { mediaAtual, mediaAnterior } = calcularMediaMensal(dadosCalculados);
        const varPercent = calcularVariacaoPercentual(mediaAtual, mediaAnterior);

        setDados(dadosCalculados);
        setPicoHistorico(pico);
        setVariacao(varPercent);
      } catch (err) {
        console.error("Erro ao calcular histórico SegVoo:", err);
      }
    }
  }, [registros, dataRef]);

  const anoAtual = dataRef.getFullYear();
  const anoAnterior = anoAtual - 1;
  const legendaAtual = gerarLegendaComVariação(String(anoAtual), variacao);

  const totalCertificados12M = dados.reduce((acc, curr) => acc + (curr.atual || 0), 0);

  return (
    <div className="flex flex-col h-full w-full justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Certificados de Liberação (SegVoo)
            </h3>
            <p className="text-[11px] text-muted-foreground">Últimos 12 meses vs período anterior</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {variacao !== null && (
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full border ${
                variacao >= 0
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
              }`}
            >
              {variacao >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {variacao > 0 ? `+${variacao}%` : `${variacao}%`} YoY
            </span>
          )}

          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold rounded-full bg-secondary text-secondary-foreground border border-border/60">
            Total 12M: <strong className="font-mono text-foreground">{totalCertificados12M}</strong>
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[260px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 20, right: 15, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="colorAtualSleek" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(150,150,150,0.15)" />

            <XAxis
              dataKey="mes"
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            />
            <YAxis
              orientation="left"
              tickFormatter={(value) => Number(value).toLocaleString("pt-BR")}
              tickLine={false}
              axisLine={{ stroke: "rgba(150,150,150,0.2)" }}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              allowDecimals={false}
              domain={[
                0,
                (dataMax: number) => Math.ceil(Math.max(dataMax, picoHistorico) * 1.15),
              ]}
            />
            <Tooltip content={<CustomAreaTooltip />} />

            {/* Linha do pico histórico */}
            {picoHistorico > 0 && Number.isFinite(picoHistorico) && (
              <ReferenceLine
                y={picoHistorico}
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                label={{
                  value: `Recorde (${picoHistorico})`,
                  position: "insideTopRight",
                  fill: "#10b981",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="anterior"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              strokeWidth={2}
              fillOpacity={0}
              name={String(anoAnterior)}
            />
            <Area
              type="monotone"
              dataKey="atual"
              stroke="#0284c7"
              strokeWidth={2.5}
              fill="url(#colorAtualSleek)"
              name={legendaAtual}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-sky-600" /> {anoAtual} (Ciclo Atual)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-slate-400" /> {anoAnterior} (Ciclo Anterior)
          </span>
        </div>
        {picoHistorico > 0 && (
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <Award className="w-3.5 h-3.5" /> Pico histórico: {picoHistorico} liberações
          </span>
        )}
      </div>
    </div>
  );
}
