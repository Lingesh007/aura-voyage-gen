import { useNavigate } from "react-router-dom";
import { Plane, Hotel, FileText, MapPin, Sparkles, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TileSearch } from "@/components/TileSearch";
import cityImage from "@/assets/destination-city.jpg";
import mountainImage from "@/assets/destination-mountain.jpg";
import culturalImage from "@/assets/destination-cultural.jpg";
import beachImage from "@/assets/destination-beach.jpg";

interface ExploreOptionsProps {
  onOpenAgent: () => void;
}

const ExploreOptions = ({ onOpenAgent }: ExploreOptionsProps) => {
  const navigate = useNavigate();

  const options = [
    {
      icon: Plane,
      title: "Flights",
      description: "AI-optimized routes & fares",
      badge: "Smart Bundles",
      image: cityImage,
      path: "/booking/flights",
    },
    {
      icon: Hotel,
      title: "Hotels",
      description: "Best rates guaranteed",
      badge: "Price Match",
      image: mountainImage,
      path: "/booking/hotels",
    },
    {
      icon: FileText,
      title: "Visas",
      description: "Fast-track processing",
      badge: "24hr Service",
      image: culturalImage,
      path: "/booking/visas",
    },
    {
      icon: MapPin,
      title: "Activities",
      description: "Curated experiences",
      badge: "Local Experts",
      image: beachImage,
      path: "/booking/activities",
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Explore & Book
          </h2>
          <p className="text-sm text-muted-foreground mt-1">AI-powered booking with smart recommendations</p>
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
              className="group relative h-72 rounded-2xl overflow-hidden border border-border hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-lg"
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
              <button
                onClick={() => navigate(option.path)}
                className="absolute inset-0 p-6 flex flex-col justify-end text-left w-full"
              >
                <option.icon className="w-8 h-8 text-primary mb-2" strokeWidth={1.5} />
                <h3 className="text-xl font-bold text-foreground mb-1">
                  {option.title}
                </h3>
                <p className="text-sm text-muted-foreground">{option.description}</p>
              </button>
            </div>
            
            {/* Search Bar Under Each Tile */}
            <TileSearch 
              category={option.title.toLowerCase()} 
              placeholder={`Search ${option.title.toLowerCase()}...`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreOptions;
