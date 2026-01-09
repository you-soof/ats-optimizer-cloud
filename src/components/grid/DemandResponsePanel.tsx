import { useState } from 'react';
import { Zap, AlertTriangle, Clock, Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api, DemandResponseResponse } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export function DemandResponsePanel() {
  const [duration, setDuration] = useState(15);
  const [severity, setSeverity] = useState<'normal' | 'high' | 'critical'>('normal');
  const [isTriggering, setIsTriggering] = useState(false);
  const [result, setResult] = useState<DemandResponseResponse | null>(null);

  const handleTrigger = async () => {
    setIsTriggering(true);
    try {
      const response = await api.triggerDemandResponse({
        duration_minutes: duration,
        severity,
        affected_areas: ['FI'],
      });
      setResult(response);
      toast.success('Demand response event triggered!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to trigger event');
    } finally {
      setIsTriggering(false);
    }
  };

  const getSeverityColor = () => {
    switch (severity) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-warning';
      default: return 'text-primary';
    }
  };

  return (
    <div className="glass-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Zap className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Demand Response Control</h3>
          <p className="text-sm text-muted-foreground">Trigger grid balancing events</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Duration
            </Label>
            <span className="text-sm font-mono text-foreground">{duration} min</span>
          </div>
          <Slider
            value={[duration]}
            onValueChange={([value]) => setDuration(value)}
            min={5}
            max={60}
            step={5}
            className="py-2"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            Severity Level
          </Label>
          <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
            <SelectTrigger className="bg-secondary border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary" />
                  Normal
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-warning" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  Critical
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="gradient"
          className="w-full"
          onClick={handleTrigger}
          disabled={isTriggering}
        >
          {isTriggering ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Triggering...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Trigger Event
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="rounded-lg bg-secondary/50 p-4 space-y-3 animate-scale-in">
          <h4 className="font-medium text-foreground">Event Created</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Event ID</p>
              <p className="font-mono text-foreground">{result.event_id}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Participants</p>
              <p className="flex items-center gap-1 text-foreground">
                <Users className="h-4 w-4" />
                {result.participants}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-muted-foreground">Estimated Reduction</p>
              <p className={cn("text-lg font-semibold", getSeverityColor())}>
                {result.estimated_reduction_kw.toFixed(1)} kW
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
