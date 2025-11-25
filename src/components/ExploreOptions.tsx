import { useNavigate } from "react-router-dom";
import { Plane, Hotel, FileText, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      description: "Search and book international and domestic flights",
      image: cityImage,
      path: "/booking/flights",
    },
    {
      icon: Hotel,
      title: "Hotels",
      description: "Find luxury accommodations worldwide",
      image: mountainImage,
      path: "/booking/hotels",
    },
    {
      icon: FileText,
      title: "Visas",
      description: "Visa assistance and documentation services",
      image: culturalImage,
      path: "/booking/visas",
    },
    {
      icon: MapPin,
      title: "Activities",
      description: "Discover experiences and local activities",
      image: beachImage,
      path: "/booking/activities",
    },
  ];

  return (
    <div>
      <h2 className="font-luxury text-3xl font-bold text-foreground mb-8 text-center">
        Explore & Book
      </h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {options.map((option, index) => (
          <div
            key={index}
            className="group relative h-80 rounded-2xl overflow-hidden border-2 border-border hover:border-primary/40 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background Image */}
            <img 
              src={option.image} 
              alt={`${option.title} destination`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/60 to-transparent" />
            
            {/* AI Button */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAgent();
              }}
              size="sm"
              className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-lg"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              AI
            </Button>
            
            {/* Content */}
            <button
              onClick={() => navigate(option.path)}
              className="absolute inset-0 p-6 flex flex-col justify-end text-left w-full"
            >
              <option.icon className="w-10 h-10 text-primary mb-3 drop-shadow-lg" strokeWidth={1.5} />
              <h3 className="font-luxury text-2xl font-bold text-foreground mb-2 drop-shadow-md">
                {option.title}
              </h3>
              <p className="text-sm text-foreground/80 drop-shadow-sm">{option.description}</p>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreOptions;
