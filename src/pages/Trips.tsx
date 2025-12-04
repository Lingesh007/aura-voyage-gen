import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plane, 
  Hotel, 
  Calendar, 
  MapPin, 
  Clock, 
  DollarSign,
  ArrowLeft,
  Bot,
  FileText
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardNav from "@/components/dashboard/DashboardNav";

interface Trip {
  id: string;
  booking_id: string;
  booking_type: string;
  destination: string | null;
  booking_details: any;
  traveler_details: any;
  price: number | null;
  status: string | null;
  created_at: string;
}

const Trips = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching trips:', error);
          toast({
            title: "Error",
            description: "Failed to load trips",
            variant: "destructive"
          });
        } else {
          setTrips(data || []);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, [toast]);

  const upcomingTrips = trips.filter(t => t.status === 'confirmed' || t.status === 'pending');
  const completedTrips = trips.filter(t => t.status === 'completed');
  const cancelledTrips = trips.filter(t => t.status === 'cancelled');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'flights':
        return <Plane className="w-5 h-5" />;
      case 'hotels':
        return <Hotel className="w-5 h-5" />;
      case 'visas':
        return <FileText className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'completed':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'cancelled':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const TripCard = ({ trip }: { trip: Trip }) => {
    const details = trip.booking_details || {};
    
    return (
      <Card className="hover:border-primary/30 transition-all cursor-pointer group">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {getTypeIcon(trip.booking_type)}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{trip.destination || 'Unknown'}</h3>
                <p className="text-sm text-muted-foreground capitalize">{trip.booking_type}</p>
              </div>
            </div>
            <Badge className={getStatusColor(trip.status)}>
              {trip.status || 'Unknown'}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            {trip.booking_type === 'flights' && (
              <>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Plane className="w-3 h-3" /> Route
                  </div>
                  <div className="font-medium">
                    {details.departure || 'N/A'} → {details.arrival || trip.destination}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Duration
                  </div>
                  <div className="font-medium">{details.duration || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Date
                  </div>
                  <div className="font-medium">{details.date || new Date(trip.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price
                  </div>
                  <div className="font-medium text-primary">${trip.price || 0}</div>
                </div>
              </>
            )}
            {trip.booking_type === 'hotels' && (
              <>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Hotel className="w-3 h-3" /> Hotel
                  </div>
                  <div className="font-medium">{details.name || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Stay
                  </div>
                  <div className="font-medium">{details.date || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </div>
                  <div className="font-medium">{details.location || trip.destination}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price
                  </div>
                  <div className="font-medium text-primary">${trip.price || 0}</div>
                </div>
              </>
            )}
            {(trip.booking_type === 'visas' || trip.booking_type === 'activities') && (
              <>
                <div>
                  <div className="text-muted-foreground">Type</div>
                  <div className="font-medium">{details.name || trip.booking_type}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Date</div>
                  <div className="font-medium">{new Date(trip.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Status</div>
                  <div className="font-medium capitalize">{trip.status}</div>
                </div>
                <div>
                  <div className="text-muted-foreground flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Price
                  </div>
                  <div className="font-medium text-primary">${trip.price || 0}</div>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              Booking ID: {trip.booking_id}
            </span>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const TripsList = ({ trips: tripList }: { trips: Trip[] }) => (
    tripList.length > 0 ? (
      <div className="space-y-4">
        {tripList.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    ) : (
      <div className="text-center py-12">
        <Bot className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h3 className="font-semibold text-lg mb-2">No trips found</h3>
        <p className="text-muted-foreground mb-4">Start planning your next adventure with AI</p>
        <Button onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    )
  );

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "Traveler";

  return (
    <div className="min-h-screen bg-background">
      <DashboardNav userName={userName} userType="individual" onOpenAgent={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold">My Trips</h1>
                <p className="text-muted-foreground">Manage all your bookings in one place</p>
              </div>
            </div>
            <Button onClick={() => navigate('/booking/flights')}>
              <Plane className="w-4 h-4 mr-2" />
              Book New Trip
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your trips...</p>
            </div>
          ) : (
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="upcoming">
                  Upcoming ({upcomingTrips.length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedTrips.length})
                </TabsTrigger>
                <TabsTrigger value="cancelled">
                  Cancelled ({cancelledTrips.length})
                </TabsTrigger>
                <TabsTrigger value="all">
                  All ({trips.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming">
                <TripsList trips={upcomingTrips} />
              </TabsContent>
              <TabsContent value="completed">
                <TripsList trips={completedTrips} />
              </TabsContent>
              <TabsContent value="cancelled">
                <TripsList trips={cancelledTrips} />
              </TabsContent>
              <TabsContent value="all">
                <TripsList trips={trips} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
    </div>
  );
};

export default Trips;
