import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plane, Calendar, MapPin, User, TrendingUp, Globe, Award, DollarSign, Clock, Star, Hotel } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { LoyaltySection } from "@/components/profile/LoyaltySection";
import { ForexConverter } from "@/components/profile/ForexConverter";

interface Booking {
  id: string;
  booking_id: string;
  booking_type: string;
  destination: string | null;
  created_at: string;
  status: string | null;
  price: number | null;
}

interface LoyaltyData {
  total_points: number;
  current_tier: string;
  points_this_year: number;
  lifetime_points: number;
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
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);

  const calculateStats = () => {
    const currentYear = new Date().getFullYear();
    const thisYearBookings = bookings.filter(b => 
      new Date(b.created_at).getFullYear() === currentYear
    );
    
    const uniqueDestinations = new Set(
      bookings.filter(b => b.destination).map(b => b.destination?.split(',')[1]?.trim() || b.destination)
    );
    
    const totalSpent = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const avgKmPerTrip = 4000;
    
    return {
      tripsThisYear: thisYearBookings.length,
      kilometresTraveled: thisYearBookings.length * avgKmPerTrip,
      countriesVisited: uniqueDestinations.size,
      totalSpent
    };
  };

  const stats = calculateStats();

  const statDetails: Record<string, StatDetail> = {
    trips: {
      title: "Trips This Year",
      value: stats.tripsThisYear,
      icon: <Award className="w-8 h-8 text-primary" />,
      description: "Your travel activity breakdown for " + new Date().getFullYear(),
      breakdown: [
        { label: "Flight Bookings", value: bookings.filter(b => b.booking_type === 'flight').length },
        { label: "Hotel Bookings", value: bookings.filter(b => b.booking_type === 'hotel').length },
        { label: "Activity Bookings", value: bookings.filter(b => b.booking_type === 'activity').length },
        { label: "Visa Services", value: bookings.filter(b => b.booking_type === 'visa').length },
        { label: "Confirmed", value: bookings.filter(b => b.status === 'confirmed').length },
        { label: "Completed", value: bookings.filter(b => b.status === 'completed').length }
      ]
    },
    kilometers: {
      title: "Kilometers Traveled",
      value: stats.kilometresTraveled.toLocaleString(),
      icon: <Globe className="w-8 h-8 text-secondary" />,
      description: "Estimated distance covered across all trips",
      breakdown: [
        { label: "By Air (est.)", value: `${(stats.kilometresTraveled * 0.85).toLocaleString()} km` },
        { label: "By Ground (est.)", value: `${(stats.kilometresTraveled * 0.15).toLocaleString()} km` },
        { label: "Average per Trip", value: `4,000 km` },
        { label: "Flight Hours (est.)", value: `~${Math.round(stats.kilometresTraveled / 800)} hours` }
      ]
    },
    countries: {
      title: "Destinations Visited",
      value: stats.countriesVisited,
      icon: <MapPin className="w-8 h-8 text-accent" />,
      description: "Unique destinations from your bookings",
      breakdown: bookings
        .filter(b => b.destination)
        .reduce((acc: {label: string; value: string}[], b) => {
          const dest = b.destination || 'Unknown';
          const existing = acc.find(a => a.label === dest);
          if (existing) {
            const count = parseInt(existing.value) + 1;
            existing.value = `${count} booking${count > 1 ? 's' : ''}`;
          } else {
            acc.push({ label: dest, value: '1 booking' });
          }
          return acc;
        }, []).slice(0, 6)
    },
    spent: {
      title: "Total Spent",
      value: `$${stats.totalSpent.toLocaleString()}`,
      icon: <TrendingUp className="w-8 h-8 text-destructive" />,
      description: "Travel expenditure summary",
      breakdown: [
        { label: "Flights", value: `$${bookings.filter(b => b.booking_type === 'flight').reduce((s, b) => s + (b.price || 0), 0).toLocaleString()}` },
        { label: "Hotels", value: `$${bookings.filter(b => b.booking_type === 'hotel').reduce((s, b) => s + (b.price || 0), 0).toLocaleString()}` },
        { label: "Activities", value: `$${bookings.filter(b => b.booking_type === 'activity').reduce((s, b) => s + (b.price || 0), 0).toLocaleString()}` },
        { label: "Visas", value: `$${bookings.filter(b => b.booking_type === 'visa').reduce((s, b) => s + (b.price || 0), 0).toLocaleString()}` },
        { label: "Avg. per Booking", value: bookings.length ? `$${Math.round(stats.totalSpent / bookings.length).toLocaleString()}` : '$0' }
      ]
    }
  };

  const travelerInfo = {
    memberSince: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently",
    loyaltyTier: loyaltyData?.current_tier || "Bronze",
    savedAmount: `$${Math.round(stats.totalSpent * 0.12).toLocaleString()}`
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (bookingsData) {
        setBookings(bookingsData);
      }

      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', session.user.id)
        .maybeSingle();
      
      if (loyalty) {
        setLoyaltyData(loyalty);
      } else {
        const { data: newLoyalty } = await supabase
          .from('loyalty_points')
          .insert({ user_id: session.user.id })
          .select()
          .single();
        if (newLoyalty) setLoyaltyData(newLoyalty);
      }
      
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const upcomingBookings = bookings.filter(b => b.status === 'confirmed');
  const recentBookings = bookings.filter(b => b.status === 'completed').slice(0, 5);

  if (!user || loading) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border backdrop-blur-xl bg-card/90 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")} className="hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          <Card className="p-4 md:p-8 mb-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-border">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
              </div>
              <div className="text-center md:text-left flex-1">
                <h1 className="font-luxury text-2xl md:text-3xl font-bold text-foreground mb-1">My Travel Profile</h1>
                <p className="text-muted-foreground text-sm md:text-base">{user.email}</p>
              </div>
              <div className="flex flex-wrap justify-center md:justify-end gap-2 mt-2 md:mt-0">
                <Badge className="bg-primary/20 text-primary border-primary/30 capitalize">
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

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Plane className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Total Bookings</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{bookings.length}</p>
            </Card>
            <Card className="p-3 md:p-4 bg-card border border-border">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Est. Saved</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{travelerInfo.savedAmount}</p>
            </Card>
            <Card className="p-3 md:p-4 bg-card border border-border col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Loyalty Points</span>
              </div>
              <p className="font-semibold text-sm text-foreground">{loyaltyData?.total_points?.toLocaleString() || 0} pts</p>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all" onClick={() => setSelectedStat(statDetails.trips)}>
              <Award className="w-6 h-6 md:w-8 md:h-8 text-primary mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.tripsThisYear}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Trips This Year</p>
              <p className="text-xs text-primary mt-2">Tap for details →</p>
            </Card>
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-secondary/10 to-secondary/5 border-2 border-secondary/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all" onClick={() => setSelectedStat(statDetails.kilometers)}>
              <Globe className="w-6 h-6 md:w-8 md:h-8 text-secondary mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.kilometresTraveled.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Kilometers Traveled</p>
              <p className="text-xs text-secondary mt-2">Tap for details →</p>
            </Card>
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-accent/10 to-accent/5 border-2 border-accent/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all" onClick={() => setSelectedStat(statDetails.countries)}>
              <MapPin className="w-6 h-6 md:w-8 md:h-8 text-accent mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stats.countriesVisited}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Destinations</p>
              <p className="text-xs text-accent mt-2">Tap for details →</p>
            </Card>
            <Card className="p-4 md:p-6 text-center bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20 cursor-pointer hover:shadow-lg hover:scale-105 transition-all" onClick={() => setSelectedStat(statDetails.spent)}>
              <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-destructive mx-auto mb-2 md:mb-3" />
              <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">${stats.totalSpent.toLocaleString()}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Spent</p>
              <p className="text-xs text-destructive mt-2">Tap for details →</p>
            </Card>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <LoyaltySection loyaltyData={loyaltyData} />
            <div className="space-y-4">
              <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground">Forex Tools</h2>
              <ForexConverter />
            </div>
          </div>

          {upcomingBookings.length > 0 && (
            <div className="mb-6">
              <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Upcoming Trips</h2>
              <div className="space-y-3 md:space-y-4">
                {upcomingBookings.map((booking) => (
                  <Card key={booking.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          {booking.booking_type === 'hotel' ? <Hotel className="w-5 h-5 md:w-6 md:h-6 text-primary" /> : <Plane className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                            <h3 className="font-semibold text-base md:text-lg text-foreground capitalize">{booking.booking_type} - {booking.destination || 'TBD'}</h3>
                            <Badge variant="outline" className="bg-accent/20 text-accent-foreground border-accent text-xs">{booking.status}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 md:w-4 md:h-4" />{new Date(booking.created_at).toLocaleDateString()}</div>
                            <div>ID: {booking.booking_id}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
                        <p className="text-xl md:text-2xl font-bold text-primary">${booking.price?.toLocaleString() || 0}</p>
                        <Button variant="outline" size="sm" className="text-xs md:text-sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {recentBookings.length > 0 && (
            <div className="mb-6">
              <h2 className="font-luxury text-xl md:text-2xl font-bold text-foreground mb-4 md:mb-6">Recent Bookings</h2>
              <div className="space-y-3 md:space-y-4">
                {recentBookings.map((booking) => (
                  <Card key={booking.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow border-2 border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:gap-4">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-muted/50 flex items-center justify-center">
                          {booking.booking_type === 'flight' ? <Plane className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" /> : <MapPin className="w-5 h-5 md:w-6 md:h-6 text-muted-foreground" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1 md:mb-2">
                            <h3 className="font-semibold text-base md:text-lg text-foreground capitalize">{booking.booking_type} - {booking.destination || 'TBD'}</h3>
                            <Badge variant="outline" className="bg-muted text-muted-foreground border-border text-xs">{booking.status}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-muted-foreground">
                            <div className="flex items-center gap-1"><Calendar className="w-3 h-3 md:w-4 md:h-4" />{new Date(booking.created_at).toLocaleDateString()}</div>
                            <div>ID: {booking.booking_id}</div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4 mt-2 md:mt-0">
                        <p className="text-xl md:text-2xl font-bold text-foreground">${booking.price?.toLocaleString() || 0}</p>
                        <Button variant="ghost" size="sm" className="text-xs md:text-sm">View Details</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {bookings.length === 0 && (
            <Card className="p-8 text-center bg-muted/30 border border-border">
              <Plane className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-4">Start planning your next adventure!</p>
              <Button onClick={() => navigate('/dashboard')}>Explore Destinations</Button>
            </Card>
          )}
        </div>
      </main>

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
