import { Toaster } from "@/components/ui/toaster";
import Trips from "./pages/Trips";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Splash from "./pages/Splash";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Booking from "./pages/Booking";
import Confirmation from "./pages/Confirmation";
import Profile from "./pages/Profile";
import BudgetTracker from "./pages/BudgetTracker";
import Approvals from "./pages/Approvals";
import NotFound from "./pages/NotFound";
import TravaxAgent from "./components/TravaxAgent";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

const queryClient = new QueryClient();

const App = () => {
  const [showAgent, setShowAgent] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Splash />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<Dashboard onOpenAgent={() => setShowAgent(true)} />} />
            <Route path="/booking/:type" element={<Booking onOpenAgent={() => setShowAgent(true)} />} />
            <Route path="/confirmation" element={<Confirmation />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/budget-tracker" element={<BudgetTracker />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global AI Assistant Button - Enhanced with glow */}
          <div className="fixed bottom-6 right-6 z-40">
            <div className="absolute inset-0 rounded-full bg-primary/40 blur-xl animate-pulse" />
            <Button
              onClick={() => setShowAgent(true)}
              className="relative w-auto h-14 px-5 rounded-full shadow-2xl bg-primary hover:bg-primary/90 gap-2"
              aria-label="Open Travax AI Assistant"
            >
              <Bot className="w-5 h-5 text-primary-foreground" />
              <span className="text-primary-foreground font-medium">AI</span>
            </Button>
          </div>

          {/* Global TravaxAgent Modal */}
          {showAgent && <TravaxAgent onClose={() => setShowAgent(false)} />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
