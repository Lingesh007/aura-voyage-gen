import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Plane, 
  Wallet, 
  Building2, 
  Bot,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface QuickActionsProps {
  userType: 'corporate' | 'individual';
  onOpenAgent: () => void;
}

const QuickActions = ({ userType, onOpenAgent }: QuickActionsProps) => {
  const navigate = useNavigate();

  const actions = userType === 'corporate' 
    ? [
        { 
          icon: Bot, 
          title: "Plan Trip with AI", 
          description: "Natural-language planning",
          onClick: onOpenAgent,
          highlight: true
        },
        { 
          icon: Wallet, 
          title: "Optimize Budget", 
          description: "Save 15-40% with smart routing",
          onClick: () => navigate("/budget-tracker")
        },
        { 
          icon: Building2, 
          title: "Corporate Travel", 
          description: "Team approvals & analytics",
          onClick: () => navigate("/dashboard?tab=teams")
        },
        { 
          icon: Plane, 
          title: "Quick Booking", 
          description: "AI-optimized bundles",
          onClick: () => navigate("/booking/flights")
        },
      ]
    : [
        { 
          icon: Bot, 
          title: "Plan Trip with AI", 
          description: "Natural-language planning",
          onClick: onOpenAgent,
          highlight: true
        },
        { 
          icon: Wallet, 
          title: "Budget Planner", 
          description: "Save with smart routing",
          onClick: () => navigate("/budget-tracker")
        },
        { 
          icon: Plane, 
          title: "Book Flights", 
          description: "AI-optimized fares",
          onClick: () => navigate("/booking/flights")
        },
        { 
          icon: Sparkles, 
          title: "Smart Deals", 
          description: "Personalized offers",
          onClick: () => navigate("/booking/hotels")
        },
      ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((action, index) => (
        <Card 
          key={index}
          onClick={action.onClick}
          className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group ${
            action.highlight 
              ? 'bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30 hover:border-primary' 
              : 'hover:border-primary/30'
          }`}
        >
          <CardContent className="p-4 flex flex-col items-center text-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
              action.highlight 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-muted'
            }`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
            <p className="text-xs text-muted-foreground">{action.description}</p>
            <ArrowRight className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuickActions;
