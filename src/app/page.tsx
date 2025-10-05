import AppAreaChartHistorico from "@/components/AppAreaChartHistorico";
import AppPieChart from "@/components/AppPieChart";
import DescXQtdBarChart from "@/components/descxqtdBarChart";
import DescXQtdPieChart from "@/components/descxqtdPieChart";
import TatMensalChart from "@/components/TatMensalChart";




import WeekNum from "@/components/weekNum";

export default function Homepage() {
  return (
    <div className="grid grid-cols-6 grid-rows-2 gap-4 h-screen">

      <div className="bg-primary-foreground p-4 rounded-lg flex col-span1">
        <WeekNum />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-4">
        <h2 className="text-lg font-semibold mb-2"></h2>
        <DescXQtdPieChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg flex col-span-1">
        <h2 className="text-lg font-semibold mb-2"></h2>
        <AppPieChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-3">
         <TatMensalChart />
      </div>

      <div className="bg-primary-foreground p-4 rounded-lg col-span-3">
        <h2 className="text-lg font-semibold mb-2"></h2>
        <AppAreaChartHistorico />
      </div>
    </div>
  );
}
