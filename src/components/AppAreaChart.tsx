"use client";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Area,CartesianGrid, XAxis, YAxis, AreaChart, ResponsiveContainer } from "recharts";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "#2563eb",
  },
  mobile: {
    label: "Mobile",
    color: "#60a5fa",
  },
} satisfies ChartConfig

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]




const AppAreaChart = () => {
return (  

    <div className="w-full h-[300px]">
     <h1 className="text-lg font-medium mb-6">RECEITAS X DISPESAS</h1>   
     <div className="">  
      <ResponsiveContainer width="100%" height="100%">
     <ChartContainer config={chartConfig} className="min-h-[200px]">
      <AreaChart accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}>
        <CartesianGrid vertical={false} />
        <XAxis
            dataKey="month"
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(value) => value.slice(0, 3)}
        />
        <YAxis
            tickLine={false}
            tickMargin={10}
            axisLine={false}
         />
         <ChartTooltip content={<ChartTooltipContent />} />
         <ChartLegend content={<ChartLegendContent />} />
        <Area
              dataKey="desktop"
              type="natural"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
            <Area
              dataKey="mobile"
              type="natural"
              fill="var(--color-mobile)"
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
      </AreaChart>
    </ChartContainer>
    </ResponsiveContainer>
            </div>
     </div>

)

}
export default AppAreaChart