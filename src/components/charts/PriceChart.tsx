import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { PriceCarbonForecast } from '@/lib/api';

interface PriceChartProps {
  data: PriceCarbonForecast[];
}

export function PriceChart({ data }: PriceChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      price: item.price,
      carbon: item.carbon_intensity,
    }));
  }, [data]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Price & Carbon Forecast</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis 
              dataKey="time" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              yAxisId="price"
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              yAxisId="carbon"
              orientation="right"
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(217, 33%, 17%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)',
              }}
            />
            <Legend />
            <Area
              yAxisId="price"
              type="monotone"
              dataKey="price"
              stroke="hsl(172, 66%, 50%)"
              strokeWidth={2}
              fill="url(#priceGradient)"
              name="Price (€/MWh)"
            />
            <Area
              yAxisId="carbon"
              type="monotone"
              dataKey="carbon"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={2}
              fill="url(#carbonGradient)"
              name="Carbon (gCO₂/kWh)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
