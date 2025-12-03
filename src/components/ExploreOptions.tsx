import { useState } from "react";
import { Plane, Hotel, FileText, MapPin, Sparkles, Bot, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TileSearch } from "@/components/TileSearch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import cityImage from "@/assets/destination-city.jpg";
import mountainImage from "@/assets/destination-mountain.jpg";
import culturalImage from "@/assets/destination-cultural.jpg";
import beachImage from "@/assets/destination-beach.jpg";

interface ExploreOptionsProps {
  onOpenAgent: () => void;
}

const ExploreOptions = ({ onOpenAgent }: ExploreOptionsProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  const options = [
    {
      icon: Plane,
      title: "Flights",
      description: "AI-optimized routes & fares",
      badge: "Smart Bundles",
      image: cityImage,
      path: "/booking/flights",
      prompt: "Show me the best flight deals available right now. Include top destinations with prices, best airlines, and any special offers. Focus on popular routes and budget-friendly options.",
    },
    {
      icon: Hotel,
      title: "Hotels",
      description: "Best rates guaranteed",
      badge: "Price Match",
      image: mountainImage,
      path: "/booking/hotels",
      prompt: "Show me trending hotel deals and recommendations. Include luxury hotels, boutique stays, and budget-friendly options across popular destinations. Mention current discounts and special packages.",
    },
    {
      icon: FileText,
      title: "Visas",
      description: "Fast-track processing",
      badge: "24hr Service",
      image: culturalImage,
      path: "/booking/visas",
      prompt: "Provide visa requirements and processing information for top travel destinations. Include visa-free countries, e-visa options, and countries with easy visa processes. Mention processing times and required documents.",
    },
    {
      icon: MapPin,
      title: "Activities",
      description: "Curated experiences",
      badge: "Local Experts",
      image: beachImage,
      path: "/booking/activities",
      prompt: "Recommend top activities and experiences for travelers. Include adventure activities, cultural tours, food experiences, and unique local experiences across popular destinations. Mention prices and booking tips.",
    },
  ];

  const handleTileClick = async (category: string, prompt: string) => {
    setSelectedCategory(category);
    setLoading(true);
    setAiResponse("");

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || "there";

      const { data, error } = await supabase.functions.invoke("travax-chat", {
        body: {
          messages: [{ role: "user", content: prompt }],
          userName,
        },
      });

      if (error) throw error;
      setAiResponse(data.message);
    } catch (error: any) {
      console.error("AI fetch error:", error);
      toast({
        title: "Failed to load recommendations",
        description: "Please try again or use the search bar.",
        variant: "destructive",
      });
      setSelectedCategory(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = () => {
    if (!selectedCategory) return;
    const categoryMap: Record<string, string> = {
      Flights: "flights",
      Hotels: "hotels",
      Visas: "visas",
      Activities: "activities",
    };
    const bookingType = categoryMap[selectedCategory] || "flights";
    navigate(`/booking/${bookingType}?fromAgent=true&details=${encodeURIComponent(aiResponse)}`);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Explore & Book
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Click any tile for AI-powered recommendations</p>
        </div>
        <Button variant="outline" onClick={onOpenAgent} className="gap-2">
          <Bot className="w-4 h-4" />
          Let AI Plan Everything
        </Button>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {options.map((option, index) => (
          <div key={index} className="space-y-3">
            <div
              onClick={() => handleTileClick(option.title, option.prompt)}
              className="group relative h-72 rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-lg cursor-pointer"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Image with reduced saturation */}
              <img 
                src={option.image} 
                alt={`${option.title} destination`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 saturate-[0.8]"
              />
              
              {/* Gradient Overlay - more prominent */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
              
              {/* AI Badge */}
              <Badge className="absolute top-4 left-4 z-10 bg-primary/90 text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                {option.badge}
              </Badge>
              
              {/* AI Button */}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenAgent();
                }}
                size="sm"
                variant="secondary"
                className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Bot className="w-4 h-4 mr-1" />
                AI
              </Button>
              
              {/* Content */}
              <div className="absolute inset-0 p-6 flex flex-col justify-end text-left w-full">
                <option.icon className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </div>
            </div>
            
            {/* Search Bar Under Each Tile */}
            <TileSearch 
              category={option.title.toLowerCase()} 
              placeholder={`Search ${option.title.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>

      {/* AI Response Dialog */}
      <Dialog open={!!selectedCategory} onOpenChange={(open) => !open && setSelectedCategory(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {selectedCategory} Recommendations
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Getting AI recommendations...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap leading-relaxed">{aiResponse}</p>
              </div>
              
              {aiResponse && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button onClick={handleBook} className="flex-1">
                    Book {selectedCategory}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedCategory(null)}
                  >
                    Close
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExploreOptions;
