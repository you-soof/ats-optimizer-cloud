import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { api, InsulationLevel, HeatPumpType } from '@/lib/api';
import { toast } from 'sonner';

const deviceSchema = z
  .object({
    device_id: z.string().min(1, "Device ID is required").max(50),
    name: z.string().min(1, "Name is required").max(100),
    latitude: z
      .number()
      .min(59)
      .max(71, "Latitude must be in Finland range (59-71)"),
    longitude: z
      .number()
      .min(19)
      .max(32, "Longitude must be in Finland range (19-32)"),
    insulation_level: z.enum(["low" , "medium" , "high"]),
    floor_area: z.number().min(1).max(500, "Floor area must be 1-500 m²"),
    volume: z.number().min(1).max(1500, "Volume must be 1-1500 m³"),
    heat_pump_type: z.enum(["GSHP", "ASHP"]),
    rated_power: z.number().min(1).max(50, "Rated power must be 1-50 kW"),
    cop_rating: z.number().min(2).max(5).default(3.5),
    comfort_min_temp: z.number().min(15).max(20).default(18),
    comfort_max_temp: z.number().min(20).max(26).default(24),
    vpp_enabled: z.boolean().default(false),
  })
  .refine((data) => data.comfort_max_temp > data.comfort_min_temp, {
    message: "Max temperature must be greater than min temperature",
    path: ["comfort_max_temp"],
  });

type DeviceFormData = z.infer<typeof deviceSchema>;

export function DeviceRegistrationForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DeviceFormData>({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      cop_rating: 3.5,
      comfort_min_temp: 18,
      comfort_max_temp: 24,
      vpp_enabled: false,
    },
  });

  const vppEnabled = watch('vpp_enabled');

  const onSubmit = async (data: DeviceFormData) => {
    setIsSubmitting(true);
    try {
      // Cast to DeviceRegistration since zod validated all required fields
      await api.registerDevice(data as import('@/lib/api').DeviceRegistration);
      toast.success('Device registered successfully!', {
        icon: <CheckCircle className="h-4 w-4 text-success" />,
      });
      navigate('/devices');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to register device');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Basic Information
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="device_id">Device ID</Label>
            <Input
              id="device_id"
              placeholder="e.g., HP-001"
              {...register("device_id")}
              className="bg-secondary border-border"
            />
            {errors.device_id && (
              <p className="text-xs text-destructive">
                {errors.device_id.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Device Name</Label>
            <Input
              id="name"
              placeholder="e.g., Living Room Heat Pump"
              {...register("name")}
              className="bg-secondary border-border"
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Location (Finland)
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">Latitude (59-71°N)</Label>
            <Input
              id="latitude"
              type="number"
              step="0.0001"
              placeholder="e.g., 60.1699"
              {...register("latitude", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.latitude && (
              <p className="text-xs text-destructive">
                {errors.latitude.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">Longitude (19-32°E)</Label>
            <Input
              id="longitude"
              type="number"
              step="0.0001"
              placeholder="e.g., 24.9384"
              {...register("longitude", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.longitude && (
              <p className="text-xs text-destructive">
                {errors.longitude.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Building Properties */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Building Properties
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Insulation Level</Label>
            <Select
              onValueChange={(value) =>
                setValue("insulation_level", value as InsulationLevel)
              }
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            {errors.insulation_level && (
              <p className="text-xs text-destructive">
                {errors.insulation_level.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="floor_area">Floor Area (m²)</Label>
            <Input
              id="floor_area"
              type="number"
              step="0.1"
              placeholder="e.g., 120"
              {...register("floor_area", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.floor_area && (
              <p className="text-xs text-destructive">
                {errors.floor_area.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="volume">Volume (m³)</Label>
            <Input
              id="volume"
              type="number"
              step="0.1"
              placeholder="e.g., 300"
              {...register("volume", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.volume && (
              <p className="text-xs text-destructive">
                {errors.volume.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Heat Pump Configuration */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Heat Pump Configuration
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label>Heat Pump Type</Label>
            <Select
              onValueChange={(value) =>
                setValue("heat_pump_type", value as HeatPumpType)
              }
            >
              <SelectTrigger className="bg-secondary border-border">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GSHP">GSHP</SelectItem>
                <SelectItem value="ASHP">ASHP</SelectItem>
              </SelectContent>
            </Select>
            {errors.heat_pump_type && (
              <p className="text-xs text-destructive">
                {errors.heat_pump_type.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="rated_power">Rated Power (kW)</Label>
            <Input
              id="rated_power"
              type="number"
              step="0.1"
              placeholder="e.g., 8.5"
              {...register("rated_power", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.rated_power && (
              <p className="text-xs text-destructive">
                {errors.rated_power.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="cop_rating">COP Rating (2.0-5.0)</Label>
            <Input
              id="cop_rating"
              type="number"
              step="0.1"
              placeholder="e.g., 3.5"
              {...register("cop_rating", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.cop_rating && (
              <p className="text-xs text-destructive">
                {errors.cop_rating.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Comfort Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Comfort Settings
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="comfort_min_temp">Min Comfort Temp (°C)</Label>
            <Input
              id="comfort_min_temp"
              type="number"
              step="0.5"
              {...register("comfort_min_temp", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.comfort_min_temp && (
              <p className="text-xs text-destructive">
                {errors.comfort_min_temp.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="comfort_max_temp">Max Comfort Temp (°C)</Label>
            <Input
              id="comfort_max_temp"
              type="number"
              step="0.5"
              {...register("comfort_max_temp", { valueAsNumber: true })}
              className="bg-secondary border-border"
            />
            {errors.comfort_max_temp && (
              <p className="text-xs text-destructive">
                {errors.comfort_max_temp.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* VPP Settings */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Virtual Power Plant
            </h2>
            <p className="text-sm text-muted-foreground">
              Enable this device to participate in grid demand response events
            </p>
          </div>
          <Switch
            checked={vppEnabled}
            onCheckedChange={(checked) => setValue("vpp_enabled", checked)}
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/devices")}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="gradient"
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Register Device
        </Button>
      </div>
    </form>
  );
}
