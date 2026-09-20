import AppAreaChartHistorico from "@/components/AppAreaChartHistorico";
import DescXQtdPieChart from "@/components/descxqtdPieChart";
import TatMensalChart from "@/components/TatMensalChart";
import WeekNum from "@/components/weekNum";
import DescReasonsByDescricaoCard from "@/components/card/DescRankCard";
import OperationalKpiRibbon from "@/components/OperationalKpiRibbon";

export default function Homepage() {
  return (
    <main className="max-w-[1600px] mx-auto w-full p-4 md:p-6 flex flex-col gap-4">
      {/* Top Operational KPI Ribbon */}
      <OperationalKpiRibbon />

      {/* Linha superior: Ciclo Semanal, Fluxo Entradas/Saídas, Top 3 Motivos */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.8fr_1.2fr] gap-4 items-stretch">
        {/* Card 1: Ciclo Operacional */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <WeekNum />
        </div>

        {/* Card 2: Fluxo Entradas & Saídas */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <DescXQtdPieChart />
        </div>

        {/* Card 3: Top 3 Motivos de Falha */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <DescReasonsByDescricaoCard
            title="Top 3 — Motivos de Remoção"
            intervalMs={4000}
          />
        </div>
      </div>

      {/* Linha inferior: TAT Mensal e Histórico SegVoo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Card 4: Turn Around Time */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <TatMensalChart />
        </div>

        {/* Card 5: Histórico Liberações SegVoo */}
        <div className="bg-card text-card-foreground border border-border/80 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <AppAreaChartHistorico />
        </div>
      </div>
    </main>
  );
}
