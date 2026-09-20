'use client';

/**
 * Converte com segurança uma string de data (ex: '2026-09-19' ou ISO) para Date
 * fixando ao meio-dia para evitar deslocamento de fuso horário (timezone shift).
 */
export function parseDataSegura(raw: string | Date | null | undefined): Date {
  if (!raw) return new Date();
  if (raw instanceof Date) return raw;

  // Se for formato YYYY-MM-DD
  if (typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [ano, mes, dia] = raw.split('-').map(Number);
    return new Date(ano, mes - 1, dia, 12, 0, 0);
  }

  const d = new Date(raw);
  return isNaN(d.getTime()) ? new Date() : d;
}

/**
 * Converte um Date para formato ISO de data YYYY-MM-DD
 */
export function formatarDataInput(d: Date): string {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

/**
 * Retorna a data selecionada com prioridade no localStorage (escolha do usuário):
 * 1. localStorage (imediato, síncrono, persistente na máquina do usuário)
 * 2. API /api/simulador (se localStorage vazio)
 * 3. new Date() caso nada esteja configurado
 */
export async function obterDataSimulada(): Promise<Date> {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('dataSimulada');
    if (local) {
      const parsed = parseDataSegura(local);
      if (!isNaN(parsed.getTime())) {
        return parsed;
      }
    }
  }

  // Se não houver no localStorage, tenta buscar no servidor
  try {
    const res = await fetch('/api/simulador', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json?.dataSimulada) {
        const parsed = parseDataSegura(json.dataSimulada);
        if (!isNaN(parsed.getTime())) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('dataSimulada', formatarDataInput(parsed));
          }
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Data selecionada: usando data atual de fallback:', err);
  }

  return new Date();
}

/**
 * Salva a data selecionada pelo usuário de forma síncrona e confiável
 */
export async function salvarDataSimulada(data: Date | string): Promise<void> {
  const dataObj = typeof data === 'string' ? parseDataSegura(data) : data;
  const dataStr = formatarDataInput(dataObj);

  if (typeof window !== 'undefined') {
    localStorage.setItem('dataSimulada', dataStr);
    // Dispara evento para atualização imediata dos componentes sem precisar de reload
    window.dispatchEvent(new CustomEvent('dataSimuladaChange', { detail: dataStr }));
  }

  // Notifica o endpoint de simulação em segundo plano
  try {
    await fetch('/api/simulador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSimulada: dataStr }),
    });
  } catch (err) {
    console.warn('Aviso ao sincronizar data com /api/simulador:', err);
  }
}

/**
 * Restaura a data para hoje (data atual)
 */
export async function resetarDataParaHoje(): Promise<void> {
  const hojeStr = formatarDataInput(new Date());

  if (typeof window !== 'undefined') {
    localStorage.removeItem('dataSimulada');
    window.dispatchEvent(new CustomEvent('dataSimuladaChange', { detail: hojeStr }));
  }

  try {
    await fetch('/api/simulador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataSimulada: hojeStr }),
    });
  } catch (err) {
    console.warn('Aviso ao resetar data:', err);
  }
}
