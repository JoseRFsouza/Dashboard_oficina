'use client';

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  ReferenceLine,
  Cell,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { useTheme } from "next-themes";
import { calcularTatMensal } from "@/lib/tatMensal";

interface TatMensal {
  mes: string;
  tat: number;
}

export default function TatMensalChart() {
  const { registros } = useCSV();
  const [dados, setDados] = useState<TatMensal[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    async function carregarDados() {
      if (registros.length > 0) {
        try {
          const res = await fetch("/api/simulador", { cache: "no-store" });
          const { dataSimulada } = await res.json();
          const dataRef = dataSimulada ? new Date(dataSimulada) : new Date();

          const resultado = calcularTatMensal(registros, dataRef);
          setDados(resultado);
        } catch (err) {
          console.error("Erro ao calcular TAT mensal:", err);
        }
      }
    }
    carregarDados();
  }, [registros]);

  const labelColor = theme === "dark" ? "#fff" : "#000";

  return (
    <div className="w-full h-[460px]">
      <h3 className="text-lg font-semibold mb-2">
        Montly TurnArroundTime — Last 6 months (in days)
      </h3>
      <div className="items-justified-center w-full h-full">
        <ResponsiveContainer width="100%" height={430}>
          <BarChart data={dados} margin={{ bottom: 10 }}>
            <XAxis
              dataKey="mes"
              interval={0}
              minTickGap={0}
              tick={{ fontSize: 14, fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
              angle={0}
              textAnchor="end"
            />
            <YAxis
              domain={[    0,
               (dataMax: number) => Math.ceil(Math.max(dataMax * 1.1, 33))]}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
              tick={(props) => {
                const { x, y, payload } = props;
                const isHighlight = payload.value === 30;
                return (
                  <text
                    x={x}
                    y={y}
                    dy={4}
                    textAnchor="end"
                    fill={isHighlight ? "red" : labelColor}
                    fontWeight={isHighlight ? "bold" : "normal"}
                    fontSize={14}
                  >
                    {payload.value}
                  </text>
                );
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                color: theme === "dark" ? "#ffffff" : "#111827",
              }}
              labelStyle={{
                color: theme === "dark" ? "#ffffff" : "#111827",
              }}
            />

            <ReferenceLine
              y={30}
              stroke="red"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: "",
                position: "top",
                fill: "orange",
                fontSize: 12,
                fontWeight: "bold",
              }}
            />

            <Bar dataKey="tat" name="TAT (days)">
              {dados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.tat > 30 ? "#ef4444" : "#0ea5e9"}
                />
              ))}
              <LabelList
                dataKey="tat"
                position="top"
                formatter={(value: number) =>
                  value === 0 ? "" : `${Math.round(value)} days`
                }
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  fill: labelColor,
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}