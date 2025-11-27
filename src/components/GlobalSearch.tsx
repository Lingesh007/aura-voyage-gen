import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Globe, MapPin, Plane, Clock, Bookmark } from "lucide-react";
import { SearchService, SearchResult } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";

export const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

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
    if (result.type === 'history' && result.id) {
      setQuery(result.title);
      handleSearch(result.title);
      return;
    }
    
    if (result.url) {
      navigate(result.url);
    }
    setIsOpen(false);
    setQuery("");
  };

  const handleSaveSearch = async (e: React.MouseEvent, result: SearchResult) => {
    e.stopPropagation();
    if (result.id) {
      await SearchService.toggleSaveSearch(result.id, true);
      toast({
        title: "Search Saved",
        description: "You can access this search from your saved searches",
      });
    }
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-primary mt-1 flex-shrink-0" />;
      case 'history':
        return <Clock className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />;
      case 'web':
        return <Globe className="w-4 h-4 text-primary mt-1 flex-shrink-0" />;
      default:
        return <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />;
    }
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search flights, hotels, destinations..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
        />
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto z-50 shadow-xl border-border/50">
          <div className="p-2">
            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => handleResultClick(result)}
                className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors flex items-start gap-3 group"
              >
                {getResultIcon(result.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-sm">{result.title}</div>
                    {result.price && (
                      <Badge variant="secondary" className="text-xs">
                        {result.price}
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{result.description}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary capitalize">{result.type}</span>
                    {result.category && (
                      <>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground capitalize">{result.category}</span>
                      </>
                    )}
                  </div>
                </div>
                {result.type === 'history' && (
                  <button
                    onClick={(e) => handleSaveSearch(e, result)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Bookmark className="w-4 h-4 text-muted-foreground hover:text-primary" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
