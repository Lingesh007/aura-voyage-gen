import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Sparkles, Bot, ArrowRight } from "lucide-react";
import ExploreOptions from "@/components/ExploreOptions";
import { BookingHistory } from "@/components/BookingHistory";
import DashboardNav from "@/components/dashboard/DashboardNav";
import HeroSection from "@/components/dashboard/HeroSection";
import QuickActions from "@/components/dashboard/QuickActions";

interface IndividualDashboardProps {
  onOpenAgent: () => void;
  user: any;
}

const IndividualDashboard = ({ onOpenAgent, user }: IndividualDashboardProps) => {
  const navigate = useNavigate();

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Travel Enthusiast";

  const userData = {
    upcomingTrips: [
      { 
        destination: "Bali, Indonesia", 
        date: "Feb 15-22, 2024", 
        type: "Leisure", 
        status: "Confirmed",
        daysUntil: 10,
        budget: "$2,400",
        budgetUsed: "$1,800"
      },
      { 
        destination: "Paris, France", 
        date: "Mar 10-17, 2024", 
        type: "City Break", 
        status: "Pending",
        daysUntil: 34,
        budget: "$3,200",
        budgetUsed: "$0"
      }
    ],
    recentSearches: [
      { destination: "Tokyo, Japan", date: "Apr 2024", image: "🗼", price: "$1,200" },
      { destination: "Santorini, Greece", date: "May 2024", image: "🏛️", price: "$1,800" },
      { destination: "New York, USA", date: "Jun 2024", image: "🗽", price: "$950" }
    ],
    recommendedTrips: [
      { destination: "Dubai", discount: "20% off", reason: "Based on your searches", price: "$1,450" },
      { destination: "Maldives", discount: "30% off", reason: "Peak season special", price: "$2,100" },
      { destination: "Swiss Alps", discount: "25% off", reason: "Winter getaway", price: "$1,800" }
    ],
    aiInsights: [
      "Flight prices to Tokyo dropped 12% today",
      "Best time to book Bali: 3 weeks before departure",
      "You could save $340 by flying on Tuesday instead"
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <DashboardNav 
        userName={userName} 
        userType="individual" 
        onOpenAgent={onOpenAgent} 
      />

      {/* Hero Section */}
      <HeroSection userType="individual" onOpenAgent={onOpenAgent} />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-8">

          {/* Quick Actions */}
          <section className="animate-fade-in">
            <QuickActions userType="individual" onOpenAgent={onOpenAgent} />
          </section>

          {/* AI Insights Banner */}
          <Card className="bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-primary/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-sm">AI Insights for You</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {userData.aiInsights.map((insight, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-background/50 text-foreground font-normal"
                  >
                    <Sparkles className="w-3 h-3 mr-1 text-primary" />
                    {insight}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Trips & Booking History */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Upcoming Trips
                  </span>
                  <Button variant="ghost" size="sm" onClick={() => navigate("/booking/flights")}>
                    + New Trip
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {userData.upcomingTrips.length > 0 ? (
                  userData.upcomingTrips.map((trip, index) => (
                    <div 
                      key={index} 
                      className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-semibold text-lg">{trip.destination}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {trip.daysUntil} days to departure
                          </div>
                        </div>
                        <Badge variant={trip.status === "Confirmed" ? "default" : "secondary"}>
                          {trip.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">{trip.date}</div>
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                        <span className="text-xs text-muted-foreground">
                          Budget: {trip.budgetUsed} / {trip.budget}
                        </span>
                        <Badge variant="outline" className="text-xs">{trip.type}</Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Bot className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground mb-2">No trips yet — want me to plan your first itinerary?</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Try: "Plan me a 5-day Japan trip under $2,000"
                    </p>
                    <Button onClick={onOpenAgent} className="gap-2">
                      <Bot className="w-4 h-4" />
                      Plan Your First Trip with AI
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <BookingHistory />
          </div>

          {/* Recent Searches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Recent Searches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.recentSearches.map((search, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{search.image}</span>
                      <div>
                        <div className="font-semibold">{search.destination}</div>
                        <div className="text-sm text-muted-foreground">{search.date}</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
                      <span className="text-sm font-medium text-primary">{search.price}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={onOpenAgent}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Replan with AI
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommended for You */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userData.recommendedTrips.map((trip, index) => (
                  <div 
                    key={index} 
                    className="p-4 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-accent/30 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <Badge className="absolute top-2 right-2 bg-green-500/90">{trip.discount}</Badge>
                    <div className="font-semibold text-lg mb-1">{trip.destination}</div>
                    <div className="text-sm text-muted-foreground mb-3">{trip.reason}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">from {trip.price}</span>
                      <Button variant="ghost" size="sm" onClick={onOpenAgent}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Explore Options */}
          <section className="animate-scale-in">
            <ExploreOptions onOpenAgent={onOpenAgent} />
          </section>
        </div>
      </main>
    </div>
  );
};

export default IndividualDashboard;
