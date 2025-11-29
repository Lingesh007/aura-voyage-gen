import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Calendar, MapPin, User, Mail, Phone, Hash } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { type, bookingId, option, travelerDetails } = location.state || {};

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Travax Booking Confirmation", 20, 20);
    
    // Add booking details
    doc.setFontSize(12);
    doc.text(`Booking ID: ${bookingId || "TVX-XXXXXXX"}`, 20, 40);
    doc.text(`Service Type: ${type || "Travel Service"}`, 20, 50);
    doc.text(`Status: Confirmed`, 20, 60);
    
    let yPos = 80;
    
    // Add option details
    if (option) {
      doc.setFontSize(14);
      doc.text("Booking Details:", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.text(`Destination: ${option.destination}`, 25, yPos);
      yPos += 8;
      
      if (option.name) {
        doc.text(`${type === "hotels" ? "Hotel" : type === "visas" ? "Visa Type" : "Package"}: ${option.name}`, 25, yPos);
        yPos += 8;
      }
      
      if (option.departure) {
        doc.text(`Route: ${option.departure} → ${option.arrival}`, 25, yPos);
        yPos += 8;
      }
      
      if (option.date) {
        doc.text(`Date: ${option.date}`, 25, yPos);
        yPos += 8;
      }
      
      doc.text(`Price: $${option.price}`, 25, yPos);
      yPos += 15;
    }
    
    // Add traveler details
    if (travelerDetails) {
      doc.setFontSize(14);
      doc.text("Traveler Information:", 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      doc.text(`Name: ${travelerDetails.name}`, 25, yPos);
      yPos += 8;
      doc.text(`Age: ${travelerDetails.age}`, 25, yPos);
      yPos += 8;
      doc.text(`Email: ${travelerDetails.email}`, 25, yPos);
      yPos += 8;
      doc.text(`Phone: ${travelerDetails.phone}`, 25, yPos);
    }
    
    // Save PDF
    doc.save(`Travax-Booking-${bookingId || "Confirmation"}.pdf`);
    
    toast({
      title: "PDF Downloaded",
      description: "Your booking confirmation has been downloaded successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-6 md:p-8 bg-card border shadow-lg animate-scale-in text-center">
          {/* Success icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 blur-2xl bg-green-500 opacity-30 animate-pulse" />
              <CheckCircle className="w-20 h-20 text-green-400 relative" strokeWidth={1.5} />
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Booking Confirmed!
          </h1>
          
          <p className="text-muted-foreground text-lg mb-8">
            Your {type || "travel"} booking has been successfully confirmed
          </p>

          {/* Booking details */}
          <div className="bg-muted/30 rounded-lg p-4 md:p-6 mb-8 border">
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-muted-foreground text-sm">Booking ID:</span>
                <span className="font-mono text-primary font-semibold text-sm">
                  {bookingId || "TVX-XXXXXXX"}
                </span>
              </div>
              
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-muted-foreground text-sm">Service Type:</span>
                <span className="font-semibold text-foreground capitalize text-sm">
                  {type || "Travel Service"}
                </span>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-muted-foreground text-sm">Status:</span>
                <span className="text-green-600 font-semibold text-sm">Confirmed</span>
              </div>

              {option && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-foreground">Booking Details:</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination:</span>
                      <span className="font-medium">{option.destination}</span>
                    </div>
                    {option.name && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {type === "hotels" ? "Hotel" : type === "visas" ? "Visa Type" : "Package"}:
                        </span>
                        <span className="font-medium">{option.name}</span>
                      </div>
                    )}
                    {option.departure && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Route:</span>
                        <span className="font-medium">{option.departure} → {option.arrival}</span>
                      </div>
                    )}
                    {option.date && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">{option.date}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-luxury-slate/30">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-bold text-primary">${option.price}</span>
                    </div>
                  </div>
                </div>
              )}

              {travelerDetails && (
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-foreground">Traveler Information:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{travelerDetails.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Age:</span>
                      <span className="font-medium">{travelerDetails.age}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Email:</span>
                      <span className="font-medium">{travelerDetails.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Phone:</span>
                      <span className="font-medium">{travelerDetails.phone}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t">
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
            
            <Button
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </Button>
          </div>

          {/* Support info */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-xs md:text-sm text-muted-foreground">
              Need help? Contact our 24/7 support at{" "}
              <a href="mailto:support@travax.com" className="text-primary hover:underline">
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
