const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types matching FastAPI models
export type InsulationLevel = 'poor' | 'average' | 'good' | 'excellent';
export type HeatPumpType = 'air_source' | 'ground_source' | 'water_source' | 'hybrid';

export interface DeviceRegistration {
  device_id: string;
  name: string;
  latitude: number;
  longitude: number;
  insulation_level: InsulationLevel;
  floor_area: number;
  volume: number;
  heat_pump_type: HeatPumpType;
  rated_power: number;
  cop_rating: number;
  comfort_min_temp: number;
  comfort_max_temp: number;
  vpp_enabled: boolean;
}

export interface Device extends DeviceRegistration {
  id: number;
  created_at: string;
  updated_at: string;
}

export interface DailyPlanRequest {
  device_id: string;
  target_date?: string;
}

export interface HourlyAction {
  hour: number;
  mode: string;
  target_temp: number;
  reason: string;
  price?: number;
  carbon?: number;
}

export interface DailyPlanResponse {
  device_id: string;
  date: string;
  hourly_actions: HourlyAction[];
  estimated_cost: number;
  estimated_carbon: number;
}

export interface ComfortRiskRequest {
  device_id: string;
  proposed_schedule: Array<{ hour: number; mode: string }>;
}

export interface ComfortRiskResponse {
  risk_level: string;
  risk_hours: number[];
  recommendations: string[];
}

export interface DemandResponseRequest {
  duration_minutes: number;
  severity: 'normal' | 'high' | 'critical';
  affected_areas: string[];
}

export interface DemandResponseResponse {
  event_id: string;
  participants: number;
  estimated_reduction_kw: number;
}

export interface PriceCarbonForecast {
  timestamp: string;
  price: number;
  carbon_intensity: number;
}

export interface CurrentAction {
  device_id: string;
  mode: string;
  target_temp: number;
  current_temp: number;
  reason: string;
  next_change: string;
}

// API functions
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Devices
  registerDevice: (data: DeviceRegistration) =>
    fetchAPI<Device>('/devices/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDevice: (deviceId: string) =>
    fetchAPI<Device>(`/devices/${deviceId}`),

  listDevices: () =>
    fetchAPI<Device[]>('/devices'),

  // Strategy
  getDailyPlan: (data: DailyPlanRequest) =>
    fetchAPI<DailyPlanResponse>('/strategy/daily-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentAction: (deviceId: string) =>
    fetchAPI<CurrentAction>(`/strategy/current-action/${deviceId}`),

  // Analytics
  analyzeComfortRisk: (data: ComfortRiskRequest) =>
    fetchAPI<ComfortRiskResponse>('/analytics/comfort-risk', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Grid
  triggerDemandResponse: (data: DemandResponseRequest) =>
    fetchAPI<DemandResponseResponse>('/grid/demand-response', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Forecasts
  getPriceCarbonForecast: () =>
    fetchAPI<PriceCarbonForecast[]>('/forecasts/price-carbon'),
};
