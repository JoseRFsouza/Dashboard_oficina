import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const data = cookieStore.get("dataSimulada")?.value;

    let validDate = new Date();
    if (data) {
      const parsed = new Date(data);
      if (!isNaN(parsed.getTime())) {
        validDate = parsed;
      }
    }

    return NextResponse.json(
      {
        dataSimulada: validDate.toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json(
      {
        dataSimulada: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const valor = body?.dataSimulada || new Date().toISOString().split("T")[0];

    const res = NextResponse.json({ ok: true, dataSimulada: valor });

    // grava cookie válido por 7 dias
    res.cookies.set("dataSimulada", valor, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch {
    return NextResponse.json({ ok: false, error: "Falha ao salvar data" }, { status: 400 });
  }
}
