/*'use client';

import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCSV } from "@/lib/useCSV";
import { filtrarSemanaSimulada } from "@/lib/filtroSemana";

export default function DescXQtdBarChart() {
  const registros = useCSV();
  const [dados, setDados] = useState<any[]>([]);
  const ultimoSalvo = useRef<string>("");

 useEffect(() => {
  if (registros.length > 0) {
    const filtrados = filtrarSemanaSimulada(registros, new Date());
    const jsonString = JSON.stringify(filtrados);

    if (jsonString !== ultimoSalvo.current) {
      ultimoSalvo.current = jsonString;

      fetch("/api/salvar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: jsonString,
      }).then(() => {
        fetch("/data/ItemsWeekQtdy.json", { cache: "no-store" })
          .then((res) => res.json())
          .then((json) => setDados(json));
      });
    } else {
      setDados(filtrados);
    }
  }
}, []);
useEffect(() => {
  if (registros.length > 0) {
    const filtrados = filtrarSemanaSimulada(registros, new Date());
    setDados(filtrados);
  }
}, [registros]);

  return (
    <div className="w-full h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados}>
          <XAxis dataKey="descricao" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="quantidade" fill="#0ea5e9" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
*/