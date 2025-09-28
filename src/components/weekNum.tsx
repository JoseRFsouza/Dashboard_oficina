
import { getDataSimulada } from "@/lib/simuladorData";
import { getWeek, getYear } from 'date-fns';

export default function WeekNum() {
  const data = getDataSimulada();
  const semana = getWeek(data);
  const ano = getYear(data);

  return (
    <div className="flex flex-col h-full w-full p-4">
        <div className='flex items-center justify-center'><h1 className="text-lg font-medium mb-6">Week and Year</h1></div>
        <div className="flex flex-col items-center flex-grow">
        <div className="text-8xl font-extrabold loading-none text-primary"> {semana}</div>
           <div className="text-6xl text lg-muted-foreground mt-2 tracking-wide"> {ano}</div>
           </div>
    </div>
  );
}