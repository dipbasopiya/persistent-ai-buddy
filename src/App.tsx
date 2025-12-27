import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JarvisProvider } from "@/contexts/JarvisContext";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import TemperaturePage from "./pages/TemperaturePage";
import AlertsPage from "./pages/AlertsPage";
import TasksPage from "./pages/TasksPage";
import ProgressPage from "./pages/ProgressPage";
import DecisionsPage from "./pages/DecisionsPage";
import DevicesPage from "./pages/DevicesPage";
import LogsPage from "./pages/LogsPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <JarvisProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/temperature" element={<TemperaturePage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/decisions" element={<DecisionsPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/logs" element={<LogsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MainLayout>
        </BrowserRouter>
      </JarvisProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
