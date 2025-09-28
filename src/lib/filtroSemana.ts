import { getISOWeek, getISOWeekYear } from "date-fns";

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

export function filtrarSemanaSimulada(registros: any[], dataRef: Date) {
  const semanaAtual = getISOWeek(dataRef);
  const anoAtual = getISOWeekYear(dataRef);

  // 1. Filtrar registros pela semana/ano da data simulada
  const filtrados = registros.filter((reg, idx) => {
    const data = parseData(reg["R.S. In"]);
    if (!data) return false;

    const semana = getISOWeek(data);
    const ano = getISOWeekYear(data);
    const passou = semana === semanaAtual && ano === anoAtual;

    if (passou) {
      console.log("Chaves disponíveis no registro:", Object.keys(reg));
      console.log("Registro bruto:", reg);
    }

    return passou;
  });

  // 2. Agrupar por descrição e contar quantos existem
  const agrupados = filtrados.reduce((acc, reg) => {
  const desc = reg["Descrição"] || reg["Descri��o"] || "N/A";
  acc[desc] = (acc[desc] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

  // 3. Transformar em array para o gráfico
  return Object.entries(agrupados).map(([descricao, quantidade]) => ({
    descricao,
    quantidade
  }));
}
