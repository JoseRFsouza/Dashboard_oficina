'use client';

import { useEffect, useState } from "react";
import { getWeek, getYear } from "date-fns";

export default function WeekNum() {
  const [semana, setSemana] = useState<number | null>(null);
  const [ano, setAno] = useState<number | null>(null);

  useEffect(() => {
    async function buscarData() {
      const res = await fetch("/api/simulador", { cache: "no-store" });
      const { dataSimulada } = await res.json();
      const data = new Date(dataSimulada);
      setSemana(getWeek(data));
      setAno(getYear(data));
    }
    buscarData();
  }, []);

  return (
    <div className="flex flex-col h-full w-full justify-evenly p-4">
      <div className="flex items-center justify-center">
        <h1 className="text-lg font-medium mb-6">Week and Year</h1>
      </div>
      <div className="flex flex-col items-center flex-grow">
        <div className="text-9xl font-extrabold loading-none text-primary">
          {semana ?? "--"}
        </div>
        <div className="text-6xl text lg-muted-foreground mt-2 tracking-wide">
          {ano ?? "--"}
        </div>
      </div>
    </div>
  );
}
