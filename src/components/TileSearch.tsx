import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
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
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2 || loading) return;

    setLoading(true);
    setShowResults(true);
    setAiResponse("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "there";

      const searchPrompt = `Find ${category} options for: ${query}. Provide specific recommendations with details like names, prices, and key features.`;

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
          className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
          disabled={loading}
        />
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
