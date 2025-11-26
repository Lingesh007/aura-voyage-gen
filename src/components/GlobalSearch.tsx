import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Globe, MapPin } from "lucide-react";
import { SearchService, SearchResult } from "@/services/SearchService";

export const GlobalSearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

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
    if (result.url) {
      navigate(result.url);
    }
    setIsOpen(false);
    setQuery("");
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
                className="p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors flex items-start gap-3"
              >
                {result.type === 'web' ? (
                  <Globe className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                ) : (
                  <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{result.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{result.description}</div>
                  <div className="text-xs text-primary mt-1 capitalize">{result.type} • {result.category}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
