import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plane, Calendar, MapPin, User, TrendingUp, Globe, Award, DollarSign, Clock, Star, Briefcase, Hotel, Car } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  type: string;
  destination: string;
  date: string;
  status: "confirmed" | "pending" | "completed";
  price: string;
}

interface StatDetail {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description: string;
  breakdown?: { label: string; value: string | number }[];
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [selectedStat, setSelectedStat] = useState<StatDetail | null>(null);
  
  const stats = {
    tripsThisYear: 12,
    kilometresTraveled: 48750,
    countriesVisited: 8,
    totalSpent: 32500
  };

  const statDetails: Record<string, StatDetail> = {
    trips: {
      title: "Trips This Year",
      value: stats.tripsThisYear,
      icon: <Award className="w-8 h-8 text-primary" />,
      description: "Your travel activity breakdown for 2024",
      breakdown: [
        { label: "Business Trips", value: 7 },
        { label: "Leisure Trips", value: 5 },
        { label: "Domestic Flights", value: 4 },
        { label: "International Flights", value: 8 },
        { label: "Average Trip Duration", value: "4.2 days" },
        { label: "Most Visited City", value: "Dubai" }
      ]
    },
    kilometers: {
      title: "Kilometers Traveled",
      value: stats.kilometresTraveled.toLocaleString(),
      icon: <Globe className="w-8 h-8 text-secondary" />,
      description: "Total distance covered across all trips",
      breakdown: [
        { label: "By Air", value: "42,500 km" },
        { label: "By Ground", value: "6,250 km" },
        { label: "Longest Flight", value: "Dubai to Tokyo (7,950 km)" },
        { label: "Average per Trip", value: "4,062 km" },
        { label: "Carbon Offset", value: "2.4 tons CO₂" },
        { label: "Flight Hours", value: "~58 hours" }
      ]
    },
    countries: {
      title: "Countries Visited",
      value: stats.countriesVisited,
      icon: <MapPin className="w-8 h-8 text-accent" />,
      description: "Destinations explored this year",
      breakdown: [
        { label: "Japan", value: "3 visits" },
        { label: "UAE", value: "2 visits" },
        { label: "Singapore", value: "2 visits" },
        { label: "UK", value: "2 visits" },
        { label: "France", value: "1 visit" },
        { label: "New Countries", value: "3 this year" }
      ]
    },
    spent: {
      title: "Total Spent",
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: <TrendingUp className="w-8 h-8 text-destructive" />,
      description: "Travel expenditure summary",
      breakdown: [
        { label: "Flights", value: "$18,500" },
        { label: "Hotels", value: "$9,200" },
        { label: "Activities", value: "$2,800" },
        { label: "Transportation", value: "$1,500" },
        { label: "Visas & Fees", value: "$500" },
        { label: "Avg. per Trip", value: "$2,708" }
      ]
    }
  };

  const travelerInfo = {
    memberSince: "January 2023",
    loyaltyTier: "Gold",
    preferredAirline: "Emirates",
    preferredHotel: "Marriott",
    upcomingMilestone: "Platinum at 15 trips",
    savedAmount: "$4,250"
  };

  const [upcomingTrips] = useState<Booking[]>([
    {
      id: "TVX-ABC123",
      type: "Flight",
      destination: "Tokyo, Japan",
      date: "2024-12-15",
      status: "confirmed",
      price: "$1,250"
    },
    {
      id: "TVX-DEF456",
      type: "Hotel",
      destination: "Singapore",
      date: "2024-12-20",
      status: "confirmed",
      price: "$850"
    }
  ]);

  const [recentTrips] = useState<Booking[]>([
    {
      id: "TVX-GHI789",
      type: "Flight",
      destination: "London, UK",
      date: "2024-11-10",
      status: "completed",
      price: "$980"
    },
    {
      id: "TVX-JKL012",
      type: "Hotel",
      destination: "Paris, France",
      date: "2024-11-05",
      status: "completed",
      price: "$1,120"
    },
    {
      id: "TVX-MNO345",
      type: "Flight",
      destination: "Dubai, UAE",
      date: "2024-10-20",
      status: "completed",
      price: "$1,450"
    }
  ]);

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
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-xl bg-card/90 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="p-4 md:p-8 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-border">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="font-luxury text-2xl md:text-3xl font-bold text-foreground mb-1">
                  My Travel Profile
                </h1>
                <p className="text-muted-foreground text-sm md:text-base">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-2 md:mt-0">
                <Badge className="bg-primary/20 text-primary border-primary/30">
                  <Star className="w-3 h-3 mr-1" />
                  {travelerInfo.loyaltyTier} Member
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  Since {travelerInfo.memberSince}
                </Badge>
              </div>
            </div>
          </Card>

          {/* Traveler Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Preferred Airline</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{travelerInfo.preferredAirline}</p>
            </Card>
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Hotel className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground">Preferred Hotel</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{travelerInfo.preferredHotel}</p>
            </Card>
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Total Saved</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{travelerInfo.savedAmount}</p>
            </Card>
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Next Milestone</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{travelerInfo.upcomingMilestone}</p>
            </Card>
          </div>

          {/* Clickable Milestones Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card 
              className="p-4 md:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
              onClick={() => setSelectedStat(statDetails.trips)}
            >
              <Award className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.tripsThisYear}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Trips This Year</p>
              <p className="text-xs text-primary mt-2">Tap for details →</p>
            </Card>
            
            <Card 
              className="p-4 md:p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
              onClick={() => setSelectedStat(statDetails.kilometers)}
            >
              <Globe className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.kilometresTraveled.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Kilometers Traveled</p>
              <p className="text-xs text-secondary mt-2">Tap for details →</p>
            </Card>
            
            <Card 
              className="p-4 md:p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
              onClick={() => setSelectedStat(statDetails.countries)}
            >
              <MapPin className="w-6 h-6 md:w-8 md:h-8 text-accent mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.countriesVisited}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Countries Visited</p>
              <p className="text-xs text-accent mt-2">Tap for details →</p>
            </Card>
            
            <Card 
              className="p-4 md:p-6 text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all"
              onClick={() => setSelectedStat(statDetails.spent)}
            >
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-destructive mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xs text-destructive mt-2">Tap for details →</p>
            </Card>
          </div>

          {/* Upcoming Trips */}
          <div className="mb-6">
            <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
              Upcoming Trips
            </h2>
            <div className="space-y-3 md:space-y-4">
              {upcomingTrips.map((trip) => (
                <Card key={trip.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Plane className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground">
                            {trip.type} - {trip.destination}
                          </h3>
                          <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent text-xs">
                            {trip.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            {trip.date}
                          </div>
                          <div>ID: {trip.id}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
                      <p className="text-xl md:text-2xl font-bold text-primary">
                        {trip.price}
                      </p>
                      <Button variant="outline" size="sm" className="text-xs md:text-sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mb-6">
            <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">
              Recent Bookings
            </h2>
            <div className="space-y-3 md:space-y-4">
              {recentTrips.map((booking) => (
                <Card key={booking.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow border-2 border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        {booking.type === "Flight" ? (
                          <Plane className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                        ) : (
                          <MapPin className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                          <h3 className="font-semibold text-base md:text-lg text-foreground">
                            {booking.type} - {booking.destination}
                          </h3>
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                            {booking.date}
                          </div>
                          <div>ID: {booking.id}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
                      <p className="text-xl md:text-2xl font-bold text-foreground">
                        {booking.price}
                      </p>
                      <Button variant="ghost" size="sm" className="text-xs md:text-sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Stat Detail Dialog */}
      <Dialog open={!!selectedStat} onOpenChange={() => setSelectedStat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              {selectedStat?.icon}
              <DialogTitle className="text-xl">{selectedStat?.title}</DialogTitle>
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-4 bg-muted/30 rounded-lg">
              <p className="text-4xl font-bold text-foreground">{selectedStat?.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{selectedStat?.description}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground">Breakdown</h4>
              {selectedStat?.breakdown?.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 px-3 bg-muted/20 rounded-lg">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
