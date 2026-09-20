"use client";

import { useEffect, useState } from "react";
import { Moon, Sun, Wrench, Calendar, RefreshCw, Database, Sparkles } from "lucide-react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import CsvUploadDialog from "@/modals/uploader/csvUpload";
import { SimuladorDataModal } from "@/modals/SimuladorDataModal";
import { useCSV } from "@/lib/useCSV";
import { obterDataSimulada } from "@/lib/simuladorClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const NavBar = () => {
  const { setTheme } = useTheme();
  const { resetCSV, loadSampleData, registros, isSampleData } = useCSV();
  const [dataRef, setDataRef] = useState<Date | null>(null);

  useEffect(() => {
    async function carregarDataRef() {
      try {
        const d = await obterDataSimulada();
        setDataRef(d);
      } catch {
        setDataRef(new Date());
      }
    }
    carregarDataRef();

    const handleDataChange = () => carregarDataRef();
    window.addEventListener("dataSimuladaChange", handleDataChange);
    return () => window.removeEventListener("dataSimuladaChange", handleDataChange);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-md transition-all">
      <div className="max-w-[1600px] mx-auto h-16 px-4 md:px-6 flex items-center justify-between gap-4">
        {/* LEFT: Branding */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-sm shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Wrench className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-foreground">
                  IFE REPAIR SHOP
                </span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">
                  Operations
                </span>
              </div>
              <span className="text-xs text-muted-foreground hidden sm:block">
                Avionics Maintenance & TAT Analytics
              </span>
            </div>
          </Link>
        </div>

        {/* CENTER: Status Indicators */}
        <div className="hidden lg:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-secondary-foreground font-medium">
            {isSampleData ? (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Modo Demonstração</span>
              </>
            ) : (
              <>
                <Database className="w-3.5 h-3.5 text-emerald-500" />
                <span>Base Ativa</span>
              </>
            )}
            <span className="text-muted-foreground font-mono">({registros.length} registros)</span>
          </div>

          {dataRef && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary/80 border border-border/60 text-muted-foreground font-medium">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              <span>Data Selecionada:</span>
              <span className="text-foreground font-mono">
                {format(dataRef, "dd 'de' MMM, yyyy", { locale: ptBR })}
              </span>
            </div>
          )}
        </div>

        {/* RIGHT: Actions */}
        <div className="flex items-center gap-2">
          {/* Carregar Exemplo */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadSampleData}
            title="Recarregar base de dados de demonstração"
            className="hidden sm:flex items-center gap-1.5 text-xs font-medium border-border/80 hover:bg-secondary"
          >
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Dados Exemplo</span>
          </Button>

          <SimuladorDataModal />

          <CsvUploadDialog onReset={resetCSV} />

          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground hover:text-foreground">
                <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                <span className="sr-only">Alternar tema</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => setTheme("light")} className="text-xs">
                Claro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")} className="text-xs">
                Escuro
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")} className="text-xs">
                Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default NavBar;

