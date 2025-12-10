const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AmadeusAuthResponse {
  access_token: string;
  expires_in: number;
}

interface HotelSearchParams {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  adults?: number;
  rooms?: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('AMADEUS_API_KEY');
    const apiSecret = Deno.env.get('AMADEUS_API_SECRET');

    if (!apiKey || !apiSecret) {
      console.error('Missing Amadeus API credentials');
      return new Response(
        JSON.stringify({ error: 'API credentials not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { cityCode, checkInDate, checkOutDate, adults = 1, rooms = 1 }: HotelSearchParams = await req.json();

    console.log('Hotel search request:', { cityCode, checkInDate, checkOutDate, adults, rooms });

    if (!cityCode || !checkInDate || !checkOutDate) {
      return new Response(
        JSON.stringify({ error: 'cityCode, checkInDate, and checkOutDate are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Amadeus access token
    const authResponse = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: apiKey,
        client_secret: apiSecret,
      }),
    });

    if (!authResponse.ok) {
      console.error('Amadeus auth failed:', await authResponse.text());
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authData: AmadeusAuthResponse = await authResponse.json();
    console.log('Amadeus auth successful');

    // Step 1: Get hotel list by city
    const hotelListParams = new URLSearchParams({
      cityCode: cityCode.toUpperCase(),
      radius: '30',
      radiusUnit: 'KM',
      hotelSource: 'ALL',
    });

    console.log('Fetching hotel list...');
    const hotelListResponse = await fetch(
      `https://test.api.amadeus.com/v1/reference-data/locations/hotels/by-city?${hotelListParams}`,
      {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      }
    );

    if (!hotelListResponse.ok) {
      const errorText = await hotelListResponse.text();
      console.error('Hotel list failed:', errorText);
      // Return empty results instead of error for "not found" cases
      return new Response(
        JSON.stringify({ data: [], message: 'No hotels found for this city code. Please use a valid IATA city code (e.g., PAR, LON, NYC, DXB).' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const hotelListData = await hotelListResponse.json();
    const hotels = hotelListData.data?.slice(0, 20) || [];
    console.log(`Found ${hotels.length} hotels in ${cityCode}`);

    if (hotels.length === 0) {
      return new Response(
        JSON.stringify({ data: [], message: 'No hotels found in this city' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: Get hotel offers for the found hotels
    const hotelIds = hotels.map((h: any) => h.hotelId).slice(0, 10).join(',');
    
    const offerParams = new URLSearchParams({
      hotelIds: hotelIds,
      checkInDate: checkInDate,
      checkOutDate: checkOutDate,
      adults: adults.toString(),
      roomQuantity: rooms.toString(),
      currency: 'USD',
      bestRateOnly: 'true',
    });

    console.log('Fetching hotel offers...');
    const offersResponse = await fetch(
      `https://test.api.amadeus.com/v3/shopping/hotel-offers?${offerParams}`,
      {
        headers: {
          Authorization: `Bearer ${authData.access_token}`,
        },
      }
    );

    if (!offersResponse.ok) {
      const errorText = await offersResponse.text();
      console.error('Hotel offers failed:', errorText);
      
      // Return hotels without pricing if offers fail
      const hotelsWithoutPricing = hotels.slice(0, 10).map((hotel: any) => ({
        hotelId: hotel.hotelId,
        name: hotel.name,
        cityCode: hotel.address?.cityCode || cityCode,
        location: hotel.address?.countryCode || '',
        latitude: hotel.geoCode?.latitude,
        longitude: hotel.geoCode?.longitude,
        distance: hotel.distance?.value,
        distanceUnit: hotel.distance?.unit,
        available: false,
        price: null,
      }));
      
      return new Response(
        JSON.stringify({ data: hotelsWithoutPricing, message: 'Hotels found but pricing unavailable' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const offersData = await offersResponse.json();
    console.log(`Got ${offersData.data?.length || 0} hotel offers`);

    // Combine hotel info with offers
    const hotelOffers = (offersData.data || []).map((offer: any) => {
      const hotelInfo = hotels.find((h: any) => h.hotelId === offer.hotel?.hotelId);
      const firstOffer = offer.offers?.[0];
      
      return {
        hotelId: offer.hotel?.hotelId,
        name: offer.hotel?.name || hotelInfo?.name || 'Hotel',
        cityCode: offer.hotel?.cityCode || cityCode,
        location: hotelInfo?.address?.countryCode || '',
        latitude: offer.hotel?.latitude || hotelInfo?.geoCode?.latitude,
        longitude: offer.hotel?.longitude || hotelInfo?.geoCode?.longitude,
        available: true,
        price: {
          total: firstOffer?.price?.total,
          currency: firstOffer?.price?.currency || 'USD',
          base: firstOffer?.price?.base,
        },
        room: {
          type: firstOffer?.room?.type,
          typeEstimated: firstOffer?.room?.typeEstimated,
          description: firstOffer?.room?.description?.text,
        },
        checkInDate: firstOffer?.checkInDate || checkInDate,
        checkOutDate: firstOffer?.checkOutDate || checkOutDate,
        guests: {
          adults: firstOffer?.guests?.adults || adults,
        },
        boardType: firstOffer?.boardType,
        rateCode: firstOffer?.rateCode,
      };
    });

    console.log(`Returning ${hotelOffers.length} hotel offers`);

    return new Response(
      JSON.stringify({ data: hotelOffers }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in hotel-search function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
