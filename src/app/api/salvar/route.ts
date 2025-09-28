import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const filePath = path.join(process.cwd(), "public/data/ItemsWeekQtdy.json");

    // grava o JSON no disco
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");

    console.log("💾 JSON sobrescrito em:", filePath);

    return NextResponse.json({ ok: true, saved: body.length });
  } catch (err) {
    console.error("Erro ao salvar JSON:", err);
    return NextResponse.json({ ok: false, error: "Falha ao salvar JSON" }, { status: 500 });
  }
}
