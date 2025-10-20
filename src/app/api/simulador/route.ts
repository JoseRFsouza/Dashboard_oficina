import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import type { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";

export async function GET() {
  const cookieStore = cookies() as unknown as ReadonlyRequestCookies;
  const data = cookieStore.get("dataSimulada")?.value;

  return NextResponse.json({
    dataSimulada: data ? new Date(data) : new Date(),
  });
}

export async function POST(req: Request) {
  const { dataSimulada } = await req.json();

  const valor = dataSimulada || new Date().toISOString().split("T")[0];

  const res = NextResponse.json({ ok: true, dataSimulada: valor });

  // grava cookie válido por 7 dias
  res.cookies.set("dataSimulada", valor, {
    path: "/",
    httpOnly: false, // se quiser ler no client também
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
