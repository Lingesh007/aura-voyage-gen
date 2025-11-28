import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Mic, MicOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface TileSearchProps {
  category: string;
  placeholder?: string;
}

export const TileSearch = ({ category, placeholder }: TileSearchProps) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [aiResponse, setAiResponse] = useState("");
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsListening(false);
        // Auto-submit after voice input
        setTimeout(() => {
          handleSearchSubmit(transcript);
        }, 100);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: "Voice Input Error",
          description: "Could not recognize speech. Please try again.",
          variant: "destructive",
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceSearch = () => {
    if (!recognitionRef.current) {
      toast({
        title: "Not Supported",
        description: "Voice search is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
      toast({
        title: "Listening...",
        description: "Speak now to search",
      });
    }
  };

  const handleSearchSubmit = async (searchQuery?: string) => {
    const searchText = searchQuery || query;
    if (searchText.trim().length < 2 || loading) return;

    setLoading(true);
    setShowResults(true);
    setAiResponse("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "there";

      const searchPrompt = `Find ${category} options for: ${searchText}. Provide specific recommendations with details like names, prices, and key features.`;

      const { data, error } = await supabase.functions.invoke("travax-chat", {
        body: {
          messages: [{ role: "user", content: searchPrompt }],
          userName,
        },
      });

      if (error) throw error;

      setAiResponse(data.message);
    } catch (error: any) {
      console.error("Search error:", error);
      toast({
        title: "Search Failed",
        description: "Unable to get search results. Please try again.",
        variant: "destructive",
      });
      setShowResults(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSearchSubmit();
  };

  const handleBook = () => {
    const categoryMap: Record<string, string> = {
      flights: "flights",
      hotels: "hotels",
      activities: "activities",
      flight: "flights",
      hotel: "hotels",
      activity: "activities",
    };

    const bookingType = categoryMap[category.toLowerCase()] || "flights";
    navigate(`/booking/${bookingType}?fromAgent=true&details=${encodeURIComponent(aiResponse)}`);
  };

  return (
    <>
      <form onSubmit={handleSearch} className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder || `Search ${category}...`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-12 bg-background/50 backdrop-blur-sm border-border/50"
          disabled={loading || isListening}
        />
        <button
          type="button"
          onClick={toggleVoiceSearch}
          className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors ${
            isListening 
              ? "bg-primary text-primary-foreground animate-pulse" 
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
          disabled={loading}
          aria-label="Voice search"
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
      </form>

      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-pastel">
              {category} Search Results
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{aiResponse}</p>
              </div>
              
              {aiResponse && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleBook} className="flex-1">
                    Book Now
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setQuery("");
                      setShowResults(false);
                      setAiResponse("");
                    }}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
