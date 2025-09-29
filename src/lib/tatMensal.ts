import { subMonths, format } from "date-fns";

function parseData(raw: string): Date | null {
  if (!raw) return null;
  const partes = raw.split("-");
  if (partes.length < 3) return null;

  const [dia, mesAbrev, ano] = partes;
  const meses: Record<string, string> = {
    jan: "01", fev: "02", feb: "02", mar: "03", abr: "04", apr: "04",
    mai: "05", may: "05", jun: "06", jul: "07",
    ago: "08", aug: "08", set: "09", sep: "09", out: "10", oct: "10",
    nov: "11", dez: "12", dec: "12"
  };

  const mes = meses[mesAbrev.toLowerCase()];
  if (!mes) return null;

  const anoFull = ano.length === 2 ? "20" + ano : ano;
  const data = new Date(`${anoFull}-${mes}-${dia}`);
  return isNaN(data.getTime()) ? null : data;
}


import { enUS} from "date-fns/locale"; // escolha o idioma

export function calcularTatMensal(registros: any[], dataRef: Date) {
  // mês anterior à semana de referência
  let mesBase = subMonths(dataRef, 1);

  // últimos 6 meses
  const meses: Date[] = [];
  for (let i = 5; i >= 0; i--) {
    meses.push(subMonths(mesBase, i));
  }

  // agrupar TAT por mês
  const agrupados: Record<string, number[]> = {};

  registros.forEach((reg) => {
    const dataIn = parseData(reg["R.S. In"]);
    const dataOut = parseData(reg["RETURN TO AZUL"]);

    if (dataIn && dataOut) {
      const tatDias =
        (dataOut.getTime() - dataIn.getTime()) / (1000 * 60 * 60 * 24);

      // 🔑 use sempre o mesmo formato
      const chave = format(dataOut, "MMM/yy", { locale: enUS }); 
      if (!agrupados[chave]) agrupados[chave] = [];
      agrupados[chave].push(tatDias);
    }
  });

  // calcular médias
  return meses.map((m) => {
    const chave = format(m, "MMM/yy", { locale: enUS }); // mesmo formato aqui
    const valores = agrupados[chave] || [];
    const media =
      valores.length > 0
        ? valores.reduce((a, b) => a + b, 0) / valores.length
        : 0;
    return { mes: chave, tat: Number(media.toFixed(1)) };
  });
}
