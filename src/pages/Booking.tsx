import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plane, Hotel, FileText, MapPin, Star, Clock, User, Calendar, PlaneTakeoff, PlaneLanding, Timer, Coins, CalendarIcon, ArrowRight, Users, DoorOpen, RefreshCw, Minus, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format, differenceInDays, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import hotelParis from "@/assets/hotel-paris.jpg";
import hotelDubai from "@/assets/hotel-dubai.jpg";
import hotelTokyo from "@/assets/hotel-tokyo.jpg";
import flightAirplane from "@/assets/flight-airplane.jpg";
import flightBusiness from "@/assets/flight-business.jpg";
import flightLounge from "@/assets/flight-lounge.jpg";

interface BookingProps {
  onOpenAgent: () => void;
}

const Booking = ({ onOpenAgent }: BookingProps) => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [travelerDetails, setTravelerDetails] = useState({
    name: "",
    age: "",
    email: "",
    phone: ""
  });

  // Flight date pickers
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isRoundTrip, setIsRoundTrip] = useState(true);

  // Hotel date pickers
  const [checkInDate, setCheckInDate] = useState<Date | undefined>(undefined);
  const [checkOutDate, setCheckOutDate] = useState<Date | undefined>(undefined);

  // Passenger and room counts
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState({ adults: 1, children: 0 });

  // Currency conversion
  const currencies = [
    { code: 'USD', symbol: '$' },
    { code: 'EUR', symbol: '€' },
    { code: 'GBP', symbol: '£' },
    { code: 'JPY', symbol: '¥' },
    { code: 'AED', symbol: 'د.إ' },
    { code: 'INR', symbol: '₹' },
    { code: 'SGD', symbol: 'S$' },
    { code: 'AUD', symbol: 'A$' },
  ];
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRates, setExchangeRates] = useState<Record<string, number>>({});
  const [loadingRates, setLoadingRates] = useState(false);

  const fetchExchangeRates = async () => {
    setLoadingRates(true);
    try {
      const { data, error } = await supabase.functions.invoke('forex-rates', {
        body: { base: 'USD' }
      });
      if (!error && data?.rates) {
        setExchangeRates(data.rates);
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchExchangeRates();
  }, []);

  const convertPrice = (priceUSD: number): string => {
    if (selectedCurrency === 'USD' || !exchangeRates[selectedCurrency]) {
      return priceUSD.toFixed(2);
    }
    return (priceUSD * exchangeRates[selectedCurrency]).toFixed(2);
  };

  const getCurrencySymbol = () => {
    return currencies.find(c => c.code === selectedCurrency)?.symbol || '$';
  };

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;
  const totalGuests = guests.adults + guests.children;

  const calculateNights = () => {
    if (checkInDate && checkOutDate) {
      return differenceInDays(checkOutDate, checkInDate);
    }
    return 0;
  };

  // Parse AI response details if coming from agent
  const fromAgent = searchParams.get("fromAgent") === "true";
  
  const parseAIOptions = () => {
    // Try to get booking data from sessionStorage
    const storedData = sessionStorage.getItem('agentBookingData');
    if (!storedData) return [];
    
    try {
      const bookingData = JSON.parse(storedData);
      
      // Map the extracted options to the format expected by the UI
      return bookingData.options.map((option: any, index: number) => {
        const imageMap: Record<string, string> = {
          flights: [flightAirplane, flightBusiness, flightLounge][index % 3],
          hotels: [hotelParis, hotelDubai, hotelTokyo][index % 3],
          activities: [hotelParis, hotelDubai, hotelTokyo][index % 3],
          visas: [flightAirplane, flightBusiness, flightLounge][index % 3]
        };
        
        return {
          image: imageMap[bookingData.type] || flightAirplane,
          destination: option.destination || 'Various',
          name: option.name || option.destination,
          description: option.details || option.name || 'Recommended by AI',
          price: typeof option.price === 'string' ? parseFloat(option.price) : option.price,
          departure: option.departure,
          arrival: option.arrival,
          date: option.date,
          duration: option.duration,
          rating: option.rating,
          processing: option.processing,
          details: option
        };
      });
    } catch (error) {
      console.error('Error parsing booking data:', error);
      return [];
    }
  };

  const getStaticOptions = () => {
    switch (type) {
      case "flights":
        return [
          {
            image: flightAirplane,
            destination: "London",
            departure: "New York JFK",
            arrival: "London Heathrow",
            departureTime: "08:30 AM",
            arrivalTime: "08:00 PM",
            date: "Dec 15, 2024",
            duration: "7h 30m",
            price: 1250,
            class: "Business Class",
            flightCode: "BA178",
            layover: "Direct",
            layoverDuration: null,
            pointsEarned: 2500,
            airline: "British Airways"
          },
          {
            image: flightBusiness,
            destination: "Tokyo",
            departure: "San Francisco SFO",
            arrival: "Tokyo Narita NRT",
            departureTime: "11:00 AM",
            arrivalTime: "04:45 PM (+1)",
            date: "Dec 20, 2024",
            duration: "11h 45m",
            price: 1850,
            class: "Business Class",
            flightCode: "JL001",
            layover: "Direct",
            layoverDuration: null,
            pointsEarned: 3700,
            airline: "Japan Airlines"
          },
          {
            image: flightLounge,
            destination: "Dubai",
            departure: "Los Angeles LAX",
            arrival: "Dubai DXB",
            departureTime: "02:15 PM",
            arrivalTime: "08:35 PM (+1)",
            date: "Dec 18, 2024",
            duration: "16h 20m",
            price: 2100,
            class: "First Class",
            flightCode: "EK216",
            layover: "1 stop (London LHR)",
            layoverDuration: "2h 30m",
            pointsEarned: 4200,
            airline: "Emirates"
          }
        ];
      case "hotels":
        return [
          {
            image: hotelParis,
            destination: "Paris",
            name: "Le Meurice",
            rating: 5,
            location: "Near Eiffel Tower",
            date: "3 nights",
            nights: 3,
            checkIn: "Dec 15, 2024",
            checkOut: "Dec 18, 2024",
            price: 850,
            pricePerNight: 283,
            amenities: "Spa, Pool, Restaurant",
            totalCost: 850
          },
          {
            image: hotelDubai,
            destination: "Dubai",
            name: "Burj Al Arab",
            rating: 5,
            location: "Marina District",
            date: "4 nights",
            nights: 4,
            checkIn: "Dec 18, 2024",
            checkOut: "Dec 22, 2024",
            price: 1200,
            pricePerNight: 300,
            amenities: "Beach, Spa, Fine Dining",
            totalCost: 1200
          },
          {
            image: hotelTokyo,
            destination: "Tokyo",
            name: "Aman Tokyo",
            rating: 5,
            location: "Shibuya District",
            date: "5 nights",
            nights: 5,
            checkIn: "Dec 20, 2024",
            checkOut: "Dec 25, 2024",
            price: 980,
            pricePerNight: 196,
            amenities: "Zen Garden, Spa, Onsen",
            totalCost: 980
          }
        ];
      case "visas":
        return [
          {
            image: flightAirplane,
            destination: "United Kingdom",
            name: "Business Visa",
            processingTime: "5-7 days",
            validity: "2 years",
            price: 250,
            type: "Multiple Entry"
          },
          {
            image: flightBusiness,
            destination: "Japan",
            name: "Business Visa",
            processingTime: "3-5 days",
            validity: "90 days",
            price: 180,
            type: "Single Entry"
          },
          {
            image: flightLounge,
            destination: "UAE",
            name: "Business Visa",
            processingTime: "2-3 days",
            validity: "30 days",
            price: 150,
            type: "Multiple Entry"
          }
        ];
      case "activities":
        return [
          {
            image: hotelParis,
            destination: "Paris",
            name: "City Tour & Seine Cruise",
            duration: "Full Day",
            participants: "Up to 15",
            price: 350,
            includes: "Guide, Transport, Lunch"
          },
          {
            image: hotelDubai,
            destination: "Dubai",
            name: "Desert Safari Experience",
            duration: "6 hours",
            participants: "Up to 20",
            price: 280,
            includes: "BBQ Dinner, Shows"
          },
          {
            image: hotelTokyo,
            destination: "Tokyo",
            name: "Cultural Heritage Tour",
            duration: "8 hours",
            participants: "Up to 12",
            price: 320,
            includes: "Tea Ceremony, Temples"
          }
        ];
      default:
        return [];
    }
  };

  const options = fromAgent ? parseAIOptions() : getStaticOptions();

  const getIcon = () => {
    switch (type) {
      case "flights":
        return <Plane className="w-12 h-12 text-primary" strokeWidth={1.5} />;
      case "hotels":
        return <Hotel className="w-12 h-12 text-secondary" strokeWidth={1.5} />;
      case "visas":
        return <FileText className="w-12 h-12 text-accent" strokeWidth={1.5} />;
      case "activities":
        return <MapPin className="w-12 h-12 text-pastel-coral" strokeWidth={1.5} />;
      default:
        return <Plane className="w-12 h-12 text-primary" strokeWidth={1.5} />;
    }
  };

  const getTitle = () => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Booking";
  };

  const handleBooking = async () => {
    if (selectedOption === null) {
      toast({
        title: "Selection Required",
        description: "Please select an option to continue.",
        variant: "destructive",
      });
      return;
    }

    if (!travelerDetails.name || !travelerDetails.age || !travelerDetails.email || !travelerDetails.phone) {
      toast({
        title: "Traveler Details Required",
        description: "Please fill in all traveler details.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    const bookingId = `TVX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const selectedBooking = options[selectedOption];
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      // Save booking to database
      const { error } = await supabase.from('bookings').insert({
        user_id: user?.id,
        booking_id: bookingId,
        booking_type: type || 'travel',
        destination: selectedBooking.destination,
        booking_details: selectedBooking,
        traveler_details: travelerDetails,
        price: selectedBooking.price,
        status: 'confirmed'
      });
      
      if (error) {
        console.error('Error saving booking:', error);
        toast({
          title: "Booking Saved Locally",
          description: "Your booking was confirmed but couldn't be saved to history.",
          variant: "default",
        });
      } else {
        toast({
          title: "Booking Confirmed",
          description: "Your booking has been successfully confirmed and saved.",
        });
      }
      
      // Clear the agent booking data from sessionStorage
      sessionStorage.removeItem('agentBookingData');
      
      setLoading(false);
      navigate("/confirmation", { 
        state: { 
          type: type,
          option: selectedBooking,
          travelerDetails: travelerDetails,
          bookingId: bookingId
        } 
      });
    } catch (error) {
      console.error('Booking error:', error);
      setLoading(false);
      toast({
        title: "Error",
        description: "An error occurred while processing your booking.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/5 opacity-50" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Button
            onClick={onOpenAgent}
            variant="outline"
            className="border-primary/30 hover:bg-primary/10"
          >
            Ask AI Assistant
          </Button>
        </div>

        <div className="max-w-6xl mx-auto">
          <Card className="p-8 bg-card/80 backdrop-blur-xl border-2 border-border shadow-lg animate-scale-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                {getIcon()}
              </div>
              <h1 className="font-luxury text-4xl font-bold text-gradient-pastel mb-2">
                Book {getTitle()}
              </h1>
              <p className="text-muted-foreground">
                Find and book the best {type} for your business travel
              </p>
            </div>

            {/* Flight Search Section */}
            {type === "flights" && (
              <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Plane className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Flight Search</h3>
                </div>
                
                <div className="flex items-center gap-3 mb-4">
                  <Switch
                    id="round-trip"
                    checked={isRoundTrip}
                    onCheckedChange={setIsRoundTrip}
                  />
                  <Label htmlFor="round-trip" className="cursor-pointer">Round Trip</Label>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Departure Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !departureDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {departureDate ? format(departureDate, "PPP") : "Select departure date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={departureDate}
                          onSelect={(date) => {
                            setDepartureDate(date);
                            if (date && returnDate && date > returnDate) {
                              setReturnDate(addDays(date, 1));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {isRoundTrip && (
                    <div>
                      <Label>Return Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !returnDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {returnDate ? format(returnDate, "PPP") : "Select return date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={returnDate}
                            onSelect={setReturnDate}
                            disabled={(date) => date < (departureDate || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  )}
                </div>

                {/* Passenger Count */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="w-4 h-4 text-primary" />
                    <Label className="font-medium">Passengers</Label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-2">Adults (12+)</div>
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.max(1, p.adults - 1) }))}
                          disabled={passengers.adults <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold text-lg">{passengers.adults}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, adults: Math.min(9, p.adults + 1) }))}
                          disabled={passengers.adults >= 9}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-2">Children (2-11)</div>
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, children: Math.max(0, p.children - 1) }))}
                          disabled={passengers.children <= 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold text-lg">{passengers.children}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, children: Math.min(9, p.children + 1) }))}
                          disabled={passengers.children >= 9}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-xs text-muted-foreground mb-2">Infants (0-2)</div>
                      <div className="flex items-center justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, infants: Math.max(0, p.infants - 1) }))}
                          disabled={passengers.infants <= 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-semibold text-lg">{passengers.infants}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setPassengers(p => ({ ...p, infants: Math.min(passengers.adults, p.infants + 1) }))}
                          disabled={passengers.infants >= passengers.adults}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {departureDate && (
                  <div className="mt-4 flex items-center gap-3 p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <PlaneTakeoff className="w-4 h-4 text-primary" />
                      <span className="font-medium">{format(departureDate, "EEE, MMM d, yyyy")}</span>
                    </div>
                    {isRoundTrip && returnDate && (
                      <>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <div className="flex items-center gap-2 text-sm">
                          <PlaneLanding className="w-4 h-4 text-primary" />
                          <span className="font-medium">{format(returnDate, "EEE, MMM d, yyyy")}</span>
                        </div>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {differenceInDays(returnDate, departureDate)} days
                        </span>
                      </>
                    )}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground border-l border-border pl-3">
                      <Users className="w-3 h-3" />
                      {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hotel Search Section */}
            {type === "hotels" && (
              <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Hotel className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Stay Dates</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !checkInDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP") : "Select check-in date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={checkInDate}
                          onSelect={(date) => {
                            setCheckInDate(date);
                            if (date && checkOutDate && date >= checkOutDate) {
                              setCheckOutDate(addDays(date, 1));
                            }
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <Label>Check-out Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !checkOutDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP") : "Select check-out date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          disabled={(date) => date <= (checkInDate || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Room and Guest Count */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Rooms */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <DoorOpen className="w-4 h-4 text-primary" />
                        <Label className="font-medium">Rooms</Label>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRooms(r => Math.max(1, r - 1))}
                            disabled={rooms <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="font-semibold text-xl">{rooms}</span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setRooms(r => Math.min(10, r + 1))}
                            disabled={rooms >= 10}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Guests */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Users className="w-4 h-4 text-primary" />
                        <Label className="font-medium">Guests</Label>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1">Adults</div>
                          <div className="flex items-center justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setGuests(g => ({ ...g, adults: Math.max(1, g.adults - 1) }))}
                              disabled={guests.adults <= 1}
                            >
                              <Minus className="w-2 h-2" />
                            </Button>
                            <span className="font-semibold">{guests.adults}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setGuests(g => ({ ...g, adults: Math.min(rooms * 4, g.adults + 1) }))}
                              disabled={guests.adults >= rooms * 4}
                            >
                              <Plus className="w-2 h-2" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <div className="text-xs text-muted-foreground mb-1">Children</div>
                          <div className="flex items-center justify-between">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setGuests(g => ({ ...g, children: Math.max(0, g.children - 1) }))}
                              disabled={guests.children <= 0}
                            >
                              <Minus className="w-2 h-2" />
                            </Button>
                            <span className="font-semibold">{guests.children}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => setGuests(g => ({ ...g, children: Math.min(rooms * 2, g.children + 1) }))}
                              disabled={guests.children >= rooms * 2}
                            >
                              <Plus className="w-2 h-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {checkInDate && checkOutDate && (
                  <div className="mt-4 flex items-center flex-wrap gap-3 p-3 bg-primary/10 rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{format(checkInDate, "EEE, MMM d")}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="font-medium">{format(checkOutDate, "EEE, MMM d")}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">
                      {calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'}
                    </span>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground border-l border-border pl-3 ml-auto">
                      <span className="flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" />
                        {rooms} {rooms === 1 ? 'room' : 'rooms'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Traveler Details Form */}
            <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-lg">Traveler Details</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={travelerDetails.name}
                    onChange={(e) => setTravelerDetails({...travelerDetails, name: e.target.value})}
                    placeholder="John Doe"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    value={travelerDetails.age}
                    onChange={(e) => setTravelerDetails({...travelerDetails, age: e.target.value})}
                    placeholder="30"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={travelerDetails.email}
                    onChange={(e) => setTravelerDetails({...travelerDetails, email: e.target.value})}
                    placeholder="john@example.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={travelerDetails.phone}
                    onChange={(e) => setTravelerDetails({...travelerDetails, phone: e.target.value})}
                    placeholder="+1 234 567 8900"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="mb-6 flex items-center justify-end gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>View prices in:</span>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map(currency => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.symbol} {currency.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={fetchExchangeRates}
                  disabled={loadingRates}
                >
                  <RefreshCw className={`w-3 h-3 ${loadingRates ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>

            {/* Booking Options */}
            <div className="space-y-6 mb-8">
              <h3 className="font-semibold text-lg">
                {fromAgent ? "AI Recommended Options" : "Select Your Option"}
              </h3>
              {options.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No options available. Try using the AI assistant for personalized recommendations.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {options.map((option: any, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOption(i)}
                      className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 hover:scale-[1.02] text-left ${
                        selectedOption === i
                          ? "border-primary shadow-xl ring-2 ring-primary/50"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <div className="aspect-video overflow-hidden">
                        <img 
                          src={option.image} 
                          alt={option.destination}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>
                      <div className="p-5 bg-card">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-luxury text-xl font-bold text-foreground mb-1">
                              {option.destination}
                            </h4>
                            {fromAgent ? (
                              <p className="text-sm text-muted-foreground line-clamp-2">{option.description}</p>
                            ) : (
                              <>
                                {type === "hotels" && option.name && (
                                  <p className="text-sm text-muted-foreground">{option.name}</p>
                                )}
                                {type === "flights" && option.departure && (
                                  <p className="text-xs text-muted-foreground">{option.departure} → {option.arrival}</p>
                                )}
                                {type === "visas" && option.name && (
                                  <p className="text-sm text-muted-foreground">{option.name}</p>
                                )}
                                {type === "activities" && option.name && (
                                  <p className="text-sm text-muted-foreground">{option.name}</p>
                                )}
                              </>
                            )}
                          </div>
                          {!fromAgent && type === "hotels" && option.rating && (
                            <div className="flex items-center gap-1 text-accent">
                              {[...Array(option.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {!fromAgent && (
                          <div className="space-y-2 text-xs text-muted-foreground mb-4">
                            {type === "flights" && (
                              <>
                                {/* Flight Route with Times */}
                                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-center">
                                      <PlaneTakeoff className="w-4 h-4 mx-auto mb-1 text-primary" />
                                      <div className="font-bold text-foreground text-sm">{option.departureTime}</div>
                                      <div className="text-muted-foreground text-xs">{option.departure}</div>
                                    </div>
                                    <div className="flex-1 px-3">
                                      <div className="relative flex items-center">
                                        <div className="flex-1 border-t-2 border-dashed border-primary/40" />
                                        <div className="px-2 text-center">
                                          <Timer className="w-3 h-3 mx-auto text-primary" />
                                          <div className="text-xs font-medium text-foreground">{option.duration}</div>
                                        </div>
                                        <div className="flex-1 border-t-2 border-dashed border-primary/40" />
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <PlaneLanding className="w-4 h-4 mx-auto mb-1 text-primary" />
                                      <div className="font-bold text-foreground text-sm">{option.arrivalTime}</div>
                                      <div className="text-muted-foreground text-xs">{option.arrival}</div>
                                    </div>
                                  </div>
                                </div>
                                {/* Flight Details Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-2">
                                  <div className="bg-muted/50 rounded p-2 text-center">
                                    <span className="text-muted-foreground block text-xs">Flight</span>
                                    <div className="font-semibold text-foreground">{option.flightCode}</div>
                                  </div>
                                  <div className="bg-muted/50 rounded p-2 text-center">
                                    <span className="text-muted-foreground block text-xs">Layover</span>
                                    <div className="font-semibold text-foreground text-xs">{option.layover}</div>
                                    {option.layoverDuration && (
                                      <div className="text-xs text-muted-foreground">({option.layoverDuration})</div>
                                    )}
                                  </div>
                                  <div className="bg-muted/50 rounded p-2 text-center">
                                    <span className="text-muted-foreground block text-xs">Class</span>
                                    <div className="font-semibold text-foreground text-xs">{option.class}</div>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-2">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-primary" />
                                    <span className="font-medium text-foreground">{option.date}</span>
                                  </div>
                                  <div className="flex items-center gap-1 text-primary font-semibold">
                                    <Coins className="w-3 h-3" />
                                    +{option.pointsEarned} pts
                                  </div>
                                </div>
                              </>
                            )}
                            {type === "hotels" && (
                              <>
                                {/* Check-in/Check-out Display */}
                                <div className="bg-muted/50 rounded-lg p-3 mb-2">
                                  <div className="flex items-center justify-between">
                                    <div className="text-center">
                                      <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
                                      <div className="text-muted-foreground text-xs">Check-in</div>
                                      <div className="font-bold text-foreground text-sm">{option.checkIn}</div>
                                    </div>
                                    <div className="flex-1 px-3">
                                      <div className="relative flex items-center">
                                        <div className="flex-1 border-t-2 border-dashed border-primary/40" />
                                        <div className="px-2 text-center">
                                          <Hotel className="w-4 h-4 mx-auto text-primary" />
                                          <div className="text-xs font-medium text-foreground">{option.nights} nights</div>
                                        </div>
                                        <div className="flex-1 border-t-2 border-dashed border-primary/40" />
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <Calendar className="w-4 h-4 mx-auto mb-1 text-primary" />
                                      <div className="text-muted-foreground text-xs">Check-out</div>
                                      <div className="font-bold text-foreground text-sm">{option.checkOut}</div>
                                    </div>
                                  </div>
                                </div>
                                {/* Hotel Details Grid */}
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                  <div className="bg-muted/50 rounded p-2 text-center">
                                    <span className="text-muted-foreground block text-xs">Per Night</span>
                                    <div className="font-semibold text-foreground">${option.pricePerNight}</div>
                                  </div>
                                  <div className="bg-muted/50 rounded p-2 text-center">
                                    <span className="text-muted-foreground block text-xs">Total Cost</span>
                                    <div className="font-semibold text-primary">${option.totalCost}</div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs">
                                  <MapPin className="w-3 h-3" />
                                  {option.location}
                                </div>
                                <div className="text-xs bg-primary/10 rounded px-2 py-1">{option.amenities}</div>
                              </>
                            )}
                            {type === "visas" && (
                              <>
                                <div>{option.type} • {option.validity}</div>
                                <div>Processing: {option.processingTime}</div>
                              </>
                            )}
                            {type === "activities" && (
                              <>
                                <div>{option.duration} • Up to {option.participants} people</div>
                                <div>Includes: {option.includes}</div>
                              </>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div>
                            <span className="text-2xl font-bold text-primary">
                              {getCurrencySymbol()}{convertPrice(option.price)}
                            </span>
                            {selectedCurrency !== 'USD' && (
                              <span className="text-xs text-muted-foreground ml-2">(${option.price} USD)</span>
                            )}
                          </div>
                          <div className={`text-xs font-semibold px-3 py-1 rounded-full ${
                            selectedOption === i
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}>
                            {selectedOption === i ? "Selected" : "Select"}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="text-center">
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold px-8"
              >
                {loading ? "Processing..." : "Continue to Booking"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Booking;
