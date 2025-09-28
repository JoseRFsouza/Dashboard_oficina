import { getISOWeek, getISOWeekYear, subWeeks } from "date-fns";

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
  let tentativa = 0;
  let dados: { descricao: string; entradas: number; saidas: number }[] = [];
  let semanaEncontrada: number | null = null;
  let anoEncontrado: number | null = null;

  // limite inferior: não voltar antes de 2018
  const limiteInferior = new Date("2018-01-01");

  while (tentativa < 52 && dataRef >= limiteInferior && dados.length === 0) {
    const semanaAtual = getISOWeek(dataRef);
    const anoAtual = getISOWeekYear(dataRef);

    const agrupados: Record<string, { entradas: number; saidas: number }> = {};

    registros.forEach((reg) => {
      const desc = reg["Descrição"] || reg["Descri��o"] || "N/A";

      // Entrada
      const dataIn = parseData(reg["R.S. In"]);
      if (dataIn) {
        if (getISOWeek(dataIn) === semanaAtual && getISOWeekYear(dataIn) === anoAtual) {
          if (!agrupados[desc]) agrupados[desc] = { entradas: 0, saidas: 0 };
          agrupados[desc].entradas++;
        }
      }

      // Saída
      const dataOut = parseData(reg["R.S. Out"]);
      if (dataOut) {
        if (getISOWeek(dataOut) === semanaAtual && getISOWeekYear(dataOut) === anoAtual) {
          if (!agrupados[desc]) agrupados[desc] = { entradas: 0, saidas: 0 };
          agrupados[desc].saidas++;
        }
      }
    });

    dados = Object.entries(agrupados).map(([descricao, valores]) => ({
      descricao,
      entradas: valores.entradas,
      saidas: valores.saidas,
    }));

    if (dados.length > 0) {
      semanaEncontrada = semanaAtual;
      anoEncontrado = anoAtual;
      break;
    }

    // não achou nada → volta 1 semana
    dataRef = subWeeks(dataRef, 1);
    tentativa++;
  }

  return { dados, semanaEncontrada, anoEncontrado };
}