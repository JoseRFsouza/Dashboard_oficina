// src/lib/oficina-normalize.ts
export type ReasonCategory =
  | 'BLACK SCREEN'
  | 'INOPERATIVE / NOT WORKING'
  | 'LIVE TV INOP'
  | 'SMART CARD / REGISTRATION'
  | 'SOFTWARE / BOOT'
  | 'ETHERNET / COMMUNICATIONS'
  | 'POWER SUPPLY'
  | 'NFF / TEST OK'
  | 'DAMAGED / BER'
  | 'AUDIO / JACK'
  | 'BLUE SCREEN'
  | 'OTHER'
  | 'UNSPECIFIED';

export type Row = Record<string, any>;

export interface NormalizeOptions {
  descriptionKeys?: string[];   // default: ['Descricao','Descrição','Descri��o']
  reasonKeys?: string[];        // default: ['Reason_spellfix','Reason_normalized_v2','Reason for removal',...]
  monthKeys?: string[];         // default: ['MONTH','Month0','Month1','MONTH.SEGVOO']
  yearKeys?: string[];          // default: ['YEAR','Year0','Year1','YEAR.SEGVOO']
  applySpellfix?: boolean;      // default: true
  applyCategory?: boolean;      // default: true
  applyMonthYear?: boolean;     // default: true
}

const DEFAULT_OPTIONS: Required<NormalizeOptions> = {
  descriptionKeys: ['Descricao', 'Descrição', 'Descri��o'],
  reasonKeys: [
    'Reason_spellfix',
    'Reason_normalized_v2',
    'Reason for removal',
    'Reason for Removal',
    'reason for removal',
  ],
  monthKeys: ['MONTH', 'Month0', 'Month1', 'MONTH.SEGVOO'],
  yearKeys: ['YEAR', 'Year0', 'Year1', 'YEAR.SEGVOO'],
  applySpellfix: true,
  applyCategory: true,
  applyMonthYear: true,
};

export function stripAccents(s = '') {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function pickFirst(obj: Row, keys: string[]): string {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'string' && v.trim()) return v.trim();
  }
  return '';
}

export function spellfixBlackScreen(raw: string): string {
  if (!raw) return '';
  let t = stripAccents(raw.trim().toLowerCase());
  t = t
    .replace(/\bblak\b/g, 'black')
    .replace(/\bbleck\b/g, 'black')
    .replace(/\bblackk\b/g, 'black')
    .replace(/\bback\b/g, 'black')
    .replace(/\bscr+en\b/g, 'screen')
    .replace(/\bscren\b/g, 'screen')
    .replace(/\bscrren\b/g, 'screen')
    .replace(/\bscreeen\b/g, 'screen')
    .replace(/\bsceen\b/g, 'screen')
    .replace(/\bsc?ren\b/g, 'screen')
    .replace(/\bsc?reen\b/g, 'screen');

  const isBlackLike =
    /\bblack\s*screen\b/.test(t) ||
    /\bscreen\s*in\s*black\b/.test(t) ||
    /\ball\s*black\b/.test(t) ||
    /\bdark\s*screen\b/.test(t) ||
    /\bblank\s*screen\b/.test(t) ||
    /\bno\s*video\b/.test(t) ||
    /\bwithout\s*video\b/.test(t) ||
    /\btela\s*preta\b/.test(t) ||
    /\bsem\s*video\b/.test(t) ||
    /\bsem\s*imagem\b/.test(t);

  return isBlackLike ? 'BLACK SCREEN' : raw.trim();
}

const RX = (s: string, f = 'i') => new RegExp(s, f);
const SYNONYMS = {
  'BLACK SCREEN': [
    RX('\\bblack\\s*screen\\b'),
    RX('\\bscreen\\s*in\\s*black\\b'),
    RX('\\ball\\s*black\\b'),
    RX('\\bdark\\s*screen\\b'),
    RX('\\bblank\\s*screen\\b'),
    RX('\\bno\\s*video\\b'),
    RX('\\bwithout\\s*video\\b'),
    RX('\\btela\\s*preta\\b'),
    RX('\\bsem\\s*video\\b'),
    RX('\\bsem\\s*imagem\\b'),
  ],
  'INOPERATIVE / NOT WORKING': [
    RX('\\binoperative\\b'),
    RX('\\binop\\b'),
    RX("doesn'?t\\s*work"),
    RX('not\\s*working'),
    RX('does\\s*not\\s*work'),
    RX("does\\s*not\\s*turn\\s*on|won'?t\\s*turn\\s*on"),
    RX('stopped\\s*to\\s*work'),
    RX('nao\\s*funciona'),
    RX('nao\\s*liga'),
    RX('inoperante'),
  ],
  'LIVE TV INOP': [RX('\\blive\\s*tv\\b|\\blivetv\\b')],
  'SMART CARD / REGISTRATION': [
    RX('invalid\\s*card|card\\s*invalid'),
    RX('no\\s*sim\\s*card|\\bsim\\s*card\\b'),
    RX('\\bsky\\s*card\\b'),
    RX('\\bcod\\s*\\d+\\b|\\bcode\\s*\\d+\\b'),
    RX('\\bregistration\\b|\\bregistered\\b|registrad[oa]|registro'),
  ],
  'SOFTWARE / BOOT': [
    RX('\\brebooting\\b'),
    RX('does\\s*not\\s*initialize'),
    RX('loading\\s*screen'),
    RX('\\bboot\\b|\\bsw\\b|software|upgrade|update|reset'),
  ],
  'ETHERNET / COMMUNICATIONS': [
    RX('\\bethernet\\b'),
    RX('loss\\s*of\\s*comm|loss\\s*off\\s*communication'),
    RX('\\bcomm\\b|no\\s*communication'),
    RX('sem\\s*comunicacao|falha\\s*de\\s*comunicacao'),
  ],
  'POWER SUPPLY': [RX('power\\s*supply|\\bpsu\\b')],
  'NFF / TEST OK': [
    RX('\\bnff\\b'),
    RX('no\\s*faults?\\s*found|no\\s*failures?\\s*found'),
    RX('tested?\\s*-?\\s*no\\s*faults?\\s*found'),
    RX('test(ed)?\\s*(is\\s*)?satisfactory'),
    RX('no\\s*faults\\s*were\\s*found'),
  ],
  'DAMAGED / BER': [
    RX('\\bber\\b|beyond\\s*economic\\s*repair'),
    RX('burn\\s*mark'),
    RX('short\\s*circuit'),
    RX('\\bbroken\\b|\\bdamaged\\b|\\bdent\\b'),
    RX('\\bengineering\\s*unit\\b'),
  ],
  'AUDIO / JACK': [RX('\\baudio\\s*jack\\b|\\baudio\\b')],
  'BLUE SCREEN': [RX('\\bblue\\s*screen\\b')],
} as const;


// 4) tipo auxiliar com as chaves de SYNONYMS
type ReasonKey = Exclude<ReasonCategory, 'OTHER' | 'UNSPECIFIED'>;

// 5) implementação segura
export function normalizeReasonCategory(raw: string): ReasonCategory {
  const txt = stripAccents((raw || '').trim().toLowerCase());
  if (!txt) return 'UNSPECIFIED';

  // prioridade para BLACK SCREEN
  for (const rx of SYNONYMS['BLACK SCREEN']) {
    if (rx.test(txt)) return 'BLACK SCREEN';
  }


// itera somente sobre chaves válidas de SYNONYMS
  for (const key of Object.keys(SYNONYMS) as ReasonKey[]) {
    if (key === 'BLACK SCREEN') continue; // já testado
    if (SYNONYMS[key].some((rx) => rx.test(txt))) {
      // ReasonKey é subtipo de ReasonCategory => OK retornar
      return key;
    }
  }

  return 'OTHER';
}


const MONTHS: Record<string, number> = {
  jan: 1, janeiro: 1, january: 1,
  fev: 2, fevereiro: 2, feb: 2, february: 2,
  mar: 3, marco: 3, março: 3, march: 3,
  abr: 4, abril: 4, apr: 4, april: 4,
  mai: 5, maio: 5, may: 5,
  jun: 6, junho: 6, jun_en: 6, june: 6,
  jul: 7, julho: 7, jul_en: 7, july: 7,
  ago: 8, agosto: 8, aug: 8, august: 8,
  set: 9, setembro: 9, sep: 9, september: 9,
  out: 10, outubro: 10, oct: 10, october: 10,
  nov: 11, novembro: 11, nov_en: 11, november: 11,
  dez: 12, dezembro: 12, dec: 12, december: 12,
};

export function normalizeMonth(v: any): number | null {
  if (v == null) return null;
  const raw = String(v).trim().toLowerCase();
  if (!raw) return null;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 1 && n <= 12) return n;
  const s = stripAccents(raw);
  return MONTHS[s] ?? MONTHS[`${s}_en`] ?? null;
}

export function normalizeYear(v: any): number | null {
  if (v == null) return null;
  const y = Number(v);
  return Number.isFinite(y) ? y : null;
}

export function monthKey(year: number | null, month: number | null): string | null {
  if (!year || !month) return null;
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function normalizeRow(row: Row, opts: NormalizeOptions = {}): Row {
  const cfg = { ...DEFAULT_OPTIONS, ...opts };

  const descRaw = pickFirst(row, cfg.descriptionKeys);
  const reasonRaw = pickFirst(row, cfg.reasonKeys);
  const monthRaw  = pickFirst(row, cfg.monthKeys);
  const yearRaw   = pickFirst(row, cfg.yearKeys);

  const Reason_spellfix =
    cfg.applySpellfix ? spellfixBlackScreen(reasonRaw) : reasonRaw;

  const Reason_normalized_v2 =
    cfg.applyCategory ? normalizeReasonCategory(Reason_spellfix || reasonRaw) : undefined;

  const MonthNorm = cfg.applyMonthYear ? normalizeMonth(monthRaw) : null;
  const YearNorm  = cfg.applyMonthYear ? normalizeYear(yearRaw)  : null;
  const MonthKey  = cfg.applyMonthYear ? monthKey(YearNorm, MonthNorm) : null;

  return {
    ...row,
    ...(cfg.applySpellfix && { Reason_spellfix }),
    ...(cfg.applyCategory && { Reason_normalized_v2 }),
    ...(cfg.applyMonthYear && { MonthNorm, YearNorm, MonthKey }),
    Descricao_norm: descRaw,
  };
}


const REASON_RAW_KEYS = [
  'Reason for removal',
  'Reason for Removal',
  'reason for removal',
  'Reason_of_removal',
  'Reason of Removal',       // ✅ novas variações
  'Reason Of Removal',
  'Reason_of_Removal',
  'Reason',
  'Motivo', // caso algum CSV venha em PT
];


export function extractNormalizedReasonsFromRow(
  row: Record<string, any>,
  {
    reasonRawKeys = REASON_RAW_KEYS,
    dedupe = true,
  }: { reasonRawKeys?: string[]; dedupe?: boolean } = {}
): ReasonCategory[] {
  const raw = pickFirst(row, reasonRawKeys);
  if (!raw) return [];

  const tokens = String(raw)
    .split(/[\s]*[;|/,\n][\s]*/g) // ; , / | (e quebra de linha)
    .map((t) => t.trim())
    .filter(Boolean);

  const categories = tokens.map((tok) => {
    const fixed = spellfixBlackScreen(tok);          // consolida equivalentes p/ BLACK SCREEN
    return normalizeReasonCategory(fixed);           // mapeia p/ categoria
  });

 return dedupe ? Array.from(new Set(categories)) : categories;
}


export function normalizeDataset(rows: Row[], opts: NormalizeOptions = {}): Row[] {
  if (!Array.isArray(rows) || rows.length === 0) return [];
  return rows.map((r) => normalizeRow(r, opts));
}