import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plane, LogOut, Sparkles } from "lucide-react";
import TravaxAgent from "@/components/TravaxAgent";
import ExploreOptions from "@/components/ExploreOptions";

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
      <div className="min-h-screen bg-luxury-charcoal flex items-center justify-center">
        <div className="text-luxury-gold animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-charcoal relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-charcoal via-luxury-navy to-luxury-slate opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-luxury-slate/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-luxury-gold opacity-30" />
              <Plane className="w-8 h-8 text-luxury-gold relative" strokeWidth={1.5} />
            </div>
            <h1 className="font-luxury text-2xl font-bold text-gradient-gold">
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
              className="border-luxury-slate hover:bg-luxury-slate/20"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome section */}
          <div className="mb-12 text-center animate-fade-in">
            <h2 className="font-luxury text-5xl font-bold text-gradient-gold mb-4">
              Welcome to Your Travel Hub
            </h2>
            <p className="text-muted-foreground text-lg">
              Plan, book, and manage your business travel with AI-powered assistance
            </p>
          </div>

          {/* Action cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12 animate-slide-up">
            {/* Travax AI Agent */}
            <button
              onClick={() => setShowAgent(true)}
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-luxury-gold/10 to-luxury-gold/5 border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all duration-300 hover:scale-[1.02] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-gold/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <Sparkles className="w-12 h-12 text-luxury-gold mb-4" strokeWidth={1.5} />
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
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-luxury-slate/30 to-luxury-navy/20 border border-luxury-slate/40 hover:border-luxury-slate/60 transition-all duration-300 hover:scale-[1.02] text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-luxury-slate/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              <div className="relative">
                <Plane className="w-12 h-12 text-foreground mb-4" strokeWidth={1.5} />
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
