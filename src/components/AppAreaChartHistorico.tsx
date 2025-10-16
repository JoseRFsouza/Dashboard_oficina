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
  ReferenceLine,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { useTheme } from "next-themes";
import { calcularSegvooMensalTotal } from "@/lib/filtroHistoricoSegVoo";
import {
  calcularMediaMensal,
  calcularVariacaoPercentual,
  gerarLegendaComVariação,
} from "@/lib/estatisticaSegVoo";

// ✅ Interface para os dados mensais

interface DadoMensal {
  mes: string;
  ano?: string | number;
  atual: number | null;
  anterior: number | null;
}


// ✅ Tipo para o retorno da função calcularSegvooMensalTotal
type ResultadoSegVoo =
  | DadoMensal[]
  | {
      dados: DadoMensal[];
      picoHistorico: number;
    };

export default function AppAreaChartHistorico() {
  const { registros } = useCSV();
  const [dataRef, setDataRef] = useState<Date>(new Date());
  const [dados, setDados] = useState<DadoMensal[]>([]);
  const [picoHistorico, setPicoHistorico] = useState<number>(0);
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
    const resultado: ResultadoSegVoo = calcularSegvooMensalTotal(registros, dataRef);

    if (Array.isArray(resultado)) {
      setDados(resultado);
      const maxVal = Math.max(
        ...resultado.map((r: DadoMensal) => Math.max(r.atual ?? 0, r.anterior ?? 0))
      );
      setPicoHistorico(maxVal);
    } else if (resultado && Array.isArray(resultado.dados)) {
      setDados(resultado.dados);
      setPicoHistorico(resultado.picoHistorico ?? 0);
    } else {
      setDados([]);
      setPicoHistorico(0);
    }
  }, [registros, dataRef]);

  const labelColor = theme === "dark" ? "#fff" : "#000";

  const { mediaAtual, mediaAnterior } = calcularMediaMensal(dados);
  const variacao = calcularVariacaoPercentual(mediaAtual, mediaAnterior);

  const anoAtual = dados.find((r) => r.atual !== null)?.ano ?? "Atual";
  const anoAnterior = dados.find((r) => r.anterior !== null)?.ano ?? "Anterior";

  const legendaAtual = gerarLegendaComVariação(String(anoAtual), variacao);

  return (
    <div className="w-full h-auto">
      <h3 className="text-lg font-semibold mb-2">
        Return to service Certificates issued - last 12 months
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
              tick={{ fontSize: 14, fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
            />
            <YAxis
              orientation="left"
              tickFormatter={(value) => Number(value).toLocaleString("pt-BR")}
              tick={{ fontSize: 14, fill: labelColor }}
              axisLine={{ stroke: labelColor, strokeWidth: 2 }}
              tickLine={{ stroke: labelColor, strokeWidth: 1 }}
              allowDecimals={false}
              domain={[
                0,
                (dataMax: number) => Math.ceil(Math.max(dataMax, picoHistorico) * 1.1)
              ]}
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
            <Legend />

            {/* 🔑 Linha do pico histórico */}
            {picoHistorico > 0 && Number.isFinite(picoHistorico) && (
              <ReferenceLine
                y={picoHistorico}
                stroke="green"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: `All the time releases count (${picoHistorico})`,
                  position: "top",
                  offset: 8,
                  fill: "lightgreen",
                  fontSize: 12,
                  fontWeight: "bold",
                }}
              />
            )}

            <Area
              type="monotone"
              dataKey="anterior"
              stroke="#9ca3af"
              strokeDasharray="4 4"
              strokeWidth={3}
              fillOpacity={0}
              name={String(anoAnterior)}
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
  );
}