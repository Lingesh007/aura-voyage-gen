import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Calendar, MapPin } from "lucide-react";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { type, bookingId } = location.state || {};

  return (
    <div className="min-h-screen bg-luxury-charcoal relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-luxury-charcoal via-luxury-navy to-luxury-slate opacity-50" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-card/50 backdrop-blur-xl border-luxury-slate animate-scale-in text-center">
          {/* Success icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-green-500 opacity-30 animate-pulse" />
              <CheckCircle className="w-20 h-20 text-green-400 relative" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="font-luxury text-4xl font-bold text-gradient-gold mb-3">
            Booking Confirmed!
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Your {type || "travel"} booking has been successfully confirmed
          </p>

          {/* Booking details */}
          <div className="bg-luxury-slate/20 rounded-xl p-6 mb-8 border border-luxury-slate/40">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Booking ID:</span>
                <span className="font-mono text-luxury-gold font-semibold">
                  {bookingId || "TVX-XXXXXXX"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Service Type:</span>
                <span className="font-semibold text-foreground capitalize">
                  {type || "Travel Service"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-400 font-semibold">Confirmed</span>
              </div>

              <div className="pt-4 border-t border-luxury-slate/40">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>Confirmation sent to your email</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>Detailed itinerary available in dashboard</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="border-luxury-slate hover:bg-luxury-slate/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button
              onClick={() => navigate("/dashboard")}
              className="bg-luxury-gold hover:bg-luxury-gold-dark text-luxury-charcoal font-semibold"
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Support info */}
          <div className="mt-8 pt-6 border-t border-luxury-slate/40">
            <p className="text-sm text-muted-foreground">
              Need help? Contact our 24/7 concierge service at{" "}
              <a href="mailto:support@travax.com" className="text-luxury-gold hover:underline">
                support@travax.com
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Confirmation;
