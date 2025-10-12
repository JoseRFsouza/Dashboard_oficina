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

export default function TatMensalChart() {
  const registros = useCSV();
  const [dados, setDados] = useState<any[]>([]);
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
        TAT Médio Mensal — Últimos 6 Meses
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
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              domain={[0, 35]}
              tick={{ fontSize: 14, fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}   // linha do eixo Y
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
            />
            <Tooltip
              contentStyle={{
              backgroundColor: theme === "dark" ? "#1f2937" : "#f9fafb", // fundo escuro ou claro
              border: "1px solid #d1d5db", // borda cinza
              borderRadius: "6px",
              color: theme === "dark" ? "#ffffff" : "#111827", // cor do texto
              
            }}
            labelStyle={{
              color: theme === "dark" ? "#ffffff" : "#111827",
              
            }}
            />

            {/* Linha vermelha no Y=30 (limite contratual) */}
            <ReferenceLine
              y={30}
              stroke="red"
              strokeWidth={2}
              strokeDasharray="4 4"
              label={{
                value: "Limite Contratual (30 dias)",
                position: "right",
                fill: "red",
                fontSize: 12,
                fontWeight: "bold",
              }}
            />

            <Bar dataKey="tat" name="TAT Médio (dias)">
              {dados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.tat > 30 ? "#ef4444" : "#0ea5e9"} // vermelho se >30
                />
              ))}
              <LabelList
                dataKey="tat"
                position="top"
                formatter={(value: number) =>
                  value === 0 ? "" : `${Math.round(value)} dias`
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