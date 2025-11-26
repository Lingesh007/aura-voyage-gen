import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plane, LogOut, User, Wallet, Users, Clock, DollarSign, FileCheck, TrendingUp } from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import heroImage from "@/assets/destination-beach.jpg";

interface CorporateDashboardProps {
  onOpenAgent: () => void;
  user: any;
}

const CorporateDashboard = ({ onOpenAgent, user }: CorporateDashboardProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const companyData = {
    name: "TechCorp International",
    employeesOnTrip: 12,
    totalEmployees: 450,
    activeTrips: [
      { employee: "Sarah Chen", destination: "Tokyo", purpose: "Client Meeting", departure: "2024-01-20", return: "2024-01-25" },
      { employee: "Michael Ross", destination: "London", purpose: "Conference", departure: "2024-01-18", return: "2024-01-22" },
      { employee: "Emily Watson", destination: "Dubai", purpose: "Partnership", departure: "2024-01-22", return: "2024-01-28" }
    ],
    budgetSpent: 145000,
    budgetTotal: 250000,
    visasPending: 3,
    visasApproved: 9,
    upcomingBookings: 8,
    avgTripDuration: 6
  };

  const budgetPercentage = (companyData.budgetSpent / companyData.budgetTotal) * 100;

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
            <div>
              <h1 className="font-luxury text-3xl font-bold text-gradient-pastel">
                Travax
              </h1>
              <p className="text-xs text-muted-foreground">{companyData.name}</p>
            </div>
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

      {/* Hero Banner */}
      <div className="relative h-[300px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Corporate travel excellence" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in px-4">
            <h2 className="font-luxury text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-2">
              Corporate Travel Command Center
            </h2>
            <p className="text-white/90 text-lg drop-shadow-lg">
              Enterprise discounts • Priority support • Streamlined approvals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Corporate Benefits Banner */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">25%</div>
                  <div className="text-sm text-muted-foreground">Avg. Discount</div>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
                <div className="text-center">
                  <FileCheck className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">Fast</div>
                  <div className="text-sm text-muted-foreground">Approvals</div>
                </div>
                <div className="text-center">
                  <DollarSign className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-2xl font-bold">Free</div>
                  <div className="text-sm text-muted-foreground">Forex</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Employees Traveling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{companyData.employeesOnTrip}</div>
                <p className="text-sm text-muted-foreground">of {companyData.totalEmployees} total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Avg. Trip Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{companyData.avgTripDuration} days</div>
                <p className="text-sm text-muted-foreground">{companyData.upcomingBookings} upcoming bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  Budget Utilized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">${(companyData.budgetSpent / 1000).toFixed(0)}K</div>
                <Progress value={budgetPercentage} className="mt-2" />
                <p className="text-sm text-muted-foreground mt-1">{budgetPercentage.toFixed(0)}% of ${(companyData.budgetTotal / 1000).toFixed(0)}K</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-primary" />
                  Visa Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{companyData.visasApproved}</div>
                <p className="text-sm text-muted-foreground">{companyData.visasPending} pending approval</p>
              </CardContent>
            </Card>
          </div>

          {/* Active Trips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="w-5 h-5 text-primary" />
                Active Business Trips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companyData.activeTrips.map((trip, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="font-semibold">{trip.employee}</div>
                      <div className="text-sm text-muted-foreground">{trip.destination} • {trip.purpose}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-medium">{trip.departure}</div>
                      <div className="text-muted-foreground">Return: {trip.return}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explore Options */}
          <div className="animate-scale-in">
            <ExploreOptions onOpenAgent={onOpenAgent} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default CorporateDashboard;
