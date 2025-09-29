'use client';

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LabelList,
} from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";
import { useTheme } from "next-themes";
import { getISOWeek } from "date-fns";

export default function DescXQtdBarChart() {
  const registros = useCSV();
  const [dados, setDados] = useState<any[]>([]);
  const [descricoes, setDescricoes] = useState<string[]>([]);
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

          const transformados: any[] = [{ tipo: "Entradas" }, { tipo: "Saídas" }];
          dados.forEach((item) => {
            transformados[0][item.descricao] = item.entradas;
            transformados[1][item.descricao] = item.saidas;
          });

          setDados(transformados);
          setDescricoes(dados.map((f) => f.descricao));
          setSemana(semanaEncontrada);
          setAno(anoEncontrado);
        } catch (err) {
          console.error("Erro ao buscar data simulada:", err);
        }
      }
    }
    carregarDados();
  }, [registros]);

  const cores = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#14b8a6"];
  const labelColor = theme === "dark" ? "#fff" : "#000";

  // === título dinâmico ===
  let titulo = "Movimentação Itens na Oficina";
  if (semana && ano) {
    const semanaAtual = getISOWeek(new Date());
    if (semana === semanaAtual) {
      titulo += ` — Semana ${semana} de ${ano} (última semana com dados)`;
        } else {
      titulo += '';
    }
  } else {
    titulo += " — Sem dados anteriores";
  }

  return (
    <div className="flex flex-col h-full justify-evenly">
      {/* título */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">{titulo}</h3>
      </div>

      <div className="flex-1 w-full h-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados}>
            <XAxis
              dataKey="tipo"
              tick={{ fontSize: 20, fontWeight: "bold", fill: theme === "dark" ? "#fff" : "#000" }}
            />
            <YAxis
              tick={{ fontSize: 20, fontWeight: "bold", fill: theme === "dark" ? "#fff" : "#000" }}
            />
            <Tooltip
              cursor={{
                fill:
                  theme === "dark"
                    ? "rgba(255,255,255,0.1)"
                    : "rgba(0,0,0,0.05)",
              }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div
                      className={`rounded p-2 shadow text-sm ${
                        theme === "dark"
                          ? "bg-gray-800 text-white border border-gray-700"
                          : "bg-white text-black border border-gray-300"
                      }`}
                    >
                      <p className="font-semibold">{label}</p>
                      {payload.map((entry, i) => (
                        <p key={i}>
                          <span
                            className="inline-block w-3 h-3 mr-2 rounded"
                            style={{ backgroundColor: entry.color }}
                          />
                          {entry.name}: <strong>{entry.value}</strong>
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {descricoes.map((desc, i) => (
              <Bar key={desc} dataKey={desc} fill={cores[i % cores.length]} name={desc}>
                <LabelList
                  dataKey={desc}
                  position="top"
                  formatter={(value: number) => (value === 0 ? "" : value)}
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    fill: labelColor,
                    textShadow: "0 0 4px rgba(0,0,0,0.6)",
                  }}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}