import { subMonths, format } from "date-fns";
import { enUS } from "date-fns/locale";


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

export function calcularSegvooMensalPorDescricao(registros: any[], dataRef: Date) {
  const inicio = subMonths(dataRef, 12);
  const meses: Date[] = [];
  for (let i = 11; i >= 0; i--) {
    meses.push(subMonths(dataRef, i));
  }
  console.log (registros);
  
  const agrupados: Record<string, Record<string, number>> = {};

  registros.forEach((reg) => {
    const dataSegvoo = parseData(reg["SegVoo"]);
    const descricao = (reg["Descrição"] || reg["Descri��o"] || "N/A").trim();

    if (dataSegvoo && dataSegvoo >= inicio && dataSegvoo <= dataRef) {
      const chave = format(dataSegvoo, "MMM/yy", { locale: enUS });
      if (!agrupados[chave]) agrupados[chave] = {};
      if (!agrupados[chave][descricao]) agrupados[chave][descricao] = 0;
      agrupados[chave][descricao]++;
    }
  });

  return meses.map((m) => {
    const chave = format(m, "MMM/yy", { locale: enUS });
    const descricoes = agrupados[chave] || {};
    return { mes: chave, ...descricoes };
  });
}
