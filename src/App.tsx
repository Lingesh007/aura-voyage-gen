import { Toaster } from "@/components/ui/toaster";
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
import NotFound from "./pages/NotFound";
import TravaxAgent from "./components/TravaxAgent";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

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
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Global AI Assistant Button */}
          <Button
            onClick={() => setShowAgent(true)}
            className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-2xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 p-0 animate-pulse"
            aria-label="Open Travax AI Assistant"
          >
            <Sparkles className="w-6 h-6 text-primary-foreground" />
          </Button>

          {/* Global TravaxAgent Modal */}
          {showAgent && <TravaxAgent onClose={() => setShowAgent(false)} />}
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
