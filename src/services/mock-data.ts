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
  /** ISO 8601 UTC datetime string */
  start_utc: string;
  /** ISO 8601 UTC datetime string */
  end_utc: string;
  activity_name: string;
  venue_name: string;
  category: string;
  /** Cost as a string, e.g. "5-10 EUR", "0 EUR" */
  estimated_cost: string;
  /** Google Place ID or CID, or null */
  place_id: string | null;
  latitude: number;
  longitude: number;
  google_maps_url: string;
  description: string;
  /** Description of how to get to the next activity, or null */
  transport_to_next: string | null;
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

/** Mock edited itinerary — simulates AI inserting an extra food stop */
export const MOCK_EDITED_ITINERARY: ItineraryResponse = {
  ...MOCK_ITINERARY,
  itinerary: [
    // Keep first item (transport)
    MOCK_ITINERARY.itinerary[0],
    // Inserted coffee stop
    {
      start_utc: '2026-02-28T18:49:00Z',
      end_utc: '2026-02-28T19:19:00Z',
      activity_name: 'Coffee Break',
      venue_name: 'Café de la Luz',
      category: 'food',
      estimated_cost: '5-8 EUR',
      place_id: null,
      latitude: 40.4175,
      longitude: -3.7010,
      google_maps_url: 'https://maps.google.com/?q=Café+de+la+Luz+Madrid',
      description: 'Charming café near Lavapiés, perfect for a quick coffee and pastry.',
      transport_to_next: 'Walk (approx. 5 min)',
    },
    // Rest of original items with shifted times (+30 min)
    ...MOCK_ITINERARY.itinerary.slice(1).map((item) => ({
      ...item,
      start_utc: shiftTime(item.start_utc, 30),
      end_utc: shiftTime(item.end_utc, 30),
    })),
  ],
};

/** Helper: shift a UTC time string by N minutes */
function shiftTime(utcString: string, minutes: number): string {
  const d = new Date(utcString);
  d.setMinutes(d.getMinutes() + minutes);
  return d.toISOString();
}
