import AppAreaChart from "@/components/AppAreaChart";
import AppPieChart from "@/components/AppPieChart";
import DescXQtdBarChart from "@/components/descxqtdBarChart";
import TatMensalChart from "@/components/TatMensalChart";




import WeekNum from "@/components/weekNum";

export default function Homepage() {
  return (
   <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 grid-rows-2 h-screen gap-4 overflow-hidden">
  <div className="bg-primary-foreground p-4 rounded-lg flex flex-col">
    <WeekNum />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 2xl:col-span-2 flex flex-col">
    <DescXQtdBarChart />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg flex flex-col">
    <AppPieChart />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 2xl:col-span-2 flex flex-col">
    <TatMensalChart />
  </div>

  <div className="bg-primary-foreground p-4 rounded-lg lg:col-span-2 2xl:col-span-2 flex flex-col">
    <AppAreaChart />
  </div>
</div>

  );
}
