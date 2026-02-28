import {
  getMockFlightStatus,
  MOCK_CITY_IMAGES,
  MOCK_ITINERARY,
  MOCK_EDITED_ITINERARY,
  type FlightStatusResponse,
  type CityImageResponse,
  type ItineraryResponse,
} from './mock-data';

// ─── Configuration ──────────────────────────────────────────────

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// ─── Helpers ────────────────────────────────────────────────────

/** Simulate network latency for mock responses */
const simulateDelay = (ms = 800) => new Promise((r) => setTimeout(r, ms));

/**
 * Try a real API call first. If it fails for any reason (network error,
 * non-2xx status, missing base URL, etc.), fall back to mock data.
 */
async function tryOrFallback<T>(
  apiFn: () => Promise<T>,
  mockFn: () => T | Promise<T>,
  label: string
): Promise<T> {
  if (!API_BASE_URL) {
    // No API URL configured — go straight to mock
    console.info(`[${label}] No API_BASE_URL configured, using mock data`);
    await simulateDelay();
    return mockFn();
  }

  try {
    const result = await apiFn();
    return result;
  } catch (error) {
    console.warn(`[${label}] API call failed, falling back to mock data:`, error);
    await simulateDelay();
    return mockFn();
  }
}

// ─── API Functions ──────────────────────────────────────────────

/**
 * POST /api/check-flight
 * Checks the status of a flight and returns the city, delay info, etc.
 * Falls back to mock data on failure.
 */
export async function checkFlightStatus(opts: {
  flightNumber: string;
  date: string;
  connectionDepartureUtc: string;
  weatherInfo: { degree: number; status: string };
}): Promise<FlightStatusResponse> {
  return tryOrFallback(
    async () => {
      const res = await fetch(`${API_BASE_URL}/check-flight`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_number: opts.flightNumber,
          date: opts.date,
          connection_departure_utc: opts.connectionDepartureUtc,
          weather_info: opts.weatherInfo,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    () => getMockFlightStatus(),
    'check-flight'
  );
}

/**
 * GET /api/get-city-image?city={city}
 * Returns {{ url: string }} with a photo URL for the given city.
 * Falls back to mock data on failure.
 */
export async function getCityImage(city: string): Promise<CityImageResponse> {
  return tryOrFallback(
    async () => {
      const res = await fetch(
        `${API_BASE_URL}/get-city-image?city=${encodeURIComponent(city)}`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    () => ({ url: MOCK_CITY_IMAGES[city] || MOCK_CITY_IMAGES['default'] }),
    'get-city-image'
  );
}

/**
 * POST /api/generate-itinerary
 *
 * Unified endpoint for both creating and editing itineraries.
 * Falls back to mock data on failure.
 *
 * Always requires:
 *  - flightStatus: the check-flight response
 *  - formData: user question flow answers
 *
 * For editing, additionally include:
 *  - previousItinerary: the current itinerary to modify
 *  - userPrompt: the user's edit instruction
 */
export async function generateItinerary(opts: {
  flightStatus: FlightStatusResponse;
  formData: Record<string, string>;
  previousItinerary?: ItineraryResponse;
  userPrompt?: string;
}): Promise<ItineraryResponse> {
  const isEdit = !!opts.previousItinerary && !!opts.userPrompt;

  return tryOrFallback(
    async () => {
      const res = await fetch(`${API_BASE_URL}/generate-itinerary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flight_status: opts.flightStatus,
          form_data: opts.formData,
          ...(isEdit && {
            previous_itinerary: opts.previousItinerary,
            user_prompt: opts.userPrompt,
          }),
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
    () => (isEdit ? MOCK_EDITED_ITINERARY : MOCK_ITINERARY),
    isEdit ? 'edit-itinerary' : 'generate-itinerary'
  );
}
