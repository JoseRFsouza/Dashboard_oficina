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

export function calcularSegvooMensalTotal(registros: any[], dataRef: Date) {
  const inicio = subMonths(dataRef, 12);
  const inicioAnterior = subMonths(dataRef, 24);
  const fimAnterior = subMonths(dataRef, 12);

  const meses: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const m = subMonths(dataRef, i);
    meses.push(format(m, "MMM", { locale: enUS }));
  }

  const atual: Record<string, number> = {};
  const anterior: Record<string, number> = {};

  let picoHistorico = 0;

  registros.forEach((reg) => {
    
    const dataSegvoo = parseData(reg["SegVoo"]);
    if (!dataSegvoo) return;

    const mes = format(dataSegvoo, "MMM", { locale: enUS });

    if (dataSegvoo >= inicio && dataSegvoo <= dataRef) {
      atual[mes] = (atual[mes] || 0) + 1;
    }

    if (dataSegvoo >= inicioAnterior && dataSegvoo <= fimAnterior) {
      anterior[mes] = (anterior[mes] || 0) + 1;
    }
     picoHistorico++;
  });

  const dados = meses.map((mes) => ({
    mes,
    atual: atual[mes] || 0,
    anterior: anterior[mes] || 0,
  }));

  // devolve também o pico histórico
  return { dados, picoHistorico: Math.max(...dados.map(d => Math.max(d.atual, d.anterior))) };
}
export { parseData };