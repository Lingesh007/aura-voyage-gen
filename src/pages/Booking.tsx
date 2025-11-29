import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plane, Hotel, FileText, MapPin, Star, Clock, User } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
            date: "Dec 15, 2024",
            duration: "7h 30m",
            price: 1250,
            class: "Business Class"
          },
          {
            image: flightBusiness,
            destination: "Tokyo",
            departure: "San Francisco",
            arrival: "Tokyo Narita",
            date: "Dec 20, 2024",
            duration: "11h 45m",
            price: 1850,
            class: "Business Class"
          },
          {
            image: flightLounge,
            destination: "Dubai",
            departure: "Los Angeles",
            arrival: "Dubai International",
            date: "Dec 18, 2024",
            duration: "16h 20m",
            price: 2100,
            class: "First Class"
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
            price: 850,
            amenities: "Spa, Pool, Restaurant"
          },
          {
            image: hotelDubai,
            destination: "Dubai",
            name: "Burj Al Arab",
            rating: 5,
            location: "Marina District",
            date: "4 nights",
            price: 1200,
            amenities: "Beach, Spa, Fine Dining"
          },
          {
            image: hotelTokyo,
            destination: "Tokyo",
            name: "Aman Tokyo",
            rating: 5,
            location: "Shibuya District",
            date: "5 nights",
            price: 980,
            amenities: "Zen Garden, Spa, Onsen"
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
                                <div className="flex items-center gap-2">
                                  <Clock className="w-3 h-3" />
                                  {option.duration} • {option.class}
                                </div>
                                <div>{option.date}</div>
                              </>
                            )}
                            {type === "hotels" && (
                              <>
                                <div>{option.location} • {option.date}</div>
                                <div>{option.amenities}</div>
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
                          <span className="text-2xl font-bold text-primary">
                            ${option.price}
                          </span>
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
