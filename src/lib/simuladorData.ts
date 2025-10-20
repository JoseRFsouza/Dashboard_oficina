import { cookies } from "next/headers";

export function getDataAtual(): Date {
  const cookieStore = cookies() as any;
  const valor = cookieStore.get("dataSimulada")?.value;
  return valor ? new Date(valor) : new Date();
}