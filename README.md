# LayLa — Smart Layover Planner

An AI-powered travel companion that turns flight delays and layovers into spontaneous city adventures. Built for the **SDP Hackathon**.

## What it does

1. **Check your flight** — enter your flight number and date
2. **Get matched** — the app detects delays or layovers and shows you the destination city with live weather
3. **Answer a few questions** — group size, interests, dietary needs, accessibility, budget
4. **Receive an AI-crafted itinerary** — a full timeline with map, places, costs, and directions
5. **Edit on the fly** — ask Gemini to adjust the plan in natural language

## Tech Stack

| Layer      | Technology                                                                                   |
| ---------- | -------------------------------------------------------------------------------------------- |
| Framework  | React 18 + TypeScript                                                                        |
| Build      | Vite                                                                                         |
| Styling    | Tailwind CSS v4                                                                              |
| Animations | Framer Motion                                                                                |
| Maps       | Google Maps Platform (`@vis.gl/react-google-maps`, `@googlemaps/extended-component-library`) |
| Icons      | Lucide React                                                                                 |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- A [Google Maps Platform API key](https://console.cloud.google.com/google/maps-apis) with Maps JavaScript API, Places API (New) enabled

### Install & Run

```bash
# Install dependencies
npm install

# Create your .env file
cp .env.example .env
# Then edit .env and add your keys

# Start dev server
npm run dev
```

### Environment Variables

| Variable                   | Required | Description                                        |
| -------------------------- | -------- | -------------------------------------------------- |
| `VITE_GOOGLE_MAPS_API_KEY` | Yes      | Google Maps JavaScript API key                     |
| `VITE_API_BASE_URL`        | No       | Backend API base URL. If empty, mock data is used. |

## API Endpoints

The app communicates with three backend endpoints. If the backend is unavailable or `VITE_API_BASE_URL` is not set, all calls gracefully fall back to local mock data.

| Method | Endpoint                          | Purpose                                 |
| ------ | --------------------------------- | --------------------------------------- |
| `POST` | `/api/check-flight`               | Check flight status (delayed / layover) |
| `GET`  | `/api/get-city-image?city={city}` | Fetch a hero image for the destination  |
| `POST` | `/api/generate-itinerary`         | Generate or edit an itinerary           |

See [`docs/mock-api-examples.md`](docs/mock-api-examples.md) for full request/response examples.

## Project Structure

```
src/
├── components/
│   ├── FlightInputView.tsx   # Flight number entry screen
│   ├── LandingView.tsx       # City hero + weather + CTA
│   ├── QuestionFlow.tsx      # Preference questionnaire
│   ├── ResponseView.tsx      # Itinerary timeline + interactive map
│   └── PhoneWrapper.tsx      # Mobile device frame
├── services/
│   ├── api.ts                # API client with fallback to mocks
│   └── mock-data.ts          # Type definitions + mock payloads
├── App.tsx                   # Root component & state management
└── index.css                 # Tailwind config + custom tokens
docs/
└── mock-api-examples.md      # API contract documentation
```

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.
