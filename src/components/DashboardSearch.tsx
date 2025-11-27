import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Plane, Clock, Globe, MapPin } from "lucide-react";
import { SearchService, SearchResult } from "@/services/SearchService";

export const DashboardSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const searchResults = await SearchService.search(value);
    setResults(searchResults);
    setIsOpen(searchResults.length > 0);
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'history') {
      setQuery(result.title);
      handleSearch(result.title);
      return;
    }
    setIsOpen(false);
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />;
      case 'history':
        return <Clock className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />;
      case 'web':
        return <Globe className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />;
      default:
        return <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search bookings, destinations, services..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-11 h-12 text-base bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-80 overflow-y-auto z-50 shadow-2xl border-border/50">
          <div className="p-2">
            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(result)}
                className="p-4 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <div className="flex items-start gap-3">
                  {getResultIcon(result.type)}
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm">{result.title}</div>
                      {result.price && (
                        <Badge variant="secondary" className="text-xs">
                          {result.price}
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">{result.description}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {result.type}
                      </span>
                      {result.category && (
                        <span className="text-xs text-muted-foreground capitalize">{result.category}</span>
                      )}
                      {result.duration && (
                        <span className="text-xs text-muted-foreground">{result.duration}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
