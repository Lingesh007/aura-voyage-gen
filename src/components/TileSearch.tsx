import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { SearchService, SearchResult } from "@/services/SearchService";
import { useToast } from "@/hooks/use-toast";

interface TileSearchProps {
  category: string;
  placeholder?: string;
}

export const TileSearch = ({ category, placeholder }: TileSearchProps) => {
  const [query, setQuery] = useState("");
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length < 2) return;

    const results = await SearchService.search(`${category} ${query}`);
    
    toast({
      title: "Search Results",
      description: `Found ${results.length} results for "${query}" in ${category}`,
    });
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder || `Search ${category}...`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 bg-background/50 backdrop-blur-sm border-border/50"
      />
    </form>
  );
};
