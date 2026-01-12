import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { DeviceCard } from '@/components/dashboard/DeviceCard';
import { Button } from '@/components/ui/button';
import { api, Device, CurrentAction } from '@/lib/api';



export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  // const [actions, setActions] = useState<Record<string, CurrentAction>>();
  const [loading, setLoading] = useState(false);
  console.log(devices, ":devices in device list page");
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const devicesData = await api.listDevices();
      console.log(devicesData, ":device data");
      setDevices(devicesData);
      
      // const actionsPromises = devicesData.map(async (d) => {
      //   try {
      //     const action = await api.getCurrentAction(d.device_id);
      //     return [d.device_id, action] as const;
      //   } catch {
      //     return [d.device_id, null] as const;
      //   }
      // });
      // const actionsResults = await Promise.all(actionsPromises);
      // setActions(Object.fromEntries(actionsResults.filter(([, a]) => a)));
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
              // currentAction={actions[device.device_id]}
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
