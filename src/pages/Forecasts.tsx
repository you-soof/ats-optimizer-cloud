import { PriceChart } from "@/components/charts/PriceChart";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { api, PriceCarbonForecast } from "@/lib/api";
import { Leaf, RefreshCw, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export default function Forecasts() {
  const [forecast, setForecast] = useState<PriceCarbonForecast[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchForecast = async () => {
    setLoading(true);
    try {
      const data = await api.getPriceCarbonForecast();
      setForecast(data.forecast);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
  }, []);

  const prices = forecast.map((f) => f.price_eur_mwh);
  const winds = forecast.map((f) => f.wind_percentage);

  const currentPrice = prices[0] || 0;
  const avgPrice =
    prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const avgWind =
    winds.length > 0 ? winds.reduce((a, b) => a + b, 0) / winds.length : 0;

  const minPriceHour = forecast.findIndex((f) => f.price_eur_mwh === minPrice);
  const maxPriceHour = forecast.findIndex((f) => f.price_eur_mwh === maxPrice);
  const maxWindHour = forecast.findIndex(
    (f) => f.wind_percentage === Math.max(...winds)
  );

  return (
    <Layout
      title="Forecasts"
      subtitle="24-hour energy price and wind generation forecast"
    >
      {/* Header with Refresh */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {forecast.length > 0
              ? `Last updated: ${new Date(
                  forecast[0]?.timestamp
                ).toLocaleTimeString()}`
              : "Loading forecast data..."}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchForecast}
          disabled={loading}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {forecast.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-muted-foreground">No forecast data available</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
              title="Best Price Time"
              value={`${minPriceHour.toString().padStart(2, "0")}:00`}
              subtitle={`€${minPrice.toFixed(2)}/MWh`}
              icon={TrendingDown}
              variant="success"
            />
            <StatsCard
              title="Avg Wind"
              value={`${avgWind.toFixed(0)}%`}
              subtitle="generation"
              icon={Leaf}
              variant="warning"
            />
          </div>

          {/* Chart */}
          <PriceChart data={forecast} />

          {/* Smart Recommendations Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Smart Scheduling Recommendations
            </h2>
            <div className="grid gap-5 md:grid-cols-3">
              {/* Best Time for Heating */}
              <div className="glass-card border-l-4 border-l-green-500 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-green-500/10 p-3">
                    <TrendingDown className="h-6 w-6 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Best for Heating
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Schedule heating operations during the lowest price window
                      to minimize energy costs.
                    </p>
                    <div className="rounded bg-green-500/5 p-2 border border-green-500/20">
                      <p className="text-sm font-mono">
                        <strong className="text-green-500">
                          {minPriceHour.toString().padStart(2, "0")}:00 -{" "}
                          {((minPriceHour + 3) % 24)
                            .toString()
                            .padStart(2, "0")}
                          :00
                        </strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Saves ~€{((maxPrice - minPrice) * 1.5).toFixed(2)} vs
                        peak pricing
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Peak Hours to Avoid */}
              <div className="glass-card border-l-4 border-l-red-500 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-red-500/10 p-3">
                    <TrendingUp className="h-6 w-6 text-red-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Peak Hours - Avoid
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Prices are at their highest during this window. Consider
                      pre-heating before peak.
                    </p>
                    <div className="rounded bg-red-500/5 p-2 border border-red-500/20">
                      <p className="text-sm font-mono">
                        <strong className="text-red-500">
                          {maxPriceHour.toString().padStart(2, "0")}:00
                        </strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Peak price: €{maxPrice.toFixed(2)}/MWh
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wind Generation Peak */}
              <div className="glass-card border-l-4 border-l-blue-500 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <Leaf className="h-6 w-6 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-2">
                      Greenest Energy
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Highest wind generation ensures renewable energy is
                      available in the grid.
                    </p>
                    <div className="rounded bg-blue-500/5 p-2 border border-blue-500/20">
                      <p className="text-sm font-mono">
                        <strong className="text-blue-500">
                          {maxWindHour.toString().padStart(2, "0")}:00
                        </strong>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.max(...winds).toFixed(0)}% wind generation
                        capacity
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hourly Breakdown Table */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              24-Hour Forecast Details
            </h2>
            <div className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-muted-foreground/20">
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Hour
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Price (€/MWh)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Wind (%)
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {forecast.slice(0, 12).map((item, idx) => {
                      const hour = new Date(item.timestamp).getHours();
                      const isLowest = item.price_eur_mwh === minPrice;
                      const isHighest = item.price_eur_mwh === maxPrice;
                      const isHighWind = item.wind_percentage > 70;

                      return (
                        <tr
                          key={idx}
                          className="border-b border-muted-foreground/10 hover:bg-muted/50 transition-colors"
                        >
                          <td className="px-4 py-3 font-mono text-foreground font-semibold">
                            {hour.toString().padStart(2, "0")}:00
                          </td>
                          <td className="px-4 py-3 font-mono">
                            <span
                              className={
                                isLowest
                                  ? "text-green-500 font-bold"
                                  : isHighest
                                  ? "text-red-500 font-bold"
                                  : "text-foreground"
                              }
                            >
                              €{item.price_eur_mwh.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono">
                            <span
                              className={
                                isHighWind
                                  ? "text-blue-500 font-bold"
                                  : "text-foreground"
                              }
                            >
                              {item.wind_percentage.toFixed(0)}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              {isLowest && (
                                <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs font-medium text-green-500">
                                  Lowest
                                </span>
                              )}
                              {isHighest && (
                                <span className="rounded-full bg-red-500/20 px-2 py-1 text-xs font-medium text-red-500">
                                  Peak
                                </span>
                              )}
                              {isHighWind && (
                                <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-500">
                                  Green
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}
