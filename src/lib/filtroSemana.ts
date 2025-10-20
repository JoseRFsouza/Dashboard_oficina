import { getISOWeek, getISOWeekYear, subWeeks } from "date-fns";
import { gerarMapaDescricao } from "@/lib/mapaDescricao";
import { parseData } from "@/lib/filtroHistoricoSegVoo";

interface RegistroGenerico {
  [key: string]: string | undefined;
}

// Função auxiliar para normalizar a descrição
function normalizarDescricao(reg: RegistroGenerico): string {
  const keys = Object.keys(reg);

  const key = keys.find((k) =>
    k.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes("descricao")
  );

  if (key) {
    return String(reg[key] ?? "").trim();
  }
  return "";
}

export function filtrarSemanaSimulada(registros: RegistroGenerico[], dataRef: Date) {
  let tentativa = 0;
  let dados: { descricao: string; entradas: number; saidas: number; cor: string }[] = [];
  let semanaEncontrada: number | null = null;
  let anoEncontrado: number | null = null;

  const limiteInferior = new Date("2018-01-01");
  const mapaDescricoes = gerarMapaDescricao(registros);

  while (tentativa < 52 && dataRef >= limiteInferior && dados.length === 0) {
    const semanaAtual = getISOWeek(dataRef);
    const anoAtual = getISOWeekYear(dataRef);

    const agrupados: Record<string, { entradas: number; saidas: number }> = {};

    registros.forEach((reg) => {
      const descRaw = normalizarDescricao(reg);
      const desc = descRaw !== "" ? descRaw : "Sem descrição";

      const dataIn = parseData(reg["R.S. In"] ?? "");
      if (dataIn && getISOWeek(dataIn) === semanaAtual && getISOWeekYear(dataIn) === anoAtual) {
        if (!agrupados[desc]) agrupados[desc] = { entradas: 0, saidas: 0 };
        agrupados[desc].entradas++;
      }

      const dataOut = parseData(reg["R.S. Out"] ?? "");
      if (dataOut && getISOWeek(dataOut) === semanaAtual && getISOWeekYear(dataOut) === anoAtual) {
        if (!agrupados[desc]) agrupados[desc] = { entradas: 0, saidas: 0 };
        agrupados[desc].saidas++;
      }
    });

    dados = Object.entries(agrupados).map(([descricao, valores]) => ({
      descricao,
      entradas: valores.entradas,
      saidas: valores.saidas,
      cor: mapaDescricoes[descricao] ?? "#999",
    }));

    if (dados.length > 0) {
      semanaEncontrada = semanaAtual;
      anoEncontrado = anoAtual;
      break;
    }

    dataRef = subWeeks(dataRef, 1);
    tentativa++;
  }

  return { dados, semanaEncontrada, anoEncontrado };
}