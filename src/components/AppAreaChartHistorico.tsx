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
import { calcularSegvooMensalTotal } from "@/lib/filtroHistoricoSegVoo";
import { calcularMediaMensal, calcularVariacaoPercentual, gerarLegendaComVariação } from "@/lib/estatisticaSegVoo";


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
    const resultado = calcularSegvooMensalTotal(registros, dataRef);
    setDados(resultado);
  }, [registros, dataRef]);

  const labelColor = theme === "dark" ? "#fff" : "#000";

  const { mediaAtual, mediaAnterior } = calcularMediaMensal(dados);
  const variacao = calcularVariacaoPercentual(mediaAtual, mediaAnterior);

  const anoAtual = dados.find((r) => r.atual !== null)?.ano ?? "Atual";
  const anoAnterior = dados.find((r) => r.anterior !== null)?.ano ?? "Anterior";

  const legendaAtual = gerarLegendaComVariação(anoAtual, variacao);

  return (
    <div className="w-full h-auto">
      <h3 className="text-lg font-semibold mb-2">
        Histórico de SEGVOO — Últimos 12 Meses
      </h3>

      <div className="w-full h-[450px]">
        <ResponsiveContainer width="100%" height={450}>
          <AreaChart data={dados} margin={{ left: 0, right: 20, bottom: 10 }}>
            <defs>
              <linearGradient id="colorAtual" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#facc15" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#92400e" stopOpacity={0.2} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="mes"
              interval={0}
              tick={{ fontSize: 14, fill: labelColor}}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}   
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
            />
            <YAxis
              orientation="left"
              tick={{ fontSize: 14, fill: labelColor}}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}   
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
            <Legend />

            <Area
              type="monotone"
              dataKey="anterior"
              stroke="#9ca3af"
              strokeDasharray="4 4"
              strokeWidth={3}
              fillOpacity={0}
              name={anoAnterior}
            />
            <Area
              type="monotone"
              dataKey="atual"
              stroke="#facc15"
              strokeWidth={2}
              fill="url(#colorAtual)"
              name={legendaAtual}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    
    </div>
  );}