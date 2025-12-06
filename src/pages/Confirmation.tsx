import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, Download, Calendar, MapPin, User, Mail, Phone, Hash, Plane, Hotel, Clock, FileText } from "lucide-react";
import { jsPDF } from "jspdf";
import { useToast } from "@/hooks/use-toast";

const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { type, bookingId, option, travelerDetails } = location.state || {};

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header with branding
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("TRAVAX", 20, 25);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Your AI-Powered Travel Partner", 20, 32);
    
    // Booking confirmation title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Booking Confirmation", 20, 55);
    
    // Booking ID badge
    doc.setFillColor(240, 249, 255);
    doc.roundedRect(20, 60, 80, 15, 3, 3, 'F');
    doc.setFontSize(10);
    doc.setTextColor(59, 130, 246);
    doc.text(`Booking ID: ${bookingId || "TVX-XXXXXXX"}`, 25, 69);
    
    // Status
    doc.setTextColor(34, 197, 94);
    doc.setFontSize(12);
    doc.text("✓ CONFIRMED", 120, 69);
    
    let yPos = 90;
    
    // Service type section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const serviceTitle = type ? `${type.charAt(0).toUpperCase() + type.slice(1)} Details` : "Booking Details";
    doc.text(serviceTitle, 20, yPos);
    yPos += 8;
    
    doc.setDrawColor(229, 231, 235);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    if (option) {
      // Destination
      doc.setTextColor(107, 114, 128);
      doc.text("Destination:", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(option.destination || "N/A", 80, yPos);
      yPos += 10;
      
      if (type === "flights") {
        // Flight specific details
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Flight Code:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.flightCode || option.airline || "N/A", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Route:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${option.departure || "Origin"} → ${option.arrival || "Destination"}`, 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Departure:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${option.date || "TBD"} at ${option.departureTime || "TBD"}`, 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Arrival:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${option.arrivalTime || "TBD"}`, 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Duration:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.duration || "N/A", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Layover:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.layover || "Direct", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Class:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.class || "Economy", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Points Earned:", 25, yPos);
        doc.setTextColor(59, 130, 246);
        doc.setFont("helvetica", "bold");
        doc.text(`+${option.pointsEarned || 0} points`, 80, yPos);
        yPos += 15;
        
      } else if (type === "hotels") {
        // Hotel specific details
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Hotel Name:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.name || "N/A", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Check-in:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.checkIn || "TBD", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Check-out:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.checkOut || "TBD", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Duration:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`${option.nights || option.date || "N/A"} nights`, 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Location:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(option.location || "N/A", 80, yPos);
        yPos += 10;
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(107, 114, 128);
        doc.text("Per Night:", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "bold");
        doc.text(`$${option.pricePerNight || Math.round(option.price / (option.nights || 1))}`, 80, yPos);
        yPos += 10;
        
        if (option.amenities) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(107, 114, 128);
          doc.text("Amenities:", 25, yPos);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.text(option.amenities, 80, yPos);
          yPos += 15;
        }
        
      } else {
        // Generic booking details
        if (option.name) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(107, 114, 128);
          doc.text("Service:", 25, yPos);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.text(option.name, 80, yPos);
          yPos += 10;
        }
        
        if (option.date || option.duration) {
          doc.setFont("helvetica", "normal");
          doc.setTextColor(107, 114, 128);
          doc.text("Duration:", 25, yPos);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "bold");
          doc.text(option.duration || option.date || "N/A", 80, yPos);
          yPos += 15;
        }
      }
      
      // Price section
      doc.setFillColor(240, 253, 244);
      doc.roundedRect(20, yPos - 5, pageWidth - 40, 20, 3, 3, 'F');
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.setFont("helvetica", "normal");
      doc.text("Total Amount:", 25, yPos + 7);
      doc.setTextColor(34, 197, 94);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`$${option.price || 0}`, 90, yPos + 7);
      yPos += 30;
    }
    
    // Traveler Information section
    if (travelerDetails) {
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Traveler Information", 20, yPos);
      yPos += 8;
      
      doc.setDrawColor(229, 231, 235);
      doc.line(20, yPos, pageWidth - 20, yPos);
      yPos += 10;
      
      doc.setFontSize(11);
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Full Name:", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(travelerDetails.name || "N/A", 80, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Age:", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(String(travelerDetails.age || "N/A"), 80, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Email:", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(travelerDetails.email || "N/A", 80, yPos);
      yPos += 10;
      
      doc.setFont("helvetica", "normal");
      doc.setTextColor(107, 114, 128);
      doc.text("Phone:", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(travelerDetails.phone || "N/A", 80, yPos);
      yPos += 20;
    }
    
    // Footer
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 270, pageWidth, 30, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text("Thank you for booking with Travax!", pageWidth / 2, 280, { align: "center" });
    doc.text("For support: support@travax.com | +1-800-TRAVAX", pageWidth / 2, 286, { align: "center" });
    
    // Save PDF
    doc.save(`Travax-Itinerary-${bookingId || "Booking"}.pdf`);
    
    toast({
      title: "Itinerary Downloaded",
      description: "Your complete travel itinerary has been downloaded as PDF.",
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
                  <h4 className="font-semibold mb-3 text-foreground">Booking Details:</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Destination:</span>
                      <span className="font-medium">{option.destination}</span>
                    </div>
                    
                    {type === "flights" && (
                      <>
                        {option.flightCode && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Flight Code:</span>
                            <span className="font-medium">{option.flightCode}</span>
                          </div>
                        )}
                        {option.departure && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Route:</span>
                            <span className="font-medium">{option.departure} → {option.arrival}</span>
                          </div>
                        )}
                        {option.departureTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Departure Time:</span>
                            <span className="font-medium">{option.departureTime}</span>
                          </div>
                        )}
                        {option.arrivalTime && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Arrival Time:</span>
                            <span className="font-medium">{option.arrivalTime}</span>
                          </div>
                        )}
                        {option.duration && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{option.duration}</span>
                          </div>
                        )}
                        {option.layover && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Layover:</span>
                            <span className="font-medium">{option.layover}</span>
                          </div>
                        )}
                        {option.class && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Class:</span>
                            <span className="font-medium">{option.class}</span>
                          </div>
                        )}
                        {option.pointsEarned && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Points Earned:</span>
                            <span className="font-medium text-primary">+{option.pointsEarned} pts</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {type === "hotels" && (
                      <>
                        {option.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Hotel:</span>
                            <span className="font-medium">{option.name}</span>
                          </div>
                        )}
                        {option.checkIn && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-in:</span>
                            <span className="font-medium">{option.checkIn}</span>
                          </div>
                        )}
                        {option.checkOut && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Check-out:</span>
                            <span className="font-medium">{option.checkOut}</span>
                          </div>
                        )}
                        {option.nights && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="font-medium">{option.nights} nights</span>
                          </div>
                        )}
                        {option.pricePerNight && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Per Night:</span>
                            <span className="font-medium">${option.pricePerNight}</span>
                          </div>
                        )}
                        {option.location && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Location:</span>
                            <span className="font-medium">{option.location}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    {type !== "flights" && type !== "hotels" && (
                      <>
                        {option.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              {type === "visas" ? "Visa Type" : "Package"}:
                            </span>
                            <span className="font-medium">{option.name}</span>
                          </div>
                        )}
                        {option.date && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Date:</span>
                            <span className="font-medium">{option.date}</span>
                          </div>
                        )}
                      </>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t border-border">
                      <span className="text-muted-foreground">Total Price:</span>
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
              className="border-primary/30 hover:bg-primary/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Itinerary PDF
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
