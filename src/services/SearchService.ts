import { supabase } from "@/integrations/supabase/client";

export interface SearchResult {
  title: string;
  description: string;
  url?: string;
  type: 'internal' | 'web' | 'flight' | 'history';
  category?: string;
  price?: string;
  airline?: string;
  duration?: string;
  id?: string;
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  category: string | null;
  is_saved: boolean;
  search_count: number;
  created_at: string;
}

export class SearchService {
  // Common city names to IATA airport codes mapping
  private static cityToIATA: Record<string, string> = {
    'chennai': 'MAA',
    'tokyo': 'NRT',
    'paris': 'CDG',
    'london': 'LHR',
    'dubai': 'DXB',
    'singapore': 'SIN',
    'mumbai': 'BOM',
    'delhi': 'DEL',
    'bangalore': 'BLR',
    'hyderabad': 'HYD',
    'kolkata': 'CCU',
    'new york': 'JFK',
    'newyork': 'JFK',
    'los angeles': 'LAX',
    'losangeles': 'LAX',
    'san francisco': 'SFO',
    'sanfrancisco': 'SFO',
    'chicago': 'ORD',
    'miami': 'MIA',
    'hong kong': 'HKG',
    'hongkong': 'HKG',
    'bangkok': 'BKK',
    'kuala lumpur': 'KUL',
    'sydney': 'SYD',
    'melbourne': 'MEL',
    'amsterdam': 'AMS',
    'frankfurt': 'FRA',
    'berlin': 'BER',
    'rome': 'FCO',
    'milan': 'MXP',
    'madrid': 'MAD',
    'barcelona': 'BCN',
    'toronto': 'YYZ',
    'vancouver': 'YVR',
    'seoul': 'ICN',
    'beijing': 'PEK',
    'shanghai': 'PVG',
    'doha': 'DOH',
    'abu dhabi': 'AUH',
    'abudhabi': 'AUH',
    'cairo': 'CAI',
    'istanbul': 'IST',
    'maldives': 'MLE',
    'bali': 'DPS',
    'phuket': 'HKT',
    'goa': 'GOI',
    'cochin': 'COK',
    'kochi': 'COK',
  };

  private static getIATACode(cityOrCode: string): string | null {
    const normalized = cityOrCode.toLowerCase().trim();
    // Check if it's already a valid 3-letter code
    if (/^[A-Z]{3}$/i.test(cityOrCode)) {
      return cityOrCode.toUpperCase();
    }
    // Look up in our mapping
    return this.cityToIATA[normalized] || null;
  }

  private static internalContent = [
    { title: 'Book Flights', description: 'Search and book flights to destinations worldwide', url: '/booking/flights', category: 'booking' },
    { title: 'Book Hotels', description: 'Find and reserve hotels at your destination', url: '/booking/hotels', category: 'booking' },
    { title: 'Visa Services', description: 'Apply for visas and track applications', url: '/booking/visas', category: 'services' },
    { title: 'Activities & Tours', description: 'Explore activities and book tours', url: '/booking/activities', category: 'booking' },
    { title: 'Budget Tracker', description: 'Track your travel expenses and budgets', url: '/budget-tracker', category: 'tools' },
    { title: 'Profile Settings', description: 'Manage your account and preferences', url: '/profile', category: 'account' },
    { title: 'Corporate Dashboard', description: 'View company travel metrics and bookings', url: '/dashboard', category: 'dashboard' },
    { title: 'Tokyo, Japan', description: 'Explore the vibrant capital of Japan', category: 'destination' },
    { title: 'Paris, France', description: 'The city of lights and romance', category: 'destination' },
    { title: 'Dubai, UAE', description: 'Modern luxury in the desert', category: 'destination' },
    { title: 'London, UK', description: 'Historic charm meets modern culture', category: 'destination' },
    { title: 'Maldives', description: 'Paradise islands with crystal waters', category: 'destination' },
    { title: 'Singapore', description: 'The Lion City of Asia', category: 'destination' },
  ];

  static async saveSearchHistory(query: string, category?: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Check if search already exists
      const { data: existing } = await supabase
        .from('search_history')
        .select('*')
        .eq('query', query)
        .eq('user_id', user?.id || null)
        .maybeSingle();

      if (existing) {
        // Update search count
        await supabase
          .from('search_history')
          .update({ search_count: existing.search_count + 1, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Insert new search
        await supabase
          .from('search_history')
          .insert({ query, category, user_id: user?.id || null });
      }
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  }

  static async getSearchHistory(limit = 10): Promise<SearchHistoryItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user?.id || null)
        .order('updated_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching search history:', error);
      return [];
    }
  }

  static async getSavedSearches(): Promise<SearchHistoryItem[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', user?.id || null)
        .eq('is_saved', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching saved searches:', error);
      return [];
    }
  }

  static async toggleSaveSearch(id: string, isSaved: boolean) {
    try {
      await supabase
        .from('search_history')
        .update({ is_saved: isSaved })
        .eq('id', id);
    } catch (error) {
      console.error('Error toggling save search:', error);
    }
  }

  static async searchFlights(query: string): Promise<SearchResult[]> {
    // Extract flight search parameters from query - support multi-word city names
    const flightPattern = /flight.*from\s+([\w\s]+?)\s+to\s+([\w\s]+?)(?:\s+on|\s+for|\s*$)/i;
    const match = query.match(flightPattern);
    
    if (!match) return [];

    const originCity = match[1].trim();
    const destCity = match[2].trim();
    
    const originCode = this.getIATACode(originCity);
    const destCode = this.getIATACode(destCity);
    
    if (!originCode || !destCode) {
      console.log(`Could not find IATA codes for: ${originCity} (${originCode}) -> ${destCity} (${destCode})`);
      return [];
    }

    try {
      const { data, error } = await supabase.functions.invoke('flight-search', {
        body: {
          origin: originCode,
          destination: destCode,
          departureDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          adults: 1,
        },
      });

      if (error) {
        console.error('Flight search error:', error);
        return [];
      }

      return (data?.data || []).slice(0, 5).map((offer: any, index: number) => ({
        title: `${offer.itineraries[0].segments[0].departure.iataCode} → ${offer.itineraries[0].segments[offer.itineraries[0].segments.length - 1].arrival.iataCode}`,
        description: `${offer.itineraries[0].segments.length} stop${offer.itineraries[0].segments.length > 1 ? 's' : ''} • ${offer.validatingAirlineCodes[0]}`,
        type: 'flight' as const,
        category: 'flights',
        price: `$${offer.price.total}`,
        airline: offer.validatingAirlineCodes[0],
        duration: offer.itineraries[0].duration,
        id: `flight-${index}`,
      }));
    } catch (error) {
      console.error('Error searching flights:', error);
      return [];
    }
  }

  static async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    
    await this.saveSearchHistory(query);
    
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

    // Get search history
    const history = await this.getSearchHistory(5);
    const historyResults = history
      .filter(h => h.query.toLowerCase().includes(lowerQuery) && h.query !== query)
      .map(h => ({
        title: h.query,
        description: `Searched ${h.search_count} time${h.search_count > 1 ? 's' : ''}`,
        type: 'history' as const,
        category: h.category || 'recent',
        id: h.id,
      }));

    // Search for flights if query matches pattern
    const flightResults = await this.searchFlights(query);
    results.push(...flightResults);

    // Search internal content
    const internalResults = this.internalContent
      .filter(item => 
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery) ||
        item.category?.toLowerCase().includes(lowerQuery)
      )
      .map(item => ({
        ...item,
        type: 'internal' as const
      }));

    results.push(...internalResults);

    // Add history results
    results.push(...historyResults);

    // Simulate web search results
    if (lowerQuery.includes('flight') || lowerQuery.includes('ticket')) {
      results.push({
        title: 'Best Flight Deals 2025',
        description: 'Compare prices across airlines and find the best deals',
        type: 'web',
        category: 'flights'
      });
    }
    
    if (lowerQuery.includes('hotel') || lowerQuery.includes('accommodation')) {
      results.push({
        title: 'Top Rated Hotels Worldwide',
        description: 'Discover highly rated hotels with exclusive discounts',
        type: 'web',
        category: 'hotels'
      });
    }

    if (lowerQuery.includes('visa')) {
      results.push({
        title: 'Visa Requirements Guide',
        description: 'Complete guide to visa requirements for all countries',
        type: 'web',
        category: 'visas'
      });
    }

    // Add destination-specific web results
    const destinations = ['paris', 'tokyo', 'dubai', 'london', 'maldives', 'singapore', 'bali', 'new york'];
    destinations.forEach(dest => {
      if (lowerQuery.includes(dest)) {
        results.push({
          title: `Travel Guide to ${dest.charAt(0).toUpperCase() + dest.slice(1)}`,
          description: `Explore attractions, hotels, and activities in ${dest}`,
          type: 'web',
          category: 'destination'
        });
      }
    });

    return results.slice(0, 10);
  }
}
