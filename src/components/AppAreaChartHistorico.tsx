'use client';

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { useTheme } from "next-themes";
import { calcularSegvooMensalPorDescricao } from "@/lib/filtroHistoricoSegVoo";

export default function AppAreaChartHistorico() {
  const registros = useCSV();
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [dados, setDados] = useState<any[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    async function buscarDataSimulada() {
      try {
        const res = await fetch("/api/simulador", { cache: "no-store" });
        const { dataSimulada } = await res.json();
        const novaData = dataSimulada ? new Date(dataSimulada) : new Date();
        setDataRef(novaData);
      } catch (err) {
        console.error("Erro ao buscar data simulada:", err);
      }
    }
    buscarDataSimulada();
  }, []);

  useEffect(() => {
    if (registros.length > 0 && dataRef) {
      const resultado = calcularSegvooMensalPorDescricao(registros, dataRef);

      // consolida todas as descrições em um único total
      const consolidados = resultado.map((linha) => {
        let soma = 0;
        Object.keys(linha).forEach((key) => {
          if (key !== "mes") soma += linha[key];
        });
        return { mes: linha.mes, total: soma };
      });

      setDados(consolidados);
    }
  }, [registros, dataRef]);

  const labelColor = theme === "dark" ? "#fff" : "#000";

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-2">
        Histórico de SEGVOO — Últimos 12 Meses
      </h3>
      <div className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados}>
            <XAxis
              dataKey="mes"
              interval={0}
              tick={{ fontSize: 14, fontWeight: "bold", fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
              angle={-30}
              textAnchor="end"
            />
            <YAxis
              tick={{ fontSize: 14, fontWeight: "bold", fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
            />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              fill="#0ea5e9"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
