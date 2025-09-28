'use client';

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";

export default function DescXQtdBarChart() {
  const registros = useCSV(); // já memoizado
  const [dados, setDados] = useState<any[]>([]);
  
useEffect(() => {
  async function carregarDados() {
    console.log("Registros recebidos:", registros.length);
    

    if (registros.length > 0) {
      try {
        // 1. Buscar a data simulada da API
        const res = await fetch("/api/simulador", { cache: "no-store" });
        const { dataSimulada } = await res.json();

        // 2. Converter para Date (se existir)
        const dataRef = dataSimulada ? new Date(dataSimulada) : new Date();
        

        // 3. Filtrar usando a data simulada
        const filtrados = filtrarSemanaSimulada(registros, dataRef);
        console.log("Filtrados:", filtrados);

        // 4. Atualizar estado só se mudou
        setDados(prev => {
          const jsonPrev = JSON.stringify(prev);
          const jsonNew = JSON.stringify(filtrados);
          return jsonPrev === jsonNew ? prev : filtrados;
        });
      } catch (err) {
        console.error("Erro ao buscar data simulada:", err);
      }
    }
  }

  carregarDados();
}, [registros]);



  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <XAxis dataKey="descricao" />
          <YAxis />
          <Tooltip
           cursor={{ fill: "rgba(0,0,0,0.05)" }}
           content={({ active, payload }) => {
           if (active && payload && payload.length) {
           const item = payload[0].payload;
           return (
             <div className="bg-white border border-gray-300 rounded p-2 shadow text-sm text-black">
             <p><strong>Descrição:</strong> {item.descricao}</p>
             <p><strong>Quantidade:</strong> {item.quantidade}</p>
             </div>
           );
           }
             return null;
          }}
          />
          <Bar dataKey="quantidade" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
