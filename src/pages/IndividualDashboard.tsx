import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, LogOut, User, Wallet, MapPin, Calendar, Award, TrendingUp, Globe, Gift } from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import heroImage from "@/assets/destination-beach.jpg";

interface IndividualDashboardProps {
  onOpenAgent: () => void;
  user: any;
}

const IndividualDashboard = ({ onOpenAgent, user }: IndividualDashboardProps) => {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const userData = {
    name: user?.user_metadata?.full_name || "Travel Enthusiast",
    upcomingTrips: [
      { destination: "Bali, Indonesia", date: "Feb 15-22, 2024", type: "Leisure", status: "Confirmed" },
      { destination: "Paris, France", date: "Mar 10-17, 2024", type: "City Break", status: "Pending" }
    ],
    recentSearches: [
      { destination: "Tokyo, Japan", date: "Apr 2024" },
      { destination: "Santorini, Greece", date: "May 2024" },
      { destination: "New York, USA", date: "Jun 2024" }
    ],
    trendingDestinations: [
      { name: "Maldives", discount: "30% off", season: "Peak Season" },
      { name: "Swiss Alps", discount: "25% off", season: "Winter Special" },
      { name: "Dubai", discount: "20% off", season: "Shopping Festival" }
    ],
    layoverPrograms: [
      { airport: "Singapore Changi", program: "Free City Tour", duration: "6+ hours" },
      { airport: "Dubai International", program: "Hotel Voucher", duration: "8+ hours" },
      { airport: "Doha Hamad", program: "Transit Hotel", duration: "4+ hours" }
    ],
    airlineOffers: [
      { airline: "Emirates", offer: "Business Class Upgrade", points: "50K miles" },
      { airline: "Singapore Airlines", offer: "Free Lounge Access", validity: "All flights" },
      { airline: "Qatar Airways", offer: "Extra Baggage", validity: "Valid 3 months" }
    ]
  };

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
              <p className="text-xs text-muted-foreground">Welcome, {userData.name.split(' ')[0]}</p>
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
          alt="Your next adventure awaits" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-fade-in px-4">
            <h2 className="font-luxury text-4xl md:text-5xl font-bold text-white drop-shadow-2xl mb-2">
              Your Personal Travel Hub
            </h2>
            <p className="text-white/90 text-lg drop-shadow-lg">
              Exclusive offers • Layover perks • Smart itineraries
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Travel Perks Banner */}
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <Gift className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">Layover</div>
                  <div className="text-sm text-muted-foreground">Free Tours</div>
                </div>
                <div className="text-center">
                  <Award className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">Miles</div>
                  <div className="text-sm text-muted-foreground">Rewards</div>
                </div>
                <div className="text-center">
                  <TrendingUp className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">30%</div>
                  <div className="text-sm text-muted-foreground">Off Deals</div>
                </div>
                <div className="text-center">
                  <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
                  <div className="text-xl font-bold">200+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Trips & Recent Searches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Trips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.upcomingTrips.map((trip, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-semibold">{trip.destination}</div>
                      <Badge variant={trip.status === "Confirmed" ? "default" : "secondary"}>
                        {trip.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{trip.date}</div>
                    <div className="text-sm text-primary mt-1">{trip.type}</div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Recent Searches
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.recentSearches.map((search, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors cursor-pointer">
                    <div className="font-semibold">{search.destination}</div>
                    <div className="text-sm text-muted-foreground">{search.date}</div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Trending Destinations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending Destinations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.trendingDestinations.map((dest, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-all hover:scale-105 cursor-pointer">
                    <div className="font-semibold text-lg mb-2">{dest.name}</div>
                    <Badge className="mb-2">{dest.discount}</Badge>
                    <div className="text-sm text-muted-foreground">{dest.season}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Layover Programs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-primary" />
                Smart Layover Programs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.layoverPrograms.map((program, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                    <div className="font-semibold mb-1">{program.airport}</div>
                    <div className="text-sm text-primary mb-1">{program.program}</div>
                    <div className="text-xs text-muted-foreground">{program.duration} layover</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Airline Offers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Exclusive Airline Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userData.airlineOffers.map((offer, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                    <div>
                      <div className="font-semibold">{offer.airline}</div>
                      <div className="text-sm text-primary">{offer.offer}</div>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      {offer.points || offer.validity}
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

export default IndividualDashboard;
