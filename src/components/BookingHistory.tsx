import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  booking_id: string;
  booking_type: string;
  destination: string;
  booking_details: any;
  traveler_details: any;
  price: number;
  status: string;
  created_at: string;
}

export const BookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching bookings:', error);
        toast({
          title: "Error",
          description: "Could not load booking history.",
          variant: "destructive",
        });
      } else {
        setBookings(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Recent Bookings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No bookings yet. Start planning your next trip!
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary" />
          Recent Bookings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bookings.map((booking) => (
          <div
            key={booking.id}
            className="p-4 rounded-lg border hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="font-semibold truncate">{booking.destination}</span>
                </div>
                <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                  {booking.status}
                </Badge>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary font-semibold">
                  <DollarSign className="w-4 h-4" />
                  {booking.price}
                </div>
              </div>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Booking ID: {booking.booking_id}</div>
              <div className="capitalize">Type: {booking.booking_type}</div>
              <div>
                Date: {new Date(booking.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
