import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Plane, Hotel, FileText, MapPin } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Booking = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "flights":
        return <Plane className="w-12 h-12 text-blue-400" strokeWidth={1.5} />;
      case "hotels":
        return <Hotel className="w-12 h-12 text-purple-400" strokeWidth={1.5} />;
      case "visas":
        return <FileText className="w-12 h-12 text-green-400" strokeWidth={1.5} />;
      case "activities":
        return <MapPin className="w-12 h-12 text-orange-400" strokeWidth={1.5} />;
      default:
        return <Plane className="w-12 h-12 text-luxury-gold" strokeWidth={1.5} />;
    }
  };

  const getTitle = () => {
    return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Booking";
  };

  const handleBooking = () => {
    setLoading(true);
    // Simulate booking process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Booking Initiated",
        description: "Your booking request has been submitted.",
      });
      navigate("/confirmation", { 
        state: { 
          type: type,
          bookingId: `TVX-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        } 
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-luxury-charcoal relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-charcoal via-luxury-navy to-luxury-slate opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-8 hover:bg-luxury-slate/20"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-card/50 backdrop-blur-xl border-luxury-slate animate-scale-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center mb-4">
                {getIcon()}
              </div>
              <h1 className="font-luxury text-4xl font-bold text-gradient-gold mb-2">
                Book {getTitle()}
              </h1>
              <p className="text-muted-foreground">
                Find and book the best {type} for your business travel
              </p>
            </div>

            {/* Placeholder for booking interface */}
            <div className="space-y-6 mb-8">
              <div className="p-6 rounded-lg bg-luxury-slate/20 border border-luxury-slate/40">
                <h3 className="font-semibold text-foreground mb-2">Search & Filter</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced search functionality coming soon. For now, use the AI agent for personalized recommendations.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-luxury-navy/30 border border-luxury-slate/30 hover:border-luxury-gold/40 transition-colors cursor-pointer"
                  >
                    <div className="aspect-video bg-luxury-slate/20 rounded-lg mb-3" />
                    <h4 className="font-semibold text-foreground mb-1">Option {i}</h4>
                    <p className="text-sm text-muted-foreground mb-2">Premium selection</p>
                    <div className="flex items-center justify-between">
                      <span className="text-luxury-gold font-bold">From $999</span>
                      <Button size="sm" variant="outline" className="border-luxury-slate">
                        Select
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-charcoal font-semibold px-8"
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
