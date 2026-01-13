import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Mic, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AISearchBarProps {
  onOpenAgent: () => void;
  placeholder?: string;
}

const AISearchBar = ({ onOpenAgent, placeholder }: AISearchBarProps) => {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    // Default to flights for trip planning queries
    return 'flights';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      onOpenAgent();
      return;
    }

    setIsLoading(true);

    try {
      const bookingType = detectBookingType(query);
      
      // Call the AI travel search function
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: bookingType,
          query: query,
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
        // Store the AI response in sessionStorage for the booking page
        const bookingData = {
          type: bookingType,
          query: query,
          options: data.data,
          summary: data.summary,
          tips: data.tips
        };
        sessionStorage.setItem('agentBookingData', JSON.stringify(bookingData));
        
        // Navigate to booking page with fromAgent flag
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

  const handleSuggestionClick = async (suggestion: string) => {
    setQuery(suggestion);
    
    // Directly process the suggestion
    setIsLoading(true);
    
    try {
      const bookingType = detectBookingType(suggestion);
      
      const { data, error } = await supabase.functions.invoke('ai-travel-search', {
        body: {
          searchType: bookingType,
          query: suggestion,
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
          query: suggestion,
          options: data.data,
          summary: data.summary,
          tips: data.tips
        };
        sessionStorage.setItem('agentBookingData', JSON.stringify(bookingData));
        navigate(`/booking/${bookingType}?fromAgent=true`);
      } else {
        toast({
          title: "No Results",
          description: "No options found. Try a different search.",
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

  const suggestions = [
    "Plan a 3-day business trip to Dubai under $2,000",
    "Find cheapest flights to Tokyo next month",
    "Book a team retreat for 10 people in Bali"
  ];

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <div className="absolute left-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || "Ask Travax AI... 'Plan a romantic getaway under $2,000'"}
            className="w-full pl-12 pr-24 py-6 text-base rounded-full border-2 border-border focus:border-primary bg-background/80 backdrop-blur"
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

      {/* Quick Suggestions */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {suggestions.map((suggestion, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
            className="text-xs rounded-full bg-background/50 hover:bg-primary/10 hover:border-primary/30"
          >
            <Sparkles className="w-3 h-3 mr-1 text-primary" />
            {suggestion}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default AISearchBar;
