import { getISOWeek, getISOWeekYear, subWeeks } from "date-fns";
import { gerarMapaDescricao } from "@/lib/mapaDescricao";
import { parseData } from "@/lib/filtroHistoricoSegVoo";

// Função auxiliar para normalizar a descrição
function normalizarDescricao(reg: any): string {
  const keys = Object.keys(reg);

  // procura por qualquer chave que contenha "descr" (sem acento, case-insensitive)
  const key = keys.find((k) =>
    k.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // remove acentos
      .includes("descricao")
  );

  if (key) {
    return String(reg[key] ?? "").trim();
  }
  return "";
}

export function filtrarSemanaSimulada(registros: any[], dataRef: Date) {
  let tentativa = 0;
  let dados: { descricao: string; entradas: number; saidas: number; cor: string }[] = [];
  let semanaEncontrada: number | null = null;
  let anoEncontrado: number | null = null;

  // limite inferior: não voltar antes de 2018
  const limiteInferior = new Date("2018-01-01");

  // gera o mapa de descrições → cores
  const mapaDescricoes = gerarMapaDescricao(registros);

  while (tentativa < 52 && dataRef >= limiteInferior && dados.length === 0) {
    const semanaAtual = getISOWeek(dataRef);
    const anoAtual = getISOWeekYear(dataRef);

    const agrupados: Record<string, { entradas: number; saidas: number }> = {};

    registros.forEach((reg) => {
      const descRaw = normalizarDescricao(reg);
      const desc = descRaw !== "" ? descRaw : "Sem descrição";

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
      cor: mapaDescricoes[descricao] ?? "#999", // pega cor do mapa ou fallback
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