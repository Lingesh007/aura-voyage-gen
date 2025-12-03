import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bot, Mic, ArrowRight, Sparkles } from "lucide-react";

interface AISearchBarProps {
  onOpenAgent: () => void;
  placeholder?: string;
}

const AISearchBar = ({ onOpenAgent, placeholder }: AISearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenAgent();
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
            placeholder={placeholder || "Ask Travax AI... 'Plan me a business trip to London under $3,000'"}
            className="w-full pl-12 pr-24 py-6 text-base rounded-full border-2 border-border focus:border-primary bg-background/80 backdrop-blur"
          />
          <div className="absolute right-2 flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="rounded-full text-muted-foreground hover:text-primary"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              type="submit"
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90"
            >
              <ArrowRight className="w-5 h-5" />
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
            onClick={onOpenAgent}
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
