import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, ArrowRight, Plane, Hotel, FileText, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import heroCorporate from "@/assets/hero-corporate.jpg";
import heroIndividual from "@/assets/destination-beach.jpg";

interface HeroSectionProps {
  userType: 'corporate' | 'individual';
  onOpenAgent: () => void;
}

const HeroSection = ({ userType, onOpenAgent }: HeroSectionProps) => {
  const [showBrowseOptions, setShowBrowseOptions] = useState(false);
  const navigate = useNavigate();
  const heroImage = userType === 'corporate' ? heroCorporate : heroIndividual;
  
  const content = userType === 'corporate' 
    ? {
        headline: "Travax — AI Travel Planning for Teams",
        subheadline: "Smart itineraries · Budget optimization · Corporate approvals",
        cta: "Start Planning with AI"
      }
    : {
        headline: "Travax — Your AI Travel Assistant",
        subheadline: "Smart itineraries · Budget optimization · Personalized recommendations",
        cta: "Plan My Trip with AI"
      };

  const browseOptions = [
    { icon: Plane, title: "Flights", description: "Search and book flights", path: "/booking/flights" },
    { icon: Hotel, title: "Hotels", description: "Find accommodations", path: "/booking/hotels" },
    { icon: FileText, title: "Visas", description: "Visa assistance", path: "/booking/visas" },
    { icon: Compass, title: "Activities", description: "Tours & experiences", path: "/booking/activities" },
  ];

  return (
    <>
      <div className="relative h-[280px] md:h-[360px] overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroImage} 
          alt="Professional travel" 
          className="w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powered by Multi-Agent AI</span>
              </div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
                {content.headline}
              </h2>
              
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                {content.subheadline}
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  size="lg" 
                  onClick={onOpenAgent}
                  className="gap-2 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all"
                >
                  <Bot className="w-5 h-5" />
                  {content.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg"
                  className="rounded-full"
                  onClick={() => setShowBrowseOptions(true)}
                >
                  Browse Manually
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Browse Options Dialog */}
      <Dialog open={showBrowseOptions} onOpenChange={setShowBrowseOptions}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">What would you like to book?</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {browseOptions.map((option) => (
              <button
                key={option.title}
                onClick={() => {
                  setShowBrowseOptions(false);
                  navigate(option.path);
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-xl border border-border bg-card hover:bg-accent hover:border-primary/30 transition-all group"
              >
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <option.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="font-medium text-foreground">{option.title}</span>
                <span className="text-xs text-muted-foreground text-center">{option.description}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default HeroSection;
