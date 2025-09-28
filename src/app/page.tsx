import AppAreaChart from "@/components/AppAreaChart";
import AppPieChart from "@/components/AppPieChart";
import DescXQtdBarChart from "@/components/descxqtdBarChart";
import TatMensalChart from "@/components/TatMensalChart";




import WeekNum from "@/components/weekNum";

export default function Homepage() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-4">
  {/* bloco superior esquerdo */}
  <div className="bg-primary-foreground p-4 rounded-lg min-h-[60vh]">
    <WeekNum />
  </div>

  {/* bloco superior direito */}
  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2 min-h-[60vh]">
    <DescXQtdBarChart />
  </div>

  {/* blocos inferiores */}
  <div className="bg-primary-foreground p-4 rounded-lg">
    <AppPieChart />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
    <TatMensalChart />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 xl:col-span-1 2xl:col-span-2">
    <AppAreaChart />
  </div>
</div>
  );
}
