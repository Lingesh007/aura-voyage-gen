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

  // Flight search inputs
  const [departureCity, setDepartureCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [departureDate, setDepartureDate] = useState<Date | undefined>(undefined);
  const [returnDate, setReturnDate] = useState<Date | undefined>(undefined);
  const [isRoundTrip, setIsRoundTrip] = useState(true);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hotelSearchResults, setHotelSearchResults] = useState<any[]>([]);
  const [visaSearchResults, setVisaSearchResults] = useState<any[]>([]);
  const [activitySearchResults, setActivitySearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSummary, setSearchSummary] = useState<string>("");

  // Visa search inputs
  const [visaDestination, setVisaDestination] = useState("");
  const [visaType, setVisaType] = useState("business");
  
  // Activity search inputs
  const [activityDestination, setActivityDestination] = useState("");
  const [activityDate, setActivityDate] = useState<Date | undefined>(undefined);

  // Hotel search inputs
  const [hotelDestination, setHotelDestination] = useState("");
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

  // Search for flights with AI enhancement
  const handleFlightSearch = async () => {
    if (!departureCity || !destinationCity || !departureDate) {
      toast({
        title: "Missing Information",
        description: "Please enter departure city, destination, and departure date.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      // Use AI-powered search for unique recommendations
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: 'flights',
          query: `Flights from ${departureCity} to ${destinationCity}`,
          departure: departureCity,
          destination: destinationCity,
          departureDate: format(departureDate, 'yyyy-MM-dd'),
          returnDate: returnDate ? format(returnDate, 'yyyy-MM-dd') : undefined,
          adults: passengers.adults,
          children: passengers.children
        }
      });

      if (error) {
        console.error('AI flight search error:', error);
        toast({
          title: "Search Error",
          description: "Unable to search flights. Please try again.",
          variant: "destructive",
        });
        setSearchResults([]);
      } else if (data?.data && data.data.length > 0) {
        const formattedResults = data.data.map((flight: any, index: number) => ({
          image: [flightAirplane, flightBusiness, flightLounge][index % 3],
          destination: flight.destination || destinationCity,
          departure: flight.departure || departureCity,
          arrival: flight.arrival || destinationCity,
          departureTime: flight.departureTime || "N/A",
          arrivalTime: flight.arrivalTime || "N/A",
          date: format(departureDate, "MMM d, yyyy"),
          duration: flight.duration || "N/A",
          price: flight.price || 0,
          class: flight.class || "Economy",
          flightCode: flight.flightCode || "N/A",
          layover: flight.layover || "Direct",
          airline: flight.airline || "N/A",
          pointsEarned: flight.pointsEarned || Math.round((flight.price || 0) * 2),
          name: flight.name,
          highlights: flight.highlights,
          deal: flight.deal
        }));
        setSearchResults(formattedResults);
        setSearchSummary(data.summary || `Found ${formattedResults.length} flight options for your trip.`);
      } else {
        setSearchResults([]);
        setSearchSummary("");
        toast({
          title: "No Results",
          description: "No flights found for the selected route. Try different dates or cities.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      toast({
        title: "Search Error",
        description: "An error occurred while searching.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Search for hotels with AI enhancement
  const handleHotelSearch = async () => {
    if (!hotelDestination || !checkInDate || !checkOutDate) {
      toast({
        title: "Missing Information",
        description: "Please enter destination city, check-in and check-out dates.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      const nights = differenceInDays(checkOutDate, checkInDate);
      
      // Use AI-powered search for unique recommendations
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: 'hotels',
          query: `Hotels in ${hotelDestination}`,
          destination: hotelDestination,
          checkInDate: format(checkInDate, 'yyyy-MM-dd'),
          checkOutDate: format(checkOutDate, 'yyyy-MM-dd'),
          adults: guests.adults,
          children: guests.children,
          rooms: rooms
        }
      });

      if (error) {
        console.error('AI hotel search error:', error);
        toast({
          title: "Search Error",
          description: "Unable to search hotels. Please try again.",
          variant: "destructive",
        });
        setHotelSearchResults([]);
      } else if (data?.data && data.data.length > 0) {
        const formattedResults = data.data.map((hotel: any, index: number) => ({
          image: [hotelParis, hotelDubai, hotelTokyo][index % 3],
          destination: hotel.destination || hotelDestination,
          name: hotel.name || 'Hotel',
          rating: hotel.rating || 4,
          location: hotel.location || hotelDestination,
          date: `${nights} night${nights > 1 ? 's' : ''}`,
          nights: nights,
          checkIn: format(checkInDate, "MMM d, yyyy"),
          checkOut: format(checkOutDate, "MMM d, yyyy"),
          price: hotel.price || 0,
          pricePerNight: hotel.pricePerNight || (hotel.price ? hotel.price / nights : 0),
          amenities: hotel.amenities || "WiFi, Business Center",
          totalCost: hotel.price || 0,
          roomType: hotel.roomType || "Standard Room",
          available: true,
          highlights: hotel.highlights,
          deal: hotel.deal
        }));
        setHotelSearchResults(formattedResults);
        setSearchSummary(data.summary || `Found ${formattedResults.length} hotel options for your stay.`);
      } else {
        setHotelSearchResults([]);
        setSearchSummary("");
        toast({
          title: "No Results",
          description: "No hotels found for the selected destination. Try a different city.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Hotel search error:', error);
      setHotelSearchResults([]);
      toast({
        title: "Search Error",
        description: "An error occurred while searching.",
        variant: "destructive",
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Search for visas with AI
  const handleVisaSearch = async () => {
    if (!visaDestination) {
      toast({
        title: "Missing Information",
        description: "Please enter destination country for visa search.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: 'visas',
          query: `${visaType} visa for ${visaDestination}`,
          destination: visaDestination,
          preferences: [visaType]
        }
      });

      if (error) {
        console.error('AI visa search error:', error);
        toast({
          title: "Search Error",
          description: "Unable to search visas. Please try again.",
          variant: "destructive",
        });
        setVisaSearchResults([]);
      } else if (data?.data && data.data.length > 0) {
        const formattedResults = data.data.map((visa: any, index: number) => ({
          image: [flightAirplane, flightBusiness, flightLounge][index % 3],
          destination: visa.destination || visaDestination,
          name: visa.name || `${visaType} Visa`,
          processingTime: visa.processingTime || "5-7 days",
          validity: visa.validity || "90 days",
          price: visa.price || 0,
          type: visa.visaType || "Single Entry",
          highlights: visa.highlights,
          deal: visa.deal
        }));
        setVisaSearchResults(formattedResults);
        setSearchSummary(data.summary || `Found ${formattedResults.length} visa options.`);
      } else {
        setVisaSearchResults([]);
        setSearchSummary("");
        toast({
          title: "No Results",
          description: "No visa options found for this destination.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Visa search error:', error);
      setVisaSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Search for activities with AI
  const handleActivitySearch = async () => {
    if (!activityDestination) {
      toast({
        title: "Missing Information",
        description: "Please enter destination for activity search.",
        variant: "destructive",
      });
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: 'activities',
          query: `Business activities and experiences in ${activityDestination}`,
          destination: activityDestination,
          departureDate: activityDate ? format(activityDate, 'yyyy-MM-dd') : undefined
        }
      });

      if (error) {
        console.error('AI activity search error:', error);
        toast({
          title: "Search Error",
          description: "Unable to search activities. Please try again.",
          variant: "destructive",
        });
        setActivitySearchResults([]);
      } else if (data?.data && data.data.length > 0) {
        const formattedResults = data.data.map((activity: any, index: number) => ({
          image: [hotelParis, hotelDubai, hotelTokyo][index % 3],
          destination: activity.destination || activityDestination,
          name: activity.name || 'Experience',
          duration: activity.duration || "Half Day",
          participants: activity.participants || "Up to 10",
          price: activity.price || 0,
          includes: activity.includes || "Guide, Transport",
          highlights: activity.highlights,
          deal: activity.deal
        }));
        setActivitySearchResults(formattedResults);
        setSearchSummary(data.summary || `Found ${formattedResults.length} activities.`);
      } else {
        setActivitySearchResults([]);
        setSearchSummary("");
        toast({
          title: "No Results",
          description: "No activities found for this destination.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Activity search error:', error);
      setActivitySearchResults([]);
    } finally {
      setSearchLoading(false);
    }
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

  // Determine which options to show - ONLY show after user searches
  const getDisplayOptions = () => {
    // Show AI agent options only if user came from agent AND has booking data
    if (fromAgent) {
      const agentOptions = parseAIOptions();
      if (agentOptions.length > 0) return agentOptions;
      // If no agent data, don't show anything until user searches
      return [];
    }
    // Only show search results - no static fallback
    if (type === "flights" && searchResults.length > 0) return searchResults;
    if (type === "hotels" && hotelSearchResults.length > 0) return hotelSearchResults;
    if (type === "visas" && visaSearchResults.length > 0) return visaSearchResults;
    if (type === "activities" && activitySearchResults.length > 0) return activitySearchResults;
    // Return empty array - user must search to see options
    return [];
  };
  
  const options = getDisplayOptions();

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
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5 text-primary" />
                    <h3 className="font-semibold text-lg">Flight Search</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="round-trip"
                      checked={isRoundTrip}
                      onCheckedChange={setIsRoundTrip}
                    />
                    <Label htmlFor="round-trip" className="cursor-pointer text-sm">Round Trip</Label>
                  </div>
                </div>

                {/* Departure and Destination Cities */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>From (Departure City) *</Label>
                    <div className="relative mt-1">
                      <PlaneTakeoff className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., New York or JFK"
                        value={departureCity}
                        onChange={(e) => setDepartureCity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>To (Destination City) *</Label>
                    <div className="relative mt-1">
                      <PlaneLanding className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., London or LHR"
                        value={destinationCity}
                        onChange={(e) => setDestinationCity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>

                {/* Date Pickers */}
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

                {/* Search Summary and Button */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {departureCity && destinationCity && departureDate && (
                    <div className="flex items-center gap-3 p-3 bg-primary/10 rounded-lg flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">{departureCity.toUpperCase()}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium">{destinationCity.toUpperCase()}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm">{format(departureDate, "MMM d")}</span>
                      {isRoundTrip && returnDate && (
                        <>
                          <span className="text-xs text-muted-foreground">-</span>
                          <span className="text-sm">{format(returnDate, "MMM d")}</span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {totalPassengers} {totalPassengers === 1 ? 'passenger' : 'passengers'}
                      </span>
                    </div>
                  )}
                  <Button 
                    onClick={handleFlightSearch}
                    disabled={searchLoading || !departureCity || !destinationCity || !departureDate}
                    className="w-full sm:w-auto"
                  >
                    {searchLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Plane className="w-4 h-4 mr-2" />
                        Search Flights
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* Hotel Search Section */}
            {type === "hotels" && (
              <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <Hotel className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-lg">Hotel Search</h3>
                </div>

                {/* Destination Input */}
                <div className="mb-4">
                  <Label>Destination *</Label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="e.g., Paris, Dubai, Tokyo"
                      value={hotelDestination}
                      onChange={(e) => setHotelDestination(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Date Pickers */}
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

                {/* Search Summary and Button */}
                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {hotelDestination && checkInDate && checkOutDate && (
                    <div className="flex items-center flex-wrap gap-3 p-3 bg-primary/10 rounded-lg flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="font-medium">{hotelDestination}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">•</span>
                      <div className="flex items-center gap-2 text-sm">
                        <span>{format(checkInDate, "MMM d")}</span>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <span>{format(checkOutDate, "MMM d")}</span>
                      </div>
                      <span className="text-sm font-semibold text-primary">
                        ({calculateNights()} {calculateNights() === 1 ? 'night' : 'nights'})
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {rooms} {rooms === 1 ? 'room' : 'rooms'}, {totalGuests} {totalGuests === 1 ? 'guest' : 'guests'}
                      </span>
                    </div>
                  )}
                  <Button 
                    onClick={handleHotelSearch}
                    disabled={!hotelDestination || !checkInDate || !checkOutDate}
                    className="w-full sm:w-auto"
                  >
                    <Hotel className="w-4 h-4 mr-2" />
                    Search Hotels
                  </Button>
                </div>
              </div>
            )}

            {/* Visa Search Section */}
            {type === "visas" && (
              <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="w-5 h-5 text-accent" />
                  <h3 className="font-semibold text-lg">Visa Search</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Destination Country *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., United Kingdom, Japan, UAE"
                        value={visaDestination}
                        onChange={(e) => setVisaDestination(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Visa Type</Label>
                    <Select value={visaType} onValueChange={setVisaType}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select visa type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="business">Business Visa</SelectItem>
                        <SelectItem value="tourist">Tourist Visa</SelectItem>
                        <SelectItem value="work">Work Visa</SelectItem>
                        <SelectItem value="transit">Transit Visa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button 
                  onClick={handleVisaSearch}
                  disabled={!visaDestination || searchLoading}
                  className="w-full sm:w-auto"
                >
                  {searchLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Search Visa Options
                </Button>
              </div>
            )}

            {/* Activities Search Section */}
            {type === "activities" && (
              <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-pastel-coral" />
                  <h3 className="font-semibold text-lg">Activity Search</h3>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Destination City *</Label>
                    <div className="relative mt-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="e.g., Paris, Dubai, Tokyo"
                        value={activityDestination}
                        onChange={(e) => setActivityDestination(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Activity Date (Optional)</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !activityDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {activityDate ? format(activityDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-popover" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={activityDate}
                          onSelect={setActivityDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <Button 
                  onClick={handleActivitySearch}
                  disabled={!activityDestination || searchLoading}
                  className="w-full sm:w-auto"
                >
                  {searchLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <MapPin className="w-4 h-4 mr-2" />
                  )}
                  Search Activities
                </Button>
              </div>
            )}

            {/* Traveler Details - Only show after selection */}
            {selectedOption !== null && (
            <div className="mb-8 bg-muted/30 p-6 rounded-xl border border-border animate-fade-in">
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
            )}

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
              <div className="flex flex-col gap-2">
                <h3 className="font-semibold text-lg">
                  {fromAgent ? "AI Recommended Options" : options.length > 0 ? "Search Results" : "Available Options"}
                </h3>
                {searchSummary && options.length > 0 && (
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <p className="text-sm text-foreground">{searchSummary}</p>
                    <p className="text-xs text-muted-foreground mt-2">Select an option below to proceed with booking.</p>
                  </div>
                )}
              </div>
              {searchLoading ? (
                <div className="text-center py-12">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary mb-4" />
                  <p className="text-muted-foreground">Searching for the best {type}...</p>
                </div>
              ) : options.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-border">
                  {hasSearched ? (
                    <>
                      <Plane className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="font-medium mb-2">No {type} found for your search</p>
                      <p className="text-sm">Try adjusting your dates or destinations, or use the AI assistant for personalized recommendations.</p>
                    </>
                  ) : (
                    <>
                      <p className="font-medium mb-2">Enter your search criteria above</p>
                      <p className="text-sm">Fill in the details and click "Search" to find available options.</p>
                    </>
                  )}
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
