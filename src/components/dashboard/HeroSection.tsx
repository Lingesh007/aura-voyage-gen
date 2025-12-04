import { Button } from "@/components/ui/button";
import { Bot, ArrowRight } from "lucide-react";
import heroCorporate from "@/assets/hero-corporate.jpg";
import heroIndividual from "@/assets/destination-beach.jpg";

interface HeroSectionProps {
  userType: 'corporate' | 'individual';
  onOpenAgent: () => void;
}

const HeroSection = ({ userType, onOpenAgent }: HeroSectionProps) => {
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

  return (
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
                onClick={() => window.location.href = '/booking/flights'}
              >
                Browse Manually
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
