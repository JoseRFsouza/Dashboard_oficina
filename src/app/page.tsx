import AppAreaChart from "@/components/AppAreaChart";
import AppAreaChartHistorico from "@/components/AppAreaChartHistorico";
import AppPieChart from "@/components/AppPieChart";
import DescXQtdBarChart from "@/components/descxqtdBarChart";
import TatMensalChart from "@/components/TatMensalChart";




import WeekNum from "@/components/weekNum";

export default function Homepage() {
  return (
    <div className="min-h-screen p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <div className="bg-primary-foreground p-4 rounded-lg">
        <WeekNum />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-2">
        <h2 className="text-lg font-semibold mb-2">Distribuição por Descrição</h2>
        <DescXQtdBarChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Distribuição por Unidade</h2>
        <AppPieChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-2">
        <h2 className="text-lg font-semibold mb-2">TAT Médio Mensal</h2>
        <TatMensalChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-2">
        <h2 className="text-lg font-semibold mb-2">Histórico de SEGVOO</h2>
        <AppAreaChartHistorico />
      </div>
    </div>
  );
}
