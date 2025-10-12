import AppAreaChartHistorico from "@/components/AppAreaChartHistorico";
import DescXQtdPieChart from "@/components/descxqtdPieChart";
import TatMensalChart from "@/components/TatMensalChart";


import WeekNum from "@/components/weekNum";
import DescRankCard from "@/components/card/DescRankCard";
import DescReasonsByDescricaoCard from "@/components/card/DescRankCard";

export default function Homepage() {
  

  return (
    <div className="flex flex-col gap-4 h-screen p-4">

      {/* Linha superior: 1fr 2fr 1fr */}
      <div className="grid grid-cols-[1fr_2fr_1fr] gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg flex items-center justify-center">
          <WeekNum />
        </div>

        <div className="bg-primary-foreground p-4 rounded-lg">
          <DescXQtdPieChart />
        </div>

        
        
        
        <div className="p-0 rounded-lg">
          <DescReasonsByDescricaoCard
            title="Top 3 — Motivos por Descrição"
            intervalMs={3500}
            // Cenário geral: todas as falhas (excluindo NFF/UNSPECIFIED por padrão)
            // Se quiser focar, por exemplo:
            // include={['BLACK SCREEN','INOPERATIVE / NOT WORKING']}
            // topReasonsPerDescricao={3}
          />

        </div>


      </div>

      {/* Linha inferior: 2 colunas iguais */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-foreground p-4 rounded-lg">
          <TatMensalChart />
        </div>

        <div className="bg-primary-foreground p-4 rounded-lg">
          <AppAreaChartHistorico />
        </div>
      </div>
    </div>
  );
}