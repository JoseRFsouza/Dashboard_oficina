type RegistroMensal = {
  atual: number | null;
  anterior: number | null;
};

/**
 * Calcula a média mensal de registros para os períodos atual e anterior.
 * Assume que o array contém 12 meses para cada período.
 */
export function calcularMediaMensal(dados: RegistroMensal[]) {
  const mediaAtual = Math.round(
    dados.reduce((acc, d) => acc + (d.atual || 0), 0) / 12
  );

  const mediaAnterior = Math.round(
    dados.reduce((acc, d) => acc + (d.anterior || 0), 0) / 12
  );

  return { mediaAtual, mediaAnterior };
}

/**
 * Calcula a variação percentual entre duas médias.
 * Retorna null se a média anterior for zero (evita divisão por zero).
 */
export function calcularVariacaoPercentual(mediaAtual: number, mediaAnterior: number): number | null {
  if (mediaAnterior === 0) return null;

  const variacao = ((mediaAtual - mediaAnterior) / mediaAnterior) * 100;
  return Math.round(variacao);
}

/* Gera uma legenda com seta e porcentagem de variação (retorna string para evitar JSX em .ts). */
export function gerarLegendaComVariação(ano: string, variacao: number | null): string {
  if (variacao === null) return ano;

  const positivo = variacao > 0;
  const emoji = positivo ? "🟢▲" : "🔻▼";

  return `${ano} ${emoji}${Math.abs(variacao)}% em relação ao ano anterior`;
}