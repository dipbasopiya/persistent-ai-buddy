import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { JarvisProvider } from "@/contexts/JarvisContext";
import { MainLayout } from "@/components/layout/MainLayout";
import CommandCenter from "./pages/CommandCenter";
import ContextMonitor from "./pages/ContextMonitor";
import ProductivityCore from "./pages/ProductivityCore";
import IntelligenceHub from "./pages/IntelligenceHub";
import SystemConsole from "./pages/SystemConsole";
import AssistantPage from "./pages/AssistantPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <JarvisProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout>
              <Routes>
                <Route path="/" element={<CommandCenter />} />
                <Route path="/context" element={<ContextMonitor />} />
                <Route path="/productivity" element={<ProductivityCore />} />
                <Route path="/intelligence" element={<IntelligenceHub />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/console" element={<SystemConsole />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </JarvisProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
