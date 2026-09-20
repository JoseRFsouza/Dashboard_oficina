// src/lib/sampleData.ts
// Conjunto de dados de demonstração realista para a Oficina IFE (In-Flight Entertainment)

export interface RepairRecord {
  [key: string]: string;
}

const DESCRICOES = [
  "MONITOR SMARTVIEW 12IN",
  "SEAT POWER BOX 110V",
  "HANDSET PASSENGER UNIT",
  "IFE SERVER CORE MK3",
  "CABIN AUDIO JACK UNIT",
  "WIFI ANTENNA CONTROLLER",
];

const REASONS: Record<string, string[]> = {
  "MONITOR SMARTVIEW 12IN": [
    "BLACK SCREEN",
    "INOPERATIVE / NOT WORKING",
    "LIVE TV INOP",
    "SOFTWARE / BOOT",
    "BLUE SCREEN",
  ],
  "SEAT POWER BOX 110V": [
    "POWER SUPPLY",
    "INOPERATIVE / NOT WORKING",
    "DAMAGED / BER",
    "ETHERNET / COMMUNICATIONS",
  ],
  "HANDSET PASSENGER UNIT": [
    "AUDIO / JACK",
    "INOPERATIVE / NOT WORKING",
    "DAMAGED / BER",
    "OTHER",
  ],
  "IFE SERVER CORE MK3": [
    "SOFTWARE / BOOT",
    "ETHERNET / COMMUNICATIONS",
    "SMART CARD / REGISTRATION",
    "INOPERATIVE / NOT WORKING",
  ],
  "CABIN AUDIO JACK UNIT": [
    "AUDIO / JACK",
    "DAMAGED / BER",
    "INOPERATIVE / NOT WORKING",
  ],
  "WIFI ANTENNA CONTROLLER": [
    "ETHERNET / COMMUNICATIONS",
    "SOFTWARE / BOOT",
    "INOPERATIVE / NOT WORKING",
  ],
};

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function gerarDadosExemplo(): RepairRecord[] {
  const records: RepairRecord[] = [];
  let id = 1000;

  // Gerar dados para 2024, 2025 e 2026
  const anos = [
    { ano: 24, meses: [6, 7, 8, 9, 10, 11] },
    { ano: 25, meses: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] },
    { ano: 26, meses: [0, 1, 2, 3, 4, 5, 6, 7, 8] },
  ];

  anos.forEach(({ ano, meses }) => {
    meses.forEach((mesIdx) => {
      const mesAbrev = MESES[mesIdx];
      // Criar entre 10 a 22 registros por mês
      const qtdRegistros = 12 + ((mesIdx * 3 + ano * 2) % 11);

      for (let i = 0; i < qtdRegistros; i++) {
        id++;
        const desc = DESCRICOES[i % DESCRICOES.length];
        const reasonsList = REASONS[desc] || ["INOPERATIVE / NOT WORKING"];
        const reason = reasonsList[(i + mesIdx) % reasonsList.length];

        const diaIn = 1 + ((i * 3 + 2) % 25);
        // TAT entre 14 e 37 dias
        const tatDias = 15 + ((i * 7 + mesIdx * 2) % 22);

        let diaOut = diaIn + tatDias;
        let mesOutIdx = mesIdx;
        let anoOut = ano;

        if (diaOut > 28) {
          diaOut = (diaOut % 28) + 1;
          mesOutIdx++;
          if (mesOutIdx > 11) {
            mesOutIdx = 0;
            anoOut++;
          }
        }

        const mesOutAbrev = MESES[mesOutIdx];
        const dataIn = `${pad2(diaIn)}-${mesAbrev}-${ano}`;
        const dataOut = `${pad2(diaOut)}-${mesOutAbrev}-${anoOut}`;
        const segVoo = dataOut;

        records.push({
          "OS": `WO-${id}`,
          "Descricao": desc,
          "R.S. In": dataIn,
          "R.S. Out": dataOut,
          "RETURN TO AZUL": dataOut,
          "SegVoo": segVoo,
          "Reason for removal": reason,
          "Reason_spellfix": reason,
          "MONTH": mesOutAbrev.toUpperCase(),
          "YEAR": `20${anoOut}`,
        });
      }
    });
  });

  return records;
}
