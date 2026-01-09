import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/dashboard/DeviceCard';
import { Button } from '@/components/ui/button';
import { api, Device, CurrentAction } from '@/lib/api';

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
  'HP-001': { device_id: 'HP-001', mode: 'heating', target_temp: 21, current_temp: 19.5, reason: 'Low price', next_change: '14:00' },
  'HP-002': { device_id: 'HP-002', mode: 'eco', target_temp: 20, current_temp: 20.2, reason: 'Comfort', next_change: '16:00' },
  'HP-003': { device_id: 'HP-003', mode: 'idle', target_temp: 21, current_temp: 21.1, reason: 'Stable', next_change: '18:00' },
};

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>(mockDevices);
  const [actions, setActions] = useState<Record<string, CurrentAction>>(mockActions);
  const [loading, setLoading] = useState(false);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const devicesData = await api.listDevices();
      setDevices(devicesData);
      
      const actionsPromises = devicesData.map(async (d) => {
        try {
          const action = await api.getCurrentAction(d.device_id);
          return [d.device_id, action] as const;
        } catch {
          return [d.device_id, null] as const;
        }
      });
      const actionsResults = await Promise.all(actionsPromises);
      setActions(Object.fromEntries(actionsResults.filter(([, a]) => a)));
    } catch {
      // Keep mock data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <Layout title="Devices" subtitle="Manage your registered heat pumps">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-muted-foreground">
          {devices.length} device{devices.length !== 1 && 's'} registered
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchDevices}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="gradient" size="sm" asChild>
            <Link to="/register">
              <Plus className="mr-2 h-4 w-4" />
              Add Device
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {devices.map((device, index) => (
          <div key={device.device_id} style={{ animationDelay: `${index * 100}ms` }}>
            <DeviceCard
              device={device}
              currentAction={actions[device.device_id]}
            />
          </div>
        ))}
      </div>

      {devices.length === 0 && (
        <div className="glass-card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-secondary p-4">
            <Plus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No devices yet</h3>
          <p className="mt-1 text-muted-foreground">
            Register your first heat pump to get started
          </p>
          <Button variant="gradient" className="mt-4" asChild>
            <Link to="/register">Add Device</Link>
          </Button>
        </div>
      )}
    </Layout>
  );
}
