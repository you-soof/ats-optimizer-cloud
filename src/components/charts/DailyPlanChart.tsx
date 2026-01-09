import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { HourlyAction } from '@/lib/api';

interface DailyPlanChartProps {
  data: HourlyAction[];
}

const getModeColor = (mode: string) => {
  switch (mode.toLowerCase()) {
    case 'heating':
      return 'hsl(38, 92%, 50%)';
    case 'cooling':
      return 'hsl(199, 89%, 48%)';
    case 'eco':
      return 'hsl(142, 71%, 45%)';
    case 'boost':
      return 'hsl(0, 72%, 51%)';
    default:
      return 'hsl(217, 33%, 35%)';
  }
};

export function DailyPlanChart({ data }: DailyPlanChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      hour: `${item.hour.toString().padStart(2, '0')}:00`,
      temp: item.target_temp,
      mode: item.mode,
      reason: item.reason,
      price: item.price,
    }));
  }, [data]);

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Daily Optimization Plan</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 17%)" />
            <XAxis 
              dataKey="hour" 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              interval={2}
            />
            <YAxis 
              stroke="hsl(215, 20%, 55%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[15, 26]}
              label={{ 
                value: '°C', 
                position: 'insideLeft',
                style: { fill: 'hsl(215, 20%, 55%)' }
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222, 47%, 10%)',
                border: '1px solid hsl(217, 33%, 17%)',
                borderRadius: '8px',
                color: 'hsl(210, 40%, 98%)',
              }}
              formatter={(value, name, props) => [
                `${value}°C (${props.payload.mode})`,
                'Target Temp'
              ]}
              labelFormatter={(label) => `Time: ${label}`}
            />
            <Bar dataKey="temp" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getModeColor(entry.mode)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {['heating', 'cooling', 'eco', 'idle'].map((mode) => (
          <div key={mode} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-sm" 
              style={{ backgroundColor: getModeColor(mode) }}
            />
            <span className="text-sm text-muted-foreground capitalize">{mode}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
