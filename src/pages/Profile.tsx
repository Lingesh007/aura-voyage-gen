import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plane, Calendar, MapPin, User, TrendingUp, Globe, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Booking {
  id: string;
  type: string;
  destination: string;
  date: string;
  status: "confirmed" | "pending" | "completed";
  price: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  
  const stats = {
    tripsThisYear: 12,
    kilometresTraveled: 48750,
    countriesVisited: 8,
    totalSpent: 32500
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

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-border">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-10 h-10 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-luxury text-3xl font-bold text-foreground mb-2">
                  My Travel Profile
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>

          {/* Milestones Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
              <Award className="w-8 h-8 text-primary mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground mb-1">{stats.tripsThisYear}</p>
              <p className="text-sm text-muted-foreground">Trips This Year</p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20">
              <Globe className="w-8 h-8 text-secondary mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground mb-1">{stats.kilometresTraveled.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Kilometers Traveled</p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20">
              <MapPin className="w-8 h-8 text-accent mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground mb-1">{stats.countriesVisited}</p>
              <p className="text-sm text-muted-foreground">Countries Visited</p>
            </Card>
            
            <Card className="p-6 text-center bg-gradient-to-br from-pastel-coral/10 to-pastel-coral/5 border-2 border-pastel-coral/20">
              <TrendingUp className="w-8 h-8 text-pastel-coral mx-auto mb-3" />
              <p className="text-3xl font-bold text-foreground mb-1">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Total Spent</p>
            </Card>
          </div>

          {/* Upcoming Trips */}
          <div className="mb-8">
            <h2 className="font-luxury text-2xl font-bold text-foreground mb-6">
              Upcoming Trips
            </h2>
            <div className="space-y-4">
              {upcomingTrips.map((trip) => (
                <Card key={trip.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <Plane className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {trip.type} - {trip.destination}
                          </h3>
                          <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent">
                            {trip.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {trip.date}
                          </div>
                          <div>Booking ID: {trip.id}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">
                          {trip.price}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="mb-8">
            <h2 className="font-luxury text-2xl font-bold text-foreground mb-6">
              Recent Bookings
            </h2>
            <div className="space-y-4">
              {recentTrips.map((booking) => (
                <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                        {booking.type === "Flight" ? (
                          <Plane className="w-6 h-6 text-muted-foreground" />
                        ) : (
                          <MapPin className="w-6 h-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {booking.type} - {booking.destination}
                          </h3>
                          <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {booking.date}
                          </div>
                          <div>Booking ID: {booking.id}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">
                          {booking.price}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
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
    </div>
  );
};

export default Profile;
