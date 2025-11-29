import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Plane, LogOut, User, Wallet, Users, Clock, DollarSign, FileCheck, TrendingUp } from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import { GlobalSearch } from "@/components/GlobalSearch";
import { DashboardSearch } from "@/components/DashboardSearch";
import { BookingHistory } from "@/components/BookingHistory";
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

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Admin";
  
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
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Plane className="w-6 h-6 md:w-8 md:h-8 text-primary" strokeWidth={1.5} />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-primary">
                Travax
              </h1>
              <p className="text-xs text-muted-foreground hidden md:block">Welcome, {userName.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <GlobalSearch />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/profile")}
              className="hidden md:flex"
            >
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/budget-tracker")}
              className="hidden md:flex"
            >
              <Wallet className="w-4 h-4 mr-2" />
              Budget
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="relative h-[200px] md:h-[300px] overflow-hidden">
        <img 
          src={heroImage} 
          alt="Corporate travel excellence" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in px-4">
            <h2 className="text-3xl md:text-5xl font-bold text-white drop-shadow-2xl mb-2">
              Corporate Travel Command Center
            </h2>
            <p className="text-white/90 text-sm md:text-lg drop-shadow-lg">
              Enterprise discounts • Priority support • Streamlined approvals
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Dashboard Search */}
          <div className="animate-fade-in">
            <DashboardSearch />
          </div>

          {/* Corporate Benefits Banner */}
          <Card className="border bg-muted/30">
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

          {/* Key Metrics & Booking History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <div className="lg:col-span-1">
              <BookingHistory />
            </div>
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
