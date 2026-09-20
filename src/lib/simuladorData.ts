import { cookies } from "next/headers";

export async function getDataAtual(): Promise<Date> {
  const cookieStore = await cookies();
  const valor = cookieStore.get("dataSimulada")?.value;
  return valor ? new Date(valor) : new Date();
}