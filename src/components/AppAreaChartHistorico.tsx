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
import { gerarMapaDescricao } from "@/lib/mapaDescricao";

export default function AppAreaChartHistorico() {
  const registros = useCSV();
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [dados, setDados] = useState<any[]>([]);
  const [descricoes, setDescricoes] = useState<string[]>([]);
  const { theme } = useTheme();
  const mapaCores = gerarMapaDescricao(registros);

  // Busca a data simulada uma única vez
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

  // Recalcula os dados sempre que registros ou dataRef mudarem
  useEffect(() => {
    if (registros.length > 0 && dataRef) {
      const resultado = calcularSegvooMensalPorDescricao(registros, dataRef);
      setDados(resultado);

      const todasDescricoes = new Set<string>();
      resultado.forEach((linha) => {
        Object.keys(linha).forEach((key) => {
          if (key !== "mes") todasDescricoes.add(key);
        });
      });
      setDescricoes(Array.from(todasDescricoes));
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
          <AreaChart data={dados} stackOffset="none">
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
            {descricoes.map((desc) => (
              <Area
                key={desc}
                type="linear"
                dataKey={desc}
                stackId="1"
                stroke={mapaCores[desc]}
                fill={mapaCores[desc]}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}