import { useNavigate } from 'react-router-dom';
import { Thermometer, MapPin, Zap, ChevronRight } from 'lucide-react';
import { Device } from '@/lib/api';
import { cn } from '@/lib/utils';

interface DeviceCardProps {
  device: Device;
  currentAction?: {
    mode: string;
    target_temp: number;
    current_temp: number;
  };
}

export function DeviceCard({ device, currentAction }: DeviceCardProps) {
  const navigate = useNavigate();

  const getModeColor = (mode?: string) => {
    switch (mode?.toLowerCase()) {
      case 'heating': return 'text-warning';
      case 'cooling': return 'text-primary';
      case 'idle': return 'text-muted-foreground';
      case 'eco': return 'text-success';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusColor = (mode?: string) => {
    switch (mode?.toLowerCase()) {
      case 'heating': return 'status-heating';
      case 'cooling': return 'bg-primary';
      case 'eco': return 'status-active';
      default: return 'status-idle';
    }
  };
  
  
  return (
    <div 
      className="glass-card group cursor-pointer p-5 transition-all duration-300 hover:border-primary/30 hover:shadow-lg animate-slide-up"
      onClick={() => navigate(`/devices/${device.device_id}`)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Thermometer className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground">{device.name}</h3>
              <div className={cn("status-indicator", getStatusColor(currentAction?.mode))} />
            </div>
            <p className="text-sm text-muted-foreground font-mono">{device.device_id}</p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3.5 w-3.5" />
            <span>Status</span>
          </div>
          <p className={cn("mt-1 text-sm font-semibold capitalize", getModeColor(currentAction?.mode))}>
            {currentAction?.mode || 'Unknown'}
          </p>
        </div>
        <div className="rounded-lg bg-secondary/50 p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Thermometer className="h-3.5 w-3.5" />
            <span>Temperature</span>
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">
            {currentAction?.current_temp?.toFixed(1) || '--'}°C
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <MapPin className="h-3.5 w-3.5" />
        <span>{device.latitude.toFixed(2)}°N, {device.longitude.toFixed(2)}°E</span>
      </div>
    </div>
  );
}
