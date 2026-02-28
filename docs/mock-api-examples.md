# Mock API Reference

This project uses three mocked API endpoints from `src/services/api.ts`.

## 1. `POST /api/check-flight`

### Where it is used

- Called from `handleCheckFlight` in `src/App.tsx`
- Triggered after the user taps "Check my flight" in `src/components/FlightInputView.tsx`

### Current request shape

The UI currently calls:

```json
{
  "flight_number": "LH404",
  "date": "2026-03-01",
  "connection_departure_utc": "2026-03-01T19:00:00Z",
  "weather_info": { "degree": 8, "status": "cloudy" }
}
```

### Mock response examples

Delayed flight:

```json
{
  "status": "delayed",
  "city": "Berlin",
  "delayTime": "2 hours",
  "safe_window_minutes": 180,
  "weather_info": {
    "degree": 8,
    "status": "cloudy"
  }
}
```

Layover:

```json
{
  "status": "layover",
  "city": "Madrid",
  "safe_window_minutes": 325,
  "weather_info": {
    "degree": 22,
    "status": "sunny"
  }
}
```

### How the response is used

- `status`, `city`, `delayTime`, and `weather_info` are mapped into local app state
- The landing screen uses `city` and `weather_info`
- `status` decides whether the UI shows delayed-flight or layover copy

## 2. `GET /api/get-city-image?city={city}`

### Where it is used

- Called inside `src/components/LandingView.tsx`
- Runs when the landing screen loads or when `city` changes

### Current request example

```http
GET /api/get-city-image?city=Madrid
```

### Mock response example

```json
{
  "url": "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?q=80&w=1000&auto=format&fit=crop"
}
```

### Fallback response example

If the city is missing from `MOCK_CITY_IMAGES`, the app falls back to:

```json
{
  "url": "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1000&auto=format&fit=crop"
}
```

### How the response is used

- `url` is stored as `imageUrl`
- The landing hero image renders from that URL

## 3. `POST /api/generate-itinerary`

Unified endpoint for both **creating** and **editing** itineraries.

### Where it is used

- **Create mode:** Called from the loading state in `src/App.tsx` after the user completes the question flow
- **Edit mode:** Called from `handleEditItinerary` in `src/App.tsx` when the user types in the "Ask Gemini to edit timeline..." input and taps send or presses Enter

### Request shape

The endpoint always requires `flight_status` and `form_data`. For editing, additionally include `previous_itinerary` and `user_prompt`.

#### Create mode (initial generation)

```json
{
  "flight_status": {
    "status": "layover",
    "city": "Madrid",
    "safe_window_minutes": 325,
    "weather_info": { "degree": 22, "status": "sunny" }
  },
  "form_data": {
    "groupSize": "duo",
    "activities": "wander",
    "foodConstraints": "vegetarian",
    "accessibility": "wheelchair",
    "budget": "budget_low"
  }
}
```

#### Edit mode (modifying existing itinerary)

```json
{
  "flight_status": {
    "status": "layover",
    "city": "Madrid",
    "safe_window_minutes": 325,
    "weather_info": { "degree": 22, "status": "sunny" }
  },
  "form_data": {
    "groupSize": "duo",
    "activities": "wander",
    "foodConstraints": "vegetarian",
    "accessibility": "wheelchair",
    "budget": "budget_low"
  },
  "previous_itinerary": {
    "stay_at_airport": false,
    "safe_window_minutes": 325,
    "itinerary": []
  },
  "user_prompt": "Add a coffee stop near Puerta del Sol"
}
```

### Mock response example

Both modes return the same `ItineraryResponse` structure:

```json
{
  "stay_at_airport": false,
  "safe_window_minutes": 325,
  "itinerary": [
    {
      "start_utc": "2026-03-01T12:05:00Z",
      "end_utc": "2026-03-01T12:55:00Z",
      "activity_name": "Metro to City Center",
      "venue_name": "Madrid Barajas Airport (MAD) to Sol Metro Station",
      "category": "transport",
      "estimated_cost": "€10",
      "place_id": null,
      "latitude": 40.4936,
      "longitude": -3.5668,
      "google_maps_url": "https://maps.google.com/?q=Madrid+Barajas+Airport",
      "description": "Take the Metro Line 8 from Madrid Barajas Airport...",
      "transport_to_next": "Walk"
    },
    "... (more itinerary items)"
  ]
}
```

### How the response is used

- `data.itinerary` powers the timeline cards and map markers
- `latitude` and `longitude` are used for map markers
- `place_id` is used when available, otherwise the UI resolves it via Google Places API
- `google_maps_url` is used for outbound map links
- In edit mode, the full response replaces the current itinerary state

## Notes

- All API calls attempt the real endpoint first (using `VITE_API_BASE_URL`), and **fall back to mock data** if the request fails or no base URL is configured
- If `VITE_API_BASE_URL` is not set, mock data is used immediately without attempting a network call
- Console warnings indicate when a fallback occurs (e.g. `[check-flight] API call failed, falling back to mock data`)
- The mock itinerary (create) comes from `itianery-api-result.json`
- The mock edited itinerary comes from `MOCK_EDITED_ITINERARY` in `src/services/mock-data.ts`
- `check-flight` mock randomly returns one of two response variants (delayed / layover)
