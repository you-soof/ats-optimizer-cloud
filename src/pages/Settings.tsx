import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || 'http://localhost:8000');
  const [notifications, setNotifications] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);

  const handleSave = () => {
    // In a real app, this would persist to localStorage or a backend
    toast.success('Settings saved successfully');
  };

  return (
    <Layout title="Settings" subtitle="Configure your ATS Optimizer">
      <div className="max-w-2xl space-y-6">
        {/* API Configuration */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">API Configuration</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-url">Backend API URL</Label>
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="bg-secondary border-border font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The URL of your FastAPI backend server
              </p>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive alerts for demand response events
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-Optimize</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically adjust schedules based on price forecasts
                </p>
              </div>
              <Switch
                checked={autoOptimize}
                onCheckedChange={setAutoOptimize}
              />
            </div>
          </div>
        </div>

        {/* About */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">About</h2>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong className="text-foreground">ATS Optimizer</strong> - Adaptable Thermal System</p>
            <p>Version 1.0.0</p>
            <p>Optimize your heat pump operations based on electricity prices, carbon intensity, and comfort preferences.</p>
          </div>
        </div>

        <Button variant="gradient" onClick={handleSave} className="w-full">
          Save Settings
        </Button>
      </div>
    </Layout>
  );
}
