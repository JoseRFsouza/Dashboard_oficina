'use client';

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  Tooltip,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";
import { colorFor } from "@/lib/color.util"; 
import { obterDataSimulada } from "@/lib/simuladorClient"; 
import { ArrowDownRight, ArrowUpRight, ArrowDownUp } from "lucide-react";

interface PieData {
  name: string;
  value: number;
}

const saneNumber = (v: unknown): number => (Number.isFinite(Number(v)) ? Number(v) : 0);

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    color?: string;
    payload?: {
      name?: string;
      value?: number;
      fill?: string;
    };
  }>;
  total?: number;
}

const CustomPieTooltip = ({ active, payload, total = 0 }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name = String(entry.payload?.name || entry.name || '');
  const value = saneNumber(entry.value);
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  const color = entry.payload?.fill || entry.color || '#0284c7';

  return (
    <div className="rounded-lg border border-border/80 bg-popover/95 backdrop-blur-md px-3 py-2 text-xs text-popover-foreground shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <span className="font-semibold text-foreground">{name}</span>
      </div>
      <div className="mt-1 flex items-center justify-between gap-4 text-muted-foreground">
        <span>Qtd: <strong className="text-foreground font-mono">{value}</strong></span>
        <span>Participação: <strong className="text-foreground font-mono">{percent}%</strong></span>
      </div>
    </div>
  );
};

export default function DescXQtdPieChart() {
  const { registros } = useCSV();

  const [entradas, setEntradas] = useState<PieData[]>([]);
  const [saidas, setSaidas] = useState<PieData[]>([]);
  const [semana, setSemana] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(null);

  useEffect(() => {
    async function carregarDados() {
      if (registros.length > 0) {
        let dataRef = new Date();
        try {
          dataRef = await obterDataSimulada();
        } catch (err) {
          console.warn("Aviso ao obter data simulada no gráfico de pizza:", err);
        }

        try {
          const { dados, semanaEncontrada, anoEncontrado } =
            filtrarSemanaSimulada(registros, dataRef);

          const entradasData = (dados || []).map((item) => ({
            name: item.descricao,
            value: item.entradas,
          }));
          const saidasData = (dados || []).map((item) => ({
            name: item.descricao,
            value: item.saidas,
          }));

          setEntradas(entradasData);
          setSaidas(saidasData);
          setSemana(semanaEncontrada);
          setAno(anoEncontrado);
        } catch (err) {
          console.error("Erro ao processar gráfico de itens:", err);
        }
      }
    }
    carregarDados();

    const handleDataChange = () => carregarDados();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, [registros]);

  // Mapa de cores estável
  const descricoesUnicas = Array.from(
    new Set([...entradas, ...saidas].map((d) => d.name.trim().toLowerCase()))
  );

  const colorMap: Record<string, string> = {};
  descricoesUnicas.forEach((desc) => {
    colorMap[desc] = colorFor(desc);
  });

  const totalEntradas = entradas.reduce((acc, curr) => acc + saneNumber(curr.value), 0);
  const totalSaidas = saidas.reduce((acc, curr) => acc + saneNumber(curr.value), 0);
  const totalSemana = totalEntradas + totalSaidas;

  const renderDonutColumn = (
    data: PieData[],
    tipo: "Entradas" | "Saídas",
    total: number
  ) => {
    const dataFiltrada = (data || [])
      .map((d) => ({
        ...d,
        value: saneNumber(d.value),
        name: typeof d.name === 'string' ? d.name.trim() : '',
      }))
      .filter((d) => d.value > 0 && d.name);

    const isIn = tipo === "Entradas";

    return (
      <div className="flex-1 flex flex-col items-center min-w-0">
        {/* Subheader */}
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className={`p-1 rounded-md ${
              isIn
                ? "bg-sky-500/10 text-sky-600 dark:text-sky-400"
                : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            {isIn ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {tipo}
          </span>
          <span className="font-mono text-xs font-bold text-foreground px-1.5 py-0.5 rounded bg-secondary">
            {total}
          </span>
        </div>

        {/* Chart */}
        <div className="relative w-full h-[155px]">
          {dataFiltrada.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<CustomPieTooltip total={total} />} />
                <Pie
                  data={dataFiltrada}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={46}
                  outerRadius={66}
                  strokeWidth={2}
                  stroke="var(--card)"
                  minAngle={4}
                  paddingAngle={2}
                >
                  {dataFiltrada.map((d, i) => (
                    <Cell
                      key={`slice-${i}`}
                      fill={colorMap[d.name.trim().toLowerCase()] || "#0ea5e9"}
                    />
                  ))}
                  <Label
                    content={({ viewBox }) => {
                      if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                        return (
                          <text
                            x={viewBox.cx}
                            y={viewBox.cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                          >
                            <tspan
                              x={viewBox.cx}
                              dy="-4"
                              className="fill-foreground font-mono text-xl font-bold"
                            >
                              {total}
                            </tspan>
                            <tspan
                              x={viewBox.cx}
                              dy="16"
                              className="fill-muted-foreground text-[10px] font-medium"
                            >
                              UNID.
                            </tspan>
                          </text>
                        );
                      }
                      return null;
                    }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Sem dados nesta semana
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="w-full mt-2 space-y-1 max-h-[85px] overflow-y-auto pr-1">
          {dataFiltrada.slice(0, 3).map((item, idx) => {
            const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
            const color = colorMap[item.name.trim().toLowerCase()] || "#0ea5e9";
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-[11px] gap-1.5"
                title={item.name}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span className="truncate text-foreground font-medium">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-mono text-muted-foreground">
                  <span className="font-semibold text-foreground">{item.value}</span>
                  <span className="text-[10px]">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full w-full justify-between p-1">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400">
            <ArrowDownUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">
              Fluxo Semanal da Oficina
            </h3>
            <p className="text-[11px] text-muted-foreground">
              {semana && ano ? `Semana ${semana} de ${ano} (Última com dados)` : "Aguardando dados"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-secondary text-secondary-foreground border border-border/60">
            Total: {totalSemana} un
          </span>
        </div>
      </div>

      {/* Main Charts Body */}
      <div className="flex items-start justify-between gap-4 my-auto py-2">
        {renderDonutColumn(entradas, "Entradas", totalEntradas)}
        <div className="w-[1px] h-36 bg-border/60 self-center hidden sm:block" />
        {renderDonutColumn(saidas, "Saídas", totalSaidas)}
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Equilíbrio Operacional</span>
        <span className="font-mono font-medium text-foreground">
          {totalEntradas >= totalSaidas ? "Entradas predominantes" : "Saídas predominantes"}
        </span>
      </div>
    </div>
  );
}
