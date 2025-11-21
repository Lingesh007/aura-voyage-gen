import { useNavigate } from "react-router-dom";
import { Plane, Hotel, FileText, MapPin } from "lucide-react";

const ExploreOptions = () => {
  const navigate = useNavigate();

  const options = [
    {
      icon: Plane,
      title: "Flights",
      description: "Search and book international and domestic flights",
      color: "from-blue-500/10 to-blue-500/5 border-blue-500/20 hover:border-blue-500/40",
      iconColor: "text-blue-400",
      path: "/booking/flights",
    },
    {
      icon: Hotel,
      title: "Hotels",
      description: "Find luxury accommodations worldwide",
      color: "from-purple-500/10 to-purple-500/5 border-purple-500/20 hover:border-purple-500/40",
      iconColor: "text-purple-400",
      path: "/booking/hotels",
    },
    {
      icon: FileText,
      title: "Visas",
      description: "Visa assistance and documentation services",
      color: "from-green-500/10 to-green-500/5 border-green-500/20 hover:border-green-500/40",
      iconColor: "text-green-400",
      path: "/booking/visas",
    },
    {
      icon: MapPin,
      title: "Activities",
      description: "Discover experiences and local activities",
      color: "from-orange-500/10 to-orange-500/5 border-orange-500/20 hover:border-orange-500/40",
      iconColor: "text-orange-400",
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
          <button
            key={index}
            onClick={() => navigate(option.path)}
            className={`group relative p-6 rounded-2xl bg-gradient-to-br ${option.color} border transition-all duration-300 hover:scale-105 text-left`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            <div className="relative">
              <option.icon className={`w-10 h-10 ${option.iconColor} mb-4`} strokeWidth={1.5} />
              <h3 className="font-luxury text-xl font-bold text-foreground mb-2">
                {option.title}
              </h3>
              <p className="text-sm text-muted-foreground">{option.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExploreOptions;
