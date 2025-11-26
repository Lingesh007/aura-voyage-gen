export interface SearchResult {
  title: string;
  description: string;
  url?: string;
  type: 'internal' | 'web';
  category?: string;
}

export class SearchService {
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

  static async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    const results: SearchResult[] = [];

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

    // Simulate web search results (in production, this would call a real search API)
    if (lowerQuery.includes('flight') || lowerQuery.includes('ticket')) {
      results.push({
        title: 'Best Flight Deals 2024',
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

    return results.slice(0, 8); // Limit to 8 results
  }
}
