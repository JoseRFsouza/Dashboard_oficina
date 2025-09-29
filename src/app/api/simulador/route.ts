
// src/app/api/simulador/route.ts
import { NextResponse } from "next/server";
import { getDataSimulada } from "@/lib/simuladorData";

export async function GET() {
  const data = getDataSimulada();
  return NextResponse.json({ dataSimulada: data.toISOString() });
}