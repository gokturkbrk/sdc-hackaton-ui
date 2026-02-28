import itineraryMockData from '../../itianery-api-result.json';

// ─── Types ──────────────────────────────────────────────────────

export type WeatherInfo = {
  degree: number;
  status: 'sunny' | 'cloudy' | 'rainy' | 'snowy' | 'partly_cloudy';
};

export type FlightStatusResponse = {
  status: 'delayed' | 'layover';
  city: string;
  delayTime?: string;
  safe_window_minutes?: number;
  weather_info?: WeatherInfo;
};

export type CityImageResponse = {
  url: string;
};

export type ItineraryItem = {
  /** Minutes offset from the start of the itinerary window */
  start_utc: number;
  /** Minutes offset from the start of the itinerary window */
  end_utc: number;
  activity_name: string;
  venue_name: string;
  category: string;
  /** Cost in euros as a number (0 = free) */
  estimated_cost: number;
  /** Google Place ID (e.g. "ChIJ...") or null */
  place_id: string | null;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  description: string;
};

export type ItineraryResponse = {
  stay_at_airport: boolean;
  safe_window_minutes: number;
  itinerary: ItineraryItem[];
};

// ─── Mock Payloads ──────────────────────────────────────────────

export const getMockFlightStatus = (): FlightStatusResponse => {
  const isDelayed = Math.random() > 0.5;
  return isDelayed
    ? {
        status: 'delayed',
        city: 'Berlin',
        delayTime: '2 hours',
        safe_window_minutes: 180,
        weather_info: { degree: 8, status: 'cloudy' },
      }
    : {
        status: 'layover',
        city: 'Madrid',
        delayTime: undefined,
        safe_window_minutes: 325,
        weather_info: { degree: 22, status: 'sunny' },
      };
};

export const MOCK_CITY_IMAGES: Record<string, string> = {
  default:
    'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1000&auto=format&fit=crop',
  Madrid:
    'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop',
  Berlin:
    'https://images.unsplash.com/photo-1560969184-10fe8719e047?q=80&w=1000&auto=format&fit=crop',
  Munich:
    'https://images.unsplash.com/photo-1595867818082-083862f3d630?q=80&w=1000&auto=format&fit=crop',
  London:
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=1000&auto=format&fit=crop',
};

export const MOCK_ITINERARY: ItineraryResponse = itineraryMockData as ItineraryResponse;

/** Mock edited itinerary — simulates AI inserting an extra sightseeing stop */
export const MOCK_EDITED_ITINERARY: ItineraryResponse = {
  ...MOCK_ITINERARY,
  itinerary: [
    // Keep first item (transport to city center)
    MOCK_ITINERARY.itinerary[0],
    // Keep coffee break
    MOCK_ITINERARY.itinerary[1],
    // Inserted extra sightseeing stop
    {
      start_utc: 75,
      end_utc: 105,
      activity_name: 'Visit Mercado de San Miguel',
      venue_name: 'Mercado de San Miguel',
      category: 'food_drink',
      estimated_cost: 15,
      place_id: 'ChIJKUhBP0omQg0RcHHhggF3yno',
      latitude: 40.4154,
      longitude: -3.7083,
      google_maps_url: 'https://maps.google.com/?q=Mercado+de+San+Miguel+Madrid',
      description: 'Browse artisan food stalls and try local delicacies at this historic covered market near Plaza Mayor.',
    },
    // Rest of original items with adjusted minute offsets (+30 min)
    ...MOCK_ITINERARY.itinerary.slice(2).map((item) => ({
      ...item,
      start_utc: item.start_utc + 30,
      end_utc: item.end_utc + 30,
    })),
  ],
};
