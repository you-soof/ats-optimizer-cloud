import { useEffect, useState } from 'react';
import { RefreshCw, TrendingDown, TrendingUp, Leaf } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PriceChart } from '@/components/charts/PriceChart';
import { Button } from '@/components/ui/button';
import { api, PriceCarbonForecast } from '@/lib/api';

const mockForecast: PriceCarbonForecast[] = Array.from({ length: 48 }, (_, i) => ({
  timestamp: new Date(Date.now() + i * 3600000).toISOString(),
  price: 30 + Math.sin(i / 3) * 20 + Math.random() * 10,
  carbon_intensity: 80 + Math.cos(i / 4) * 30 + Math.random() * 15,
}));

export default function Forecasts() {
  const [forecast, setForecast] = useState<PriceCarbonForecast[]>(mockForecast);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getPriceCarbonForecast();
      setForecast(data);
    } catch {
      // Keep mock data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const prices = forecast.map(f => f.price);
  const carbons = forecast.map(f => f.carbon_intensity);
  const currentPrice = prices[0] || 0;
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const avgCarbon = carbons.reduce((a, b) => a + b, 0) / carbons.length;

  const minPriceHour = forecast.findIndex(f => f.price === minPrice);
  const maxPriceHour = forecast.findIndex(f => f.price === maxPrice);

  return (
    <Layout title="Forecasts" subtitle="Energy price and carbon intensity predictions">
      <div className="mb-6 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={fetchForecast}
          disabled={loading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="Current Price"
          value={`€${currentPrice.toFixed(2)}`}
          subtitle="per MWh"
          icon={TrendingUp}
          variant="primary"
        />
        <StatsCard
          title="24h Average"
          value={`€${avgPrice.toFixed(2)}`}
          subtitle="per MWh"
          icon={TrendingUp}
        />
        <StatsCard
          title="Best Time"
          value={`${minPriceHour.toString().padStart(2, '0')}:00`}
          subtitle={`€${minPrice.toFixed(2)}/MWh`}
          icon={TrendingDown}
          variant="success"
        />
        <StatsCard
          title="Avg Carbon"
          value={`${avgCarbon.toFixed(0)}`}
          subtitle="gCO₂/kWh"
          icon={Leaf}
          variant="warning"
        />
      </div>

      {/* Chart */}
      <PriceChart data={forecast} />

      {/* Recommendations */}
      <div className="mt-6 glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Optimization Recommendations</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-success/10 border border-success/20 p-4">
            <div className="flex items-center gap-2 text-success mb-2">
              <TrendingDown className="h-5 w-5" />
              <span className="font-medium">Best for Heating</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Schedule heating between <strong className="text-foreground">{minPriceHour}:00-{(minPriceHour + 3) % 24}:00</strong> for lowest costs
            </p>
          </div>
          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
            <div className="flex items-center gap-2 text-warning mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">Avoid Peak</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Prices peak at <strong className="text-foreground">{maxPriceHour}:00</strong> — consider preheating before
            </p>
          </div>
          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Leaf className="h-5 w-5" />
              <span className="font-medium">Green Window</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Low carbon periods align with wind generation peaks overnight
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
