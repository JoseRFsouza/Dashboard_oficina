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
    <div className="w-full h-[700px]">
      <h3 className="text-lg font-semibold mb-2">
        TAT Médio Mensal — Últimos 6 Meses
      </h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <XAxis
            dataKey="mes"
            tick={{ fontSize: 14, fontWeight: "bold", fill: labelColor }}
          />
          <YAxis
            tick={{ fontSize: 14, fontWeight: "bold", fill: labelColor }}
          />
          <Tooltip
            cursor={{
              fill:
                theme === "dark"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(0,0,0,0.05)",
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

          <Bar dataKey="tat" fill="#0ea5e9" name="TAT Médio (dias)">
            <LabelList
              dataKey="tat"
              position="top"
              formatter={(value: number) => (value === 0 ? "" : value)}
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
  );
}