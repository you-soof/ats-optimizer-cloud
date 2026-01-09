import { Layout } from '@/components/layout/Layout';
import { DemandResponsePanel } from '@/components/grid/DemandResponsePanel';
import { Zap, Users, Activity, Clock } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';

export default function GridControl() {
  return (
    <Layout title="Grid Control" subtitle="Manage demand response and virtual power plant">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatsCard
          title="VPP Devices"
          value={12}
          subtitle="Participating in grid"
          icon={Zap}
          variant="primary"
        />
        <StatsCard
          title="Total Capacity"
          value="84 kW"
          subtitle="Available for DR"
          icon={Activity}
          variant="success"
        />
        <StatsCard
          title="Active Events"
          value={0}
          subtitle="Currently running"
          icon={Clock}
        />
        <StatsCard
          title="Participants"
          value={8}
          subtitle="Last event"
          icon={Users}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Demand Response Panel */}
        <DemandResponsePanel />

        {/* Recent Events */}
        <div className="glass-card p-6">
          <h3 className="font-semibold text-foreground mb-4">Recent Events</h3>
          <div className="space-y-3">
            {[
              { id: 'DR-001', time: '2h ago', duration: '15 min', severity: 'normal', reduction: 42 },
              { id: 'DR-002', time: '6h ago', duration: '30 min', severity: 'high', reduction: 68 },
              { id: 'DR-003', time: '1d ago', duration: '20 min', severity: 'normal', reduction: 35 },
            ].map((event) => (
              <div key={event.id} className="flex items-center justify-between rounded-lg bg-secondary/50 p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${
                    event.severity === 'high' ? 'bg-warning' : 
                    event.severity === 'critical' ? 'bg-destructive' : 'bg-primary'
                  }`} />
                  <div>
                    <p className="font-mono text-sm text-foreground">{event.id}</p>
                    <p className="text-xs text-muted-foreground">{event.time} • {event.duration}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">-{event.reduction} kW</p>
                  <p className="text-xs text-muted-foreground capitalize">{event.severity}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 glass-card p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">About Virtual Power Plant</h3>
        <div className="prose prose-sm prose-invert max-w-none">
          <p className="text-muted-foreground">
            The Virtual Power Plant (VPP) aggregates your heat pumps to provide grid balancing services. 
            When enabled, devices can participate in demand response events, temporarily adjusting their 
            operation to help stabilize the electrical grid during peak demand or supply fluctuations.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium text-foreground">Normal Events</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Minor adjustments within comfort range. Minimal impact on users.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium text-foreground">High Priority</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Larger reductions needed. May temporarily affect comfort.
              </p>
            </div>
            <div className="rounded-lg bg-secondary/50 p-4">
              <h4 className="font-medium text-foreground">Critical Events</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Emergency grid support. Maximum flexibility requested.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
