import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import DeviceList from "./pages/DeviceList";
import DeviceDetail from "./pages/DeviceDetail";
import RegisterDevice from "./pages/RegisterDevice";
import Forecasts from "./pages/Forecasts";
import GridControl from "./pages/GridControl";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/devices" element={<DeviceList />} />
          <Route path="/devices/:deviceId" element={<DeviceDetail />} />
          <Route path="/register" element={<RegisterDevice />} />
          <Route path="/forecasts" element={<Forecasts />} />
          <Route path="/grid" element={<GridControl />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
