import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, ArrowRight, Plane, Hotel, FileText, Compass, Mic, Sparkles, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import heroCorporate from "@/assets/hero-corporate.jpg";
import heroIndividual from "@/assets/destination-beach.jpg";

interface HeroSectionProps {
  userType: 'corporate' | 'individual';
  onOpenAgent: () => void;
}

const HeroSection = ({ userType, onOpenAgent }: HeroSectionProps) => {
  const [showBrowseOptions, setShowBrowseOptions] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
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

  const quickSuggestions = userType === 'corporate' 
    ? [
        "Plan a 3-day business trip to Dubai under $2,000",
        "Find cheapest flights to Tokyo next month",
        "Book a team retreat for 10 people in Bali"
      ]
    : [
        "Plan a 3-day business trip to Dubai under $2,000",
        "Find cheapest flights to Tokyo next month",
        "Book a team retreat for 10 people in Bali"
      ];

  // Detect the booking type from query
  const detectBookingType = (searchQuery: string): string => {
    const lowerQuery = searchQuery.toLowerCase();
    if (lowerQuery.includes('flight') || lowerQuery.includes('fly') || lowerQuery.includes('airline')) {
      return 'flights';
    }
    if (lowerQuery.includes('hotel') || lowerQuery.includes('stay') || lowerQuery.includes('accommodation') || lowerQuery.includes('resort')) {
      return 'hotels';
    }
    if (lowerQuery.includes('visa') || lowerQuery.includes('permit')) {
      return 'visas';
    }
    if (lowerQuery.includes('activity') || lowerQuery.includes('tour') || lowerQuery.includes('experience') || lowerQuery.includes('adventure')) {
      return 'activities';
    }
    return 'flights';
  };

  const processSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      onOpenAgent();
      return;
    }

    setIsLoading(true);

    try {
      const bookingType = detectBookingType(searchQuery);
      
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: bookingType,
          query: searchQuery,
        }
      });

      if (error) {
        console.error('AI search error:', error);
        toast({
          title: "Search Error",
          description: "Unable to process your request. Please try again.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (data?.data && data.data.length > 0) {
        const bookingData = {
          type: bookingType,
          query: searchQuery,
          options: data.data,
          summary: data.summary,
          tips: data.tips
        };
        sessionStorage.setItem('agentBookingData', JSON.stringify(bookingData));
        navigate(`/booking/${bookingType}?fromAgent=true`);
      } else {
        toast({
          title: "No Results",
          description: "No options found. Try refining your search.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processSearch(query);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    await processSearch(suggestion);
  };

  return (
    <>
      <div className="relative min-h-[480px] md:min-h-[520px] overflow-hidden">
        {/* Background Image */}
        <img 
          src={heroImage} 
          alt="Professional travel" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        {/* Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl animate-fade-in">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-4">
                <Bot className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Powered by Multi-Agent AI</span>
              </div>
              
              {/* Headline */}
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-3 leading-tight">
                {content.headline}
              </h2>
              
              {/* Subheadline */}
              <p className="text-muted-foreground text-base md:text-lg mb-6">
                {content.subheadline}
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
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

              {/* AI Search Bar - Integrated into Hero */}
              <div className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="relative">
                  <div className="relative flex items-center">
                    <div className="absolute left-4 flex items-center gap-2">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <Input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask Travax AI... 'Plan a romantic getaway under $2,000'"
                      className="w-full pl-12 pr-24 py-6 text-base rounded-full border-2 border-border/50 focus:border-primary bg-background/80 backdrop-blur-md shadow-lg"
                      disabled={isLoading}
                    />
                    <div className="absolute right-2 flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full text-muted-foreground hover:text-primary"
                        disabled={isLoading}
                      >
                        <Mic className="w-5 h-5" />
                      </Button>
                      <Button
                        type="submit"
                        size="icon"
                        className="rounded-full bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </form>

                {/* Quick Suggestions / Conversational Starters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestionClick(suggestion)}
                      disabled={isLoading}
                      className="text-xs rounded-full bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/30 border-border/50"
                    >
                      <Sparkles className="w-3 h-3 mr-1 text-primary" />
                      {suggestion}
                    </Button>
                  ))}
                </div>
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
