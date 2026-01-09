import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Thermometer, 
  MapPin, 
  Zap, 
  Home, 
  Settings2,
  Clock,
  TrendingUp
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { DailyPlanChart } from '@/components/charts/DailyPlanChart';
import { api, Device, CurrentAction, HourlyAction } from '@/lib/api';
import { cn } from '@/lib/utils';

// Mock data
const mockDevice: Device = {
  id: 1,
  device_id: 'HP-001',
  name: 'Living Room',
  latitude: 60.1699,
  longitude: 24.9384,
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
};

const mockAction: CurrentAction = {
  device_id: 'HP-001',
  mode: 'heating',
  target_temp: 21,
  current_temp: 19.5,
  reason: 'Low electricity price window - optimal for preheating',
  next_change: '14:00',
};

const mockPlan: HourlyAction[] = Array.from({ length: 24 }, (_, hour) => {
  const modes = ['eco', 'heating', 'idle', 'heating'];
  const mode = modes[Math.floor(hour / 6)];
  return {
    hour,
    mode,
    target_temp: 18 + (mode === 'heating' ? 3 : mode === 'eco' ? 2 : 0) + Math.random(),
    reason: mode === 'heating' ? 'Low price' : mode === 'eco' ? 'Comfort' : 'Stable',
    price: 30 + Math.sin(hour / 3) * 20,
    carbon: 80 + Math.cos(hour / 4) * 30,
  };
});

export default function DeviceDetail() {
  const { deviceId } = useParams<{ deviceId: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [action, setAction] = useState<CurrentAction | null>(null);
  const [plan, setPlan] = useState<HourlyAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!deviceId) return;
      setLoading(true);
      try {
        const [deviceData, actionData, planData] = await Promise.all([
          api.getDevice(deviceId).catch(() => ({ ...mockDevice, device_id: deviceId })),
          api.getCurrentAction(deviceId).catch(() => mockAction),
          api.getDailyPlan({ device_id: deviceId }).catch(() => ({ hourly_actions: mockPlan })),
        ]);
        setDevice(deviceData);
        setAction(actionData);
        setPlan(planData.hourly_actions || mockPlan);
      } catch {
        setDevice({ ...mockDevice, device_id: deviceId || 'HP-001' });
        setAction(mockAction);
        setPlan(mockPlan);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId]);

  if (loading || !device) {
    return (
      <Layout title="Loading..." subtitle="Fetching device data">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const getModeColor = (mode?: string) => {
    switch (mode?.toLowerCase()) {
      case 'heating': return 'text-warning';
      case 'cooling': return 'text-primary';
      case 'eco': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Layout title={device.name} subtitle={`Device ID: ${device.device_id}`}>
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/devices">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Devices
          </Link>
        </Button>
      </div>

      {/* Current Status */}
      <div className="glass-card p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Current Status</h2>
            <p className="text-sm text-muted-foreground">{action?.reason}</p>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full text-sm font-medium capitalize",
            action?.mode === 'heating' && "bg-warning/10 text-warning",
            action?.mode === 'cooling' && "bg-primary/10 text-primary",
            action?.mode === 'eco' && "bg-success/10 text-success",
            action?.mode === 'idle' && "bg-secondary text-muted-foreground"
          )}>
            {action?.mode || 'Unknown'}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <Thermometer className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="mt-2 text-2xl font-bold text-foreground">
              {action?.current_temp?.toFixed(1)}°C
            </p>
            <p className="text-xs text-muted-foreground">Current</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <TrendingUp className={cn("h-5 w-5 mx-auto", getModeColor(action?.mode))} />
            <p className="mt-2 text-2xl font-bold text-foreground">
              {action?.target_temp?.toFixed(1)}°C
            </p>
            <p className="text-xs text-muted-foreground">Target</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <Clock className="h-5 w-5 mx-auto text-muted-foreground" />
            <p className="mt-2 text-2xl font-bold text-foreground">
              {action?.next_change || '--:--'}
            </p>
            <p className="text-xs text-muted-foreground">Next Change</p>
          </div>
          <div className="rounded-lg bg-secondary/50 p-4 text-center">
            <Zap className={cn("h-5 w-5 mx-auto", device.vpp_enabled ? "text-success" : "text-muted-foreground")} />
            <p className="mt-2 text-2xl font-bold text-foreground">
              {device.vpp_enabled ? 'Active' : 'Off'}
            </p>
            <p className="text-xs text-muted-foreground">VPP Status</p>
          </div>
        </div>
      </div>

      {/* Daily Plan */}
      <div className="mb-6">
        <DailyPlanChart data={plan} />
      </div>

      {/* Device Details */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Location & Building */}
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
            <Home className="h-5 w-5 text-primary" />
            Building Properties
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location</span>
              <span className="font-mono text-foreground">
                {device.latitude.toFixed(4)}°N, {device.longitude.toFixed(4)}°E
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Floor Area</span>
              <span className="text-foreground">{device.floor_area} m²</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volume</span>
              <span className="text-foreground">{device.volume} m³</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Insulation</span>
              <span className="capitalize text-foreground">{device.insulation_level}</span>
            </div>
          </div>
        </div>

        {/* Heat Pump */}
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
            <Settings2 className="h-5 w-5 text-primary" />
            Heat Pump Config
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="capitalize text-foreground">
                {device.heat_pump_type.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rated Power</span>
              <span className="text-foreground">{device.rated_power} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">COP Rating</span>
              <span className="text-foreground">{device.cop_rating}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Comfort Range</span>
              <span className="text-foreground">
                {device.comfort_min_temp}°C - {device.comfort_max_temp}°C
              </span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
