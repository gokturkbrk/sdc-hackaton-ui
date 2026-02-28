# Itinerary Hackathon UI Walkthrough

I have complete the mobile-mimicking frontend web application for your Itinerary project! Here's a summary of what's been built:

## 📱 Core Layout & Framework

- Initialized a **React + TypeScript + Vite** application.
- Integrated **Tailwind CSS v4** for rapid, modern styling.
- Built a `PhoneWrapper` layout component to act as a realistic mobile device frame within the web page, featuring a notch, home indicator, curved edges, and a polished drop-shadow to focus the user on the "mobile" UI.

## ✈️ The Flight Onboarding Flow

Added two initial screens before the question routing to simulate checking flight statuses:

1. **Flight Input View**: An elegant entry page featuring two disabled-but-active-looking inputs for Flight Number (`LH404`) and Date. Users click "Check my flight" to simulate an API call.
2. **Landing View**: Once the mocked API returns (randomized 50/50 split), it displays one of two distinct states:
   - **Delayed Flight State**: Shows a beautiful, moody London image with a specific delay time callout.
   - **Layover State**: Shows a bright, architectural city image with a layover callout.
     Both states prompt the user to "Plan Itinerary ✨", which elegantly transitions them into the Question Flow!

## 📝 The Question Flow Pages

Designed an elegant, configuration-driven multi-step form powered by `framer-motion` for smooth page transitions.

1. **Group Size**: Select 1 Person, 2 People, or 3+ People represented with respective Lucide outline icons.
2. **Activity Types**: Multi-select options for Wander, Chill, Active with distinct visual feedback.
3. **Food Constraints**: Handled Vegetarian, Gluten-free, Halal, and Kosher selections.
4. **Accessibility needs**: Wheelchair accessible, Minimal walking, Avoid stairs.
5. **Budget per person**: 0€ (free), Under 50€, and No limit selections.

## 🗺️ The Response Pages

Once the form translates into the "loading" and then "response" state, it reveals a dual-view interface:

- **Timeline / Calendar View**: A vertical stepper showing day-by-day itineraries with start times, rich locations, and estimated fees. They are interactive and can be clicked to quickly expand and show more details via smooth framer-motion animations!
- **Map View with POI Sheet**:
  - Integrated the official `@vis.gl/react-google-maps` package to render a true interactive **Google Map** as the background layer with customized markers.
  - Added the `@googlemaps/extended-component-library` to drop in Google's official `<PlaceOverview>` components into the draggable bottom sheet for stunning point-of-interest details, complete with photos, reviews, and actual Place ID data.
- **"Ask More" Component**: A floating input element permanently stationed beneath the notch on the response views, allowing users to converse with the Gemini integration to tweak their plans interactively.

## 🎨 Aesthetics & Polish

Using guidelines from the `frontend-design` skill, the app avoids generic "AI slop" styles by utilizing:

- **Vibrant Typography**: `Fraunces` (serif) paired with `Plus Jakarta Sans` (sans-serif) for an editorial, organic feel.
- **Custom Color Palette**: Earthy, refined tones including stone grays and pops of rust/burnt-orange (`#c25e3a`).
- **Micro-interactions**: Subtle hover states, focus rings, scale effects on buttons, and spring-based animations on the bottom sheet map component.

```javascript
// Example code snippet showing how to use the Ask More component
// For further integration with the backend Gemini API
const handleAskGemini = async (inputQuery) => {
  // Post user's query and trigger a timeline refresh!
  console.log("Asking Gemini: ", inputQuery);
};
```
