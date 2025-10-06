'use client';

import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Label,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";
import { useTheme } from "next-themes";
import { getISOWeek } from "date-fns";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"; 
// ajuste o import conforme onde você declarou esses wrappers

export default function DescXQtdPieChart() {
  const registros = useCSV();
  const [entradas, setEntradas] = useState<any[]>([]);
  const [saidas, setSaidas] = useState<any[]>([]);
  const [semana, setSemana] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(null);
  const { theme } = useTheme();

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

  let titulo = "Movimentação Itens na Oficina";
  if (semana && ano) {
    const semanaAtual = getISOWeek(new Date());
    if (semana === semanaAtual) {
      titulo += ` — Semana ${semana} de ${ano} (última semana com dados)`;
    }
  } else {
    titulo += " — Sem dados anteriores";
  }

  const temEntradas = entradas.some((e) => e.value > 0);
  const temSaidas = saidas.some((s) => s.value > 0);

  const cores = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#14b8a6"];

 const renderDonut = (data: any[], titulo: string) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={250}>
        <ChartContainer config={{}} className="min-h-[250px] w-full">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={cores[i % cores.length]} />
              ))}
              {/* Label central: só o número */}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
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
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </ResponsiveContainer>
      {/* Texto fora do donut */}
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
            <div className="w-1/2">{renderDonut(entradas, "Entradas")}</div>
            <div className="w-1/2">{renderDonut(saidas, "Saídas")}</div>
          </>
        ) : (
          <div className="w-2/3">{renderDonut(temEntradas ? entradas : saidas, temEntradas ? "Entradas" : "Saídas")}</div>
        )}
      </div>
    </div>
  );
}
