"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar as CalendarIcon,
  Check,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Clock,
  Database,
} from "lucide-react";
import { format, getWeek, getYear, subDays, subMonths, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  obterDataSimulada,
  salvarDataSimulada,
  resetarDataParaHoje,
  formatarDataInput,
  parseDataSegura,
} from "@/lib/simuladorClient";
import { useCSV } from "@/lib/useCSV";
import { useRouter } from "next/navigation";

export function SimuladorDataModal() {
  const [open, setOpen] = React.useState(false);
  const [dataSelecionada, setDataSelecionada] = React.useState<Date>(new Date());
  const [inputValue, setInputValue] = React.useState<string>("");
  const { registros } = useCSV();
  const router = useRouter();

  // Carrega a data atualmente salva ao abrir o modal
  React.useEffect(() => {
    if (open) {
      obterDataSimulada().then((d) => {
        setDataSelecionada(d);
        setInputValue(formatarDataInput(d));
      });
    }
  }, [open]);

  // Atualiza ao digitar ou escolher no input nativo
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    if (val && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
      const parsed = parseDataSegura(val);
      if (!isNaN(parsed.getTime())) {
        setDataSelecionada(parsed);
      }
    }
  };

  // Ajustes rápidos de navegação
  const ajustarMeses = (qtd: number) => {
    const nova = qtd > 0 ? addMonths(dataSelecionada, qtd) : subMonths(dataSelecionada, Math.abs(qtd));
    setDataSelecionada(nova);
    setInputValue(formatarDataInput(nova));
  };

  const definirHoje = () => {
    const hoje = new Date();
    setDataSelecionada(hoje);
    setInputValue(formatarDataInput(hoje));
  };

  const definirOntem = () => {
    const ontem = subDays(new Date(), 1);
    setDataSelecionada(ontem);
    setInputValue(formatarDataInput(ontem));
  };

  // Procura a última data válida presente no CSV para conveniência do usuário
  const definirUltimaDataCSV = () => {
    if (!registros || registros.length === 0) return;

    let maisRecente: Date | null = null;
    const regexData = /(\d{2})[-/](\w{3}|\d{2})[-/](\d{2,4})/;

    const meses: Record<string, number> = {
      jan: 0, fev: 1, feb: 1, mar: 2, abr: 3, apr: 3,
      mai: 4, may: 4, jun: 5, jul: 6, ago: 7, aug: 7,
      set: 8, sep: 8, out: 9, oct: 9, nov: 10, dez: 11, dec: 11,
    };

    for (const r of registros) {
      const valor = r.SegVoo || r["Seg Voo"] || r.Data || r.Remocao || r.DataRemocao;
      if (typeof valor === "string") {
        const match = valor.match(regexData);
        if (match) {
          const dia = parseInt(match[1], 10);
          const mesStr = match[2].toLowerCase();
          const mes = meses[mesStr] !== undefined ? meses[mesStr] : parseInt(mesStr, 10) - 1;
          let ano = parseInt(match[3], 10);
          if (ano < 100) ano += 2000;

          const d = new Date(ano, mes, dia, 12, 0, 0);
          if (!isNaN(d.getTime())) {
            if (!maisRecente || d > maisRecente) {
              maisRecente = d;
            }
          }
        }
      }
    }

    if (maisRecente) {
      setDataSelecionada(maisRecente);
      setInputValue(formatarDataInput(maisRecente));
    }
  };

  // Salvar e aplicar
  const handleAplicar = async () => {
    await salvarDataSimulada(dataSelecionada);
    setOpen(false);
    router.refresh();
    window.location.reload();
  };

  // Resetar para a data real de hoje
  const handleResetarHoje = async () => {
    await resetarDataParaHoje();
    setOpen(false);
    router.refresh();
    window.location.reload();
  };

  const semana = getWeek(dataSelecionada);
  const ano = getYear(dataSelecionada);
  const trimestre = Math.ceil((dataSelecionada.getMonth() + 1) / 3);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          id="btn-selecionar-data"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border/80 bg-background text-foreground hover:bg-secondary hover:text-foreground transition-colors shadow-2xs"
          title="Selecionar data de referência para os relatórios"
        >
          <CalendarIcon className="w-3.5 h-3.5 text-sky-500" />
          <span className="font-medium">Selecionar Data</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md rounded-2xl p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Selecionar Data
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Defina a data de referência para todos os cálculos e gráficos do painel.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {/* Card de Resumo da Data Selecionada */}
          <div className="p-3.5 rounded-xl bg-secondary/50 border border-border/70 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium">Data em análise:</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[11px] font-semibold border border-sky-500/20">
                Semana {semana} • {trimestre}º Trimestre
              </span>
            </div>
            <div className="text-base font-bold text-foreground capitalize">
              {format(dataSelecionada, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </div>
          </div>

          {/* Campo de Entrada de Data Nativo (manipulação direta e sem travas) */}
          <div className="space-y-1.5">
            <label
              htmlFor="input-data-selecionada"
              className="text-xs font-semibold text-foreground flex items-center justify-between"
            >
              <span>Escolher no calendário ou digitar:</span>
              <span className="text-[11px] font-normal text-muted-foreground">Ano: {ano}</span>
            </label>
            <div className="relative">
              <input
                id="input-data-selecionada"
                type="date"
                value={inputValue}
                onChange={handleInputChange}
                className="w-full h-11 px-3 py-2 text-sm rounded-lg border border-border bg-background text-foreground shadow-2xs focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          {/* Navegação Rápida entre Meses */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ajustarMeses(-1)}
              className="text-xs flex items-center gap-1 flex-1 border-border/70"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>-1 Mês</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => ajustarMeses(1)}
              className="text-xs flex items-center gap-1 flex-1 border-border/70"
            >
              <span>+1 Mês</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Atalhos Rápidos */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
              Atalhos Rápidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={definirHoje}
                className="px-2.5 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-colors flex items-center gap-1"
              >
                <Clock className="w-3 h-3 text-sky-500" />
                <span>Hoje</span>
              </button>
              <button
                type="button"
                onClick={definirOntem}
                className="px-2.5 py-1 text-xs rounded-md bg-secondary hover:bg-secondary/80 text-foreground border border-border/60 transition-colors"
              >
                Ontem
              </button>
              {registros && registros.length > 0 && (
                <button
                  type="button"
                  onClick={definirUltimaDataCSV}
                  className="px-2.5 py-1 text-xs rounded-md bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 transition-colors flex items-center gap-1"
                  title="Ajustar automaticamente para a data mais recente dos registros carregados"
                >
                  <Database className="w-3 h-3 text-sky-500" />
                  <span>Última Data da Base</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetarHoje}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1.5 w-full sm:w-auto"
            title="Restaurar para a data de hoje"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar Hoje</span>
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleAplicar}
              className="text-xs bg-sky-600 hover:bg-sky-700 text-white flex items-center gap-1.5 shadow-2xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirmar Data</span>
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Exporta também com o novo nome semântico
export { SimuladorDataModal as SelecionarDataModal };
