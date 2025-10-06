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
import { calcularSegvooMensalTotal } from "@/lib/filtroHistoricoSegVoo"; // ✅ agora importa a função nova

export default function AppAreaChartHistorico() {
  const registros = useCSV();
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [dados, setDados] = useState<any[]>([]);
  const { theme } = useTheme();

  // busca a data simulada
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

  // recalcula os dados sempre que registros ou dataRef mudarem
  useEffect(() => {
    if (registros.length > 0 && dataRef) {
      const resultado = calcularSegvooMensalTotal(registros, dataRef);
      setDados(resultado);
    }
  }, [registros, dataRef]);

  const labelColor = theme === "dark" ? "#fff" : "#000";

  return (
    <div className="w-full h-[400px]">
      <h3 className="text-lg font-semibold mb-2">
        Histórico de SEGVOO — Últimos 12 Meses
      </h3>
      <div className="w-full h-[460px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ bottom: 10 }}>
            <defs>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#facc15" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#92400e" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
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
            
            <Area
              type="monotone"
              dataKey="total"
              stroke="#0ea5e9"
              fill="url(#colorTotal)"   // ✅ aplica o degradê
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
