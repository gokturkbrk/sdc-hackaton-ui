import { useState } from 'react';
import { PhoneWrapper } from './components/PhoneWrapper';
import { AnimatePresence, motion } from 'framer-motion';
import { QUESTIONS_CONFIG, QuestionStep, type FormData } from './components/QuestionFlow';
import { ResponseView } from './components/ResponseView';
import { FlightInputView } from './components/FlightInputView';
import { LandingView, type FlightStatus } from './components/LandingView';
import { Loader2 } from 'lucide-react';
import { APILoader } from '@googlemaps/extended-component-library/react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { checkFlightStatus, generateItinerary } from './services/api';
import type { FlightStatusResponse, ItineraryResponse, WeatherInfo } from './services/mock-data';

// Grab key from env or use placeholder
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';

export default function App() {
  const [currentStepIndex, setCurrentStepIndex] = useState(-2); // -2: Flight Input, -1: Landing
  
  // Mock API state
  const [flightStatusResponse, setFlightStatusResponse] = useState<FlightStatusResponse | null>(null);
  const [flightStatus, setFlightStatus] = useState<{ status: FlightStatus; city: string; delayTime?: string; weatherInfo?: WeatherInfo } | null>(null);
  const [itineraryData, setItineraryData] = useState<ItineraryResponse | null>(null);

  const [formData, setFormData] = useState<FormData>({
    groupSize: '',
    activities: '',
    foodConstraints: '',
    accessibility: '',
    budget: '',
  });

  const handleCheckFlight = async () => {
    const result = await checkFlightStatus({
      flightNumber: 'LH404',
      date: '2026-03-01',
      connectionDepartureUtc: '2026-03-01T19:00:00Z',
      weatherInfo: { degree: 8, status: 'cloudy' },
    });
    setFlightStatusResponse(result);
    setFlightStatus({
      status: result.status,
      city: result.city,
      delayTime: result.delayTime,
      weatherInfo: result.weather_info,
    });
    setCurrentStepIndex(-1); // Move to landing view
  };

  const handleEditItinerary = async (userPrompt: string) => {
    if (!itineraryData || !flightStatusResponse) return;
    const updatedItinerary = await generateItinerary({
      flightStatus: flightStatusResponse,
      formData: formData as unknown as Record<string, string>,
      previousItinerary: itineraryData,
      userPrompt,
    });
    setItineraryData(updatedItinerary);
  };

  const startQuestionFlow = () => {
    setCurrentStepIndex(0);
  };

  const goNext = () => {
    if (currentStepIndex < QUESTIONS_CONFIG.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Move to loading/response
      setCurrentStepIndex(QUESTIONS_CONFIG.length);
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderContent = () => {
    if (currentStepIndex === -2) {
      return <FlightInputView onCheckFlight={handleCheckFlight} />;
    }

    if (currentStepIndex === -1 && flightStatus) {
      return (
        <LandingView
          status={flightStatus.status}
          city={flightStatus.city}
          delayTime={flightStatus.delayTime}
          weatherInfo={flightStatus.weatherInfo}
          onPlan={startQuestionFlow}
        />
      );
    }

    if (currentStepIndex >= 0 && currentStepIndex < QUESTIONS_CONFIG.length) {
      const q = QUESTIONS_CONFIG[currentStepIndex];
      return (
        <QuestionStep
          key={q.id}
          title={q.title}
          subtitle={q.subtitle}
          options={q.options}
          multiple={q.multiple}
          value={formData[q.field as keyof FormData]}
          onChange={(val) => handleFieldChange(q.field as keyof FormData, val)}
          onNext={goNext}
          isLast={currentStepIndex === QUESTIONS_CONFIG.length - 1}
        />
      );
    }

    if (currentStepIndex === QUESTIONS_CONFIG.length) {
      // Loading State — call the itinerary API
      if (!itineraryData && flightStatusResponse) {
        generateItinerary({
          flightStatus: flightStatusResponse,
          formData: formData as unknown as Record<string, string>,
        }).then((result) => {
          setItineraryData(result);
          setCurrentStepIndex(QUESTIONS_CONFIG.length + 1);
        });
      }

      return (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col items-center justify-center p-6 bg-stone-900 text-stone-100"
        >
          <Loader2 className="animate-spin mb-4" size={48} />
          <h2 className="font-serif text-2xl font-bold mb-2 text-center">Crafting your itinerary</h2>
          <p className="text-stone-400 text-center text-sm">Our AI is fetching the best places for your style...</p>
        </motion.div>
      );
    }

    if (currentStepIndex > QUESTIONS_CONFIG.length && itineraryData) {
      // Response State
      return (
        <motion.div
          key="response"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full w-full flex flex-col"
        >
          <ResponseView itinerary={itineraryData} onEditItinerary={handleEditItinerary} />
        </motion.div>
      );
    }
  };

  return (
    <div className="min-h-[100dvh] bg-stone-200/50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mb-4 text-center max-w-sm w-full h-[14px]">
        {currentStepIndex >= 0 && currentStepIndex < QUESTIONS_CONFIG.length && (
          <div className="flex gap-1 items-center justify-center">
            {QUESTIONS_CONFIG.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all flex-1 ${i <= currentStepIndex ? 'bg-stone-900' : 'bg-stone-300'}`} />
            ))}
          </div>
        )}
      </div>
      <div className="relative shrink-0" style={{ height: 'min(852px, 90dvh)', aspectRatio: '393/852' }}>
        <APILoader apiKey={GOOGLE_MAPS_API_KEY} solutionChannel="GMP_devsite_samples_v3_rgmautocomplete" />
        <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
          <PhoneWrapper>
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </PhoneWrapper>
        </APIProvider>
      </div>
    </div>
  );
}
