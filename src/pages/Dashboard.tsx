import { useEffect, useState } from 'react';
import { Cpu, Zap, Thermometer, Leaf } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DeviceCard } from '@/components/dashboard/DeviceCard';
import { PriceChart } from '@/components/charts/PriceChart';
import { api, Device, PriceCarbonForecast, CurrentAction } from '@/lib/api';

// Mock data for demo
const mockDevices: Device[] = [
  {
    id: 1,
    device_id: 'HP-001',
    name: 'Living Room',
    latitude: 60.17,
    longitude: 24.94,
    insulation_level: 'good',
    floor_area: 45,
    volume: 120,
    heat_pump_type: 'air_source',
    rated_power: 8,
    cop_rating: 3.5,
    comfort_min_temp: 18,
    comfort_max_temp: 24,
    vpp_enabled: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    device_id: 'HP-002',
    name: 'Bedroom',
    latitude: 60.17,
    longitude: 24.94,
    insulation_level: 'excellent',
    floor_area: 25,
    volume: 65,
    heat_pump_type: 'ground_source',
    rated_power: 5,
    cop_rating: 4.2,
    comfort_min_temp: 19,
    comfort_max_temp: 22,
    vpp_enabled: true,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T10:00:00Z',
  },
  {
    id: 3,
    device_id: 'HP-003',
    name: 'Office',
    latitude: 60.19,
    longitude: 24.96,
    insulation_level: 'average',
    floor_area: 30,
    volume: 80,
    heat_pump_type: 'hybrid',
    rated_power: 6,
    cop_rating: 3.8,
    comfort_min_temp: 20,
    comfort_max_temp: 23,
    vpp_enabled: false,
    created_at: '2024-01-17T10:00:00Z',
    updated_at: '2024-01-17T10:00:00Z',
  },
];

const mockActions: Record<string, CurrentAction> = {
  'HP-001': { device_id: 'HP-001', mode: 'heating', target_temp: 21, current_temp: 19.5, reason: 'Low price window', next_change: '14:00' },
  'HP-002': { device_id: 'HP-002', mode: 'eco', target_temp: 20, current_temp: 20.2, reason: 'Optimal comfort', next_change: '16:00' },
  'HP-003': { device_id: 'HP-003', mode: 'idle', target_temp: 21, current_temp: 21.1, reason: 'Target reached', next_change: '18:00' },
};

const mockForecast: PriceCarbonForecast[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: new Date(Date.now() + i * 3600000).toISOString(),
  price: 30 + Math.sin(i / 3) * 20 + Math.random() * 10,
  carbon_intensity: 80 + Math.cos(i / 4) * 30 + Math.random() * 15,
}));

export default function Dashboard() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [actions, setActions] = useState<Record<string, CurrentAction>>({});
  const [forecast, setForecast] = useState<PriceCarbonForecast[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to fetch real data, fall back to mock
    const fetchData = async () => {
      setLoading(true);
      try {
        const [devicesData, forecastData] = await Promise.all([
          api.listDevices().catch(() => []),
          api.getPriceCarbonForecast().catch(() => []),
        ]);
        setDevices(devicesData);
        setForecast(forecastData);

        // Fetch current actions for each device
        const actionsPromises = devicesData.map(async (d) => {
          try {
            const action = await api.getCurrentAction(d.device_id);
            return [d.device_id, action] as const;
          } catch {
            return [d.device_id, mockActions[d.device_id]] as const;
          }
        });
        const actionsResults = await Promise.all(actionsPromises);
        setActions(Object.fromEntries(actionsResults.filter(([, a]) => a)));
      } catch {
        // Keep mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const activeDevices = devices.filter(d => d.vpp_enabled).length;
  const avgTemp = Object.values(actions).reduce((acc, a) => acc + (a?.current_temp || 0), 0) / Object.keys(actions).length;
  const currentPrice = forecast[0]?.price || 0;
  const currentCarbon = forecast[0]?.carbon_intensity || 0;

  return (
    <Layout title="Dashboard" subtitle="Monitor your thermal optimization system">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Total Devices"
          value={devices.length}
          subtitle="Registered heat pumps"
          icon={Cpu}
          variant="primary"
        />
        <StatsCard
          title="VPP Active"
          value={activeDevices}
          subtitle="Participating in grid"
          icon={Zap}
          trend={{ value: 12, positive: true }}
          variant="success"
        />
        <StatsCard
          title="Avg Temperature"
          value={`${avgTemp.toFixed(1)}°C`}
          subtitle="Across all devices"
          icon={Thermometer}
        />
        <StatsCard
          title="Current Carbon"
          value={`${currentCarbon.toFixed(0)}`}
          subtitle="gCO₂/kWh"
          icon={Leaf}
          variant="warning"
        />
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Devices */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Your Devices</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {devices.map((device) => (
              <DeviceCard
                key={device.device_id}
                device={device}
                currentAction={actions[device.device_id]}
              />
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="glass-card p-6">
            <h3 className="font-semibold text-foreground mb-4">Current Price</h3>
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">{currentPrice.toFixed(2)}</p>
              <p className="text-sm text-muted-foreground mt-1">€/MWh</p>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Low</p>
                <p className="font-medium text-success">{Math.min(...forecast.map(f => f.price)).toFixed(1)}</p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">High</p>
                <p className="font-medium text-warning">{Math.max(...forecast.map(f => f.price)).toFixed(1)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="mt-6">
        <PriceChart data={forecast} />
      </div>
    </Layout>
  );
}
