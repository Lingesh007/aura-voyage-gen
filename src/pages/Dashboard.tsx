import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plane, LogOut, User, Wallet } from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import heroImage from "@/assets/destination-beach.jpg";

interface DashboardProps {
  onOpenAgent: () => void;
}

const Dashboard = ({ onOpenAgent }: DashboardProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }
      
      setUser(session.user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-card/90 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary opacity-40 animate-pulse" />
              <Plane className="w-8 h-8 text-primary relative" strokeWidth={1.5} />
            </div>
            <h1 className="font-luxury text-3xl font-bold text-gradient-pastel">
              Travax
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/profile")}
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/budget-tracker")}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Budget
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Hero section with destination image */}
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Tropical beach destination" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in px-4">
            <h2 className="font-luxury text-5xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4">
              Welcome to Your Travel Hub
            </h2>
            <p className="text-white/90 text-lg md:text-xl drop-shadow-lg">
              Plan, book, and manage your business travel with AI-powered assistance
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Explore section */}

          <div id="explore-section" className="animate-scale-in">
            <ExploreOptions onOpenAgent={onOpenAgent} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
