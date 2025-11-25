import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plane, Calendar, MapPin, User } from "lucide-react";
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
  const [bookings] = useState<Booking[]>([
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
      status: "pending",
      price: "$850"
    },
    {
      id: "TVX-GHI789",
      type: "Flight",
      destination: "London, UK",
      date: "2024-11-10",
      status: "completed",
      price: "$980"
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-accent/20 text-accent-foreground border-accent";
      case "pending":
        return "bg-secondary/20 text-secondary-foreground border-secondary";
      case "completed":
        return "bg-muted text-muted-foreground border-border";
      default:
        return "bg-muted text-muted-foreground border-border";
    }
  };

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
                  My Profile
                </h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </Card>

          {/* Bookings Section */}
          <div className="mb-8">
            <h2 className="font-luxury text-2xl font-bold text-foreground mb-6">
              My Bookings
            </h2>
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-border">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        {booking.type === "Flight" ? (
                          <Plane className="w-6 h-6 text-primary" />
                        ) : (
                          <MapPin className="w-6 h-6 text-secondary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-foreground">
                            {booking.type} - {booking.destination}
                          </h3>
                          <Badge variant="outline" className={getStatusColor(booking.status)}>
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
                        <p className="text-2xl font-bold text-primary">
                          {booking.price}
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
        </div>
      </main>
    </div>
  );
};

export default Profile;
