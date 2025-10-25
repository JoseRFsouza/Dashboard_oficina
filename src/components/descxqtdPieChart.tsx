'use client';

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
  LabelList,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";
import { getISOWeek } from "date-fns";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"; 
import { colorFor } from "@/lib/color.util"; 
import type { TooltipProps } from 'recharts';


interface PieData {
  name: string;
  value: number;
}




// Nome padronizado a partir do entry (payload do Recharts)

function formatSliceNameFromEntry(entry: { payload?: PieData; name?: string }) {
  return String(entry?.payload?.name ?? entry?.name ?? '');
}


// saneamento de valores

const saneNumber = (v: unknown): number =>  Number.isFinite(Number(v)) ? Number(v) : 0;


const CustomTooltip: React.FC<TooltipProps<number, string>> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  const name  = formatSliceNameFromEntry(entry);
  const value = saneNumber(entry.value);

  return (
    <div className="rounded-md border bg-popover px-2 py-1 text-xs text-popover-foreground shadow">
      <div className="flex items-center gap-2">
        <span
          className="inline-block h-2 w-2 rounded-full"
          style={{ background: entry?.color || entry?.payload?.fill || '#bbb' }}
        />
        <span className="font-medium">{name}</span>
        <span className="opacity-70">— {value}</span>
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
        try {
          const res = await fetch("/api/simulador", { cache: "no-store" });
          const { dataSimulada } = await res.json();
          const dataRef = dataSimulada ? new Date(dataSimulada) : new Date();

          const { dados, semanaEncontrada, anoEncontrado } =
            filtrarSemanaSimulada(registros, dataRef);

          const entradasData = dados.map((item) => ({
            name: item.descricao,
            value: item.entradas,
          }));
          const saidasData = dados.map((item) => ({
            name: item.descricao,
            value: item.saidas,
          }));

          setEntradas(entradasData);
          setSaidas(saidasData);
          setSemana(semanaEncontrada);
          setAno(anoEncontrado);
        } catch (err) {
          console.error("Erro ao buscar data simulada:", err);
        }
      }
    }
    carregarDados();
  }, [registros]);

  let titulo = "Repair Shop Items In and Items Out";
  if (semana && ano) {
    const semanaAtual = getISOWeek(new Date());
    if (semana === semanaAtual) {
      titulo += ` — Week ${semana} of ${ano} (Last week with data)`;
    }
  } else {
    titulo += " — Sem dados anteriores";
  }

  const temEntradas = entradas.some((e) => e.value > 0);
  const temSaidas = saidas.some((s) => s.value > 0);

  // 🔑 gera mapa de cores global (entradas + saídas)
  const descricoesUnicas = Array.from(
  new Set([...entradas, ...saidas].map(d => d.name.trim().toLowerCase()))
);

const colorMap: Record<string, string> = {};
descricoesUnicas.forEach((desc) => {
  colorMap[desc] = colorFor(desc);
});

  
const renderDonut = (
  data: PieData[],
  titulo: string,
  colorMap: Record<string, string>
) => {
  const dataFiltrada = (data || [])
    .map((d) => ({
      ...d,
      value: saneNumber(d.value),
      name: typeof d.name === 'string' ? d.name.trim() : '',
    }))
    .filter((d) => d.value > 0 && d.name);

  const total = dataFiltrada.reduce((acc, curr) => acc + curr.value, 0);


    return (
      <div className="flex flex-col items-center">
        <ResponsiveContainer width="100%" height={250}>
          <ChartContainer config={{}} className="min-h-[250px] w-full overflow-visible">
            <PieChart>
              <ChartTooltip cursor={false} content={<CustomTooltip />} />
              <Pie
                data={dataFiltrada}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                strokeWidth={5}
                minAngle={4}
                paddingAngle={1}
                labelLine={true}
              >
                {dataFiltrada.map((d, i) => (
                  <Cell key={i} fill={colorMap[d.name.trim().toLowerCase()]} />
                ))}
                <LabelList
                  dataKey="name"
                  position="outside"
                  style={{
                    fill: 'currentColor',
                    fontSize: 12,
                    fontWeight: 500,
                    paintOrder: 'stroke',
                    stroke: 'rgba(0,0,0,0.15)',
                    strokeWidth: 1,
                  }}
                />
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="fill-foreground text-3xl font-bold"
                        >
                          {total}
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
            </PieChart>
          </ChartContainer>
        </ResponsiveContainer>

        <span className="mt-2 text-sm text-muted-foreground font-medium">
          {titulo}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full justify-evenly">
      <h3 className="text-lg font-semibold mb-2">{titulo}</h3>
      <div className={`flex-1 w-full flex ${temEntradas && temSaidas ? "flex-row" : "justify-evenly"}`}>
        {temEntradas && temSaidas ? (
          <>
            <div className="w-1/2">{renderDonut(entradas, "Entradas", colorMap)}</div>
            <div className="w-1/2">{renderDonut(saidas, "Saídas", colorMap)}</div>
          </>
        ) : (
          <div className="w-2/3">
            {renderDonut(temEntradas ? entradas : saidas, temEntradas ? "Entradas" : "Saídas", colorMap)}
          </div>
        )}
      </div>
    </div>
  );
}