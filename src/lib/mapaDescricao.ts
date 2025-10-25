const coresBase = [
  "#0ea5e9", // azul
  "#f97316", // laranja
  "#22c55e", // verde
  "#a855f7", // roxo
  "#ef4444", // vermelho
  "#14b8a6", // teal
  "#eab308", // amarelo
  "#64748b", // cinza
  "#db2777", // rosa
  "#4ade80", // verde claro
];

interface RegistroDescricao {
  [key: string]: string | undefined;
}

export function gerarMapaDescricao(registros: RegistroDescricao[]): Record<string, string> {
  const descricoesSet = new Set<string>();

  registros.forEach((reg) => {
    const raw = reg["Descrição"] || reg["Descri��o"];
    const descricao = raw?.trim().toLowerCase(); // normaliza
    if (descricao) {
      descricoesSet.add(descricao); // ignora vazios e duplicados
    }
  });

  const descricoesOrdenadas = Array.from(descricoesSet).sort((a, b) =>
    a.localeCompare(b)
  );

  const mapa: Record<string, string> = {};
  descricoesOrdenadas.forEach((desc, i) => {
    mapa[desc] = coresBase[i % coresBase.length]; // até 10 cores únicas
  });

  return mapa;
}
