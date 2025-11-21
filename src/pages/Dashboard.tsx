import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plane, LogOut, Sparkles } from "lucide-react";
import TravaxAgent from "@/components/TravaxAgent";
import ExploreOptions from "@/components/ExploreOptions";
import heroImage from "@/assets/destination-beach.jpg";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [showAgent, setShowAgent] = useState(false);

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
      <header className="relative z-10 border-b border-border backdrop-blur-xl bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-primary opacity-30" />
              <Plane className="w-8 h-8 text-primary relative" strokeWidth={1.5} />
            </div>
            <h1 className="font-luxury text-2xl font-bold text-gradient-pastel">
              Travax
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-muted-foreground text-sm">
              {user.email}
            </span>
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
          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 animate-slide-up">
            {/* Travax AI Agent */}
            <button
              onClick={() => setShowAgent(true)}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] text-left shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <Sparkles className="w-12 h-12 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-luxury text-3xl font-bold text-foreground mb-2">
                  Travax AI Agent
                </h3>
                <p className="text-muted-foreground">
                  Let our AI assistant plan your perfect trip, optimize budgets, and handle all bookings
                </p>
              </div>
            </button>

            {/* Manual Explore */}
            <button
              onClick={() => {
                document.getElementById('explore-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 hover:border-secondary/40 transition-all duration-300 hover:scale-[1.02] text-left shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <Plane className="w-12 h-12 text-secondary mb-4" strokeWidth={1.5} />
                <h3 className="font-luxury text-3xl font-bold text-foreground mb-2">
                  Explore Manually
                </h3>
                <p className="text-muted-foreground">
                  Browse and book flights, hotels, visas, and activities at your own pace
                </p>
              </div>
            </button>
          </div>

          {/* Explore section */}
          <div id="explore-section" className="animate-scale-in">
            <ExploreOptions />
          </div>
        </div>
      </main>

      {/* Travax Agent Modal */}
      {showAgent && <TravaxAgent onClose={() => setShowAgent(false)} />}
    </div>
  );
};

export default Dashboard;
