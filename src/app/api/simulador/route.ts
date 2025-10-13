import { NextResponse } from "next/server";
import { setDataSimulada, getDataSimulada } from "@/lib/simuladorData";

export async function GET() {
  const data = getDataSimulada();
  return NextResponse.json({ dataSimulada: data });
}

export async function POST(req: Request) {
  const { dataSimulada } = await req.json();

  if (!dataSimulada) {
    // se não passar nada, volta para a data atual
    setDataSimulada(new Date().toISOString().split("T")[0]);
    return NextResponse.json({ ok: true, dataSimulada: new Date() });
  }

  setDataSimulada(dataSimulada);
  return NextResponse.json({ ok: true, dataSimulada });
}
