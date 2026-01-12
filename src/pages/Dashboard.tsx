import { PriceChart } from "@/components/charts/PriceChart";
import { DeviceCard } from "@/components/dashboard/DeviceCard";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Layout } from "@/components/layout/Layout";
import { api, CurrentAction, Device, PriceCarbonForecast } from "@/lib/api";
import { Cpu, Leaf, Thermometer, Zap } from "lucide-react";
import { useEffect, useState } from "react";

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
          api.listDevices(),
          api.getPriceCarbonForecast(),
        ]);
        setDevices(devicesData);
        setForecast(forecastData.forecast);
      } catch {
        // Keep mock data
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  console.log(forecast, ":devices in dashboard page");
  const activeDevices = devices.filter((d) => d.vpp_enabled).length;
  // const avgTemp =
  //   Object.values(devices).reduce((acc, a) => acc + (a?.current_temp || 0), 0) /
  //   Object.keys(devices).length;
  const currentPrice = forecast[0]?.price_eur_mwh || 0;
  const currentCarbon = forecast[0]?.wind_percentage || 0;

  return (
    <Layout
      title="Dashboard"
      subtitle="Monitor your thermal optimization system"
    >
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
        {/* <StatsCard
          title="Avg Temperature"
          value={`${avgTemp.toFixed(1)}°C`}
          subtitle="Across all devices"
          icon={Thermometer}
        /> */}
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
          <h2 className="text-lg font-semibold text-foreground">
            Your Devices
          </h2>
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
            <h3 className="font-semibold text-foreground mb-4">
              Current Price
            </h3>
            <div className="text-center">
              <p className="text-4xl font-bold gradient-text">
                {currentPrice.toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">€/MWh</p>
            </div>
            <div className="mt-4 flex justify-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-muted-foreground">Low</p>
                <p className="font-medium text-success">
                  {Math.min(...forecast.map((f) => f.price_eur_mwh)).toFixed(1)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">High</p>
                <p className="font-medium text-warning">
                  {Math.max(...forecast.map((f) => f.price_eur_mwh)).toFixed(1)}
                </p>
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
