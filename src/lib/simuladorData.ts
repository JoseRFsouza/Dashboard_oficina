import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "simulador.json");

export function setDataSimulada(date: string) {
  const data = { dataSimulada: date };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export function getDataSimulada(): Date {
  if (!fs.existsSync(filePath)) return new Date();
  const raw = fs.readFileSync(filePath, "utf-8");
  const { dataSimulada } = JSON.parse(raw);
  return dataSimulada ? new Date(dataSimulada) : new Date();
}

export function getDataAtual(): Date {
  return getDataSimulada() ?? new Date();
}
