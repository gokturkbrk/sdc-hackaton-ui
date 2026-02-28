import { useState, useEffect } from 'react';
import { MapPin, Clock, Sun, Cloud, CloudRain, Snowflake, CloudSun } from 'lucide-react';
import { motion } from 'framer-motion';
import { getCityImage } from '../services/api';
import type { WeatherInfo } from '../services/mock-data';

const getWeatherIcon = (status: WeatherInfo['status']) => {
  switch (status) {
    case 'sunny': return <Sun size={16} />;
    case 'cloudy': return <Cloud size={16} />;
    case 'rainy': return <CloudRain size={16} />;
    case 'snowy': return <Snowflake size={16} />;
    case 'partly_cloudy': return <CloudSun size={16} />;
  }
};

export type FlightStatus = 'delayed' | 'layover';

type LandingViewProps = {
  status: FlightStatus;
  city: string;
  delayTime?: string;
  weatherInfo?: WeatherInfo;
  onPlan: () => void;
};

export function LandingView({ status, city, delayTime, weatherInfo, onPlan }: LandingViewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isImageLoading, setIsImageLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setIsImageLoading(true);

    getCityImage(city).then((result) => {
      if (isMounted) {
        setImageUrl(result.url);
        setIsImageLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [city]);

  return (
    <motion.div
      key="landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col relative"
    >
      {/* City Image Background Header */}
      <div className="relative h-[45%] w-full rounded-b-[2.5rem] overflow-hidden shrink-0 shadow-sm bg-stone-200">
        <div className="absolute inset-0 bg-stone-900/40 mix-blend-multiply z-10" />
        
        {isImageLoading ? (
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-stone-300/50 animate-pulse" />
        ) : (
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            src={imageUrl} 
            alt={city}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        <div className="absolute bottom-6 left-6 right-6 z-20 flex items-end justify-between text-white">
          <div className="flex items-center gap-2">
            <MapPin size={24} />
            <h2 className="font-serif text-3xl font-bold tracking-wide drop-shadow-md">{city}</h2>
          </div>

          {weatherInfo && (
            <div className="bg-white/20 backdrop-blur-md text-white text-sm font-semibold px-3 py-1.5 rounded-xl border border-white/20 shadow-sm flex items-center gap-1.5 mb-0.5">
              {getWeatherIcon(weatherInfo.status)} {weatherInfo.degree}°C
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 pt-8 flex flex-col justify-between overflow-hidden">
        <div className="overflow-y-auto no-scrollbar pb-2">
          {status === 'delayed' ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-rust-50 text-rust-600 px-3 py-1.5 rounded-full text-sm font-bold border border-rust-100">
                <Clock size={16} />
                Delayed {delayTime}
              </div>
              <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
                Sorry, looks like your flight from {city} is delayed.
              </h1>
              <p className="text-stone-500 text-lg pr-4">Let's fill that gap with something memorable.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-sage-100 text-sage-800 px-3 py-1.5 rounded-full text-sm font-bold border border-sage-200">
                <Clock size={16} />
                Layover Target
              </div>
              <h1 className="font-serif text-3xl font-bold text-stone-900 leading-tight">
                Looks like you have a layover at {city}.
              </h1>
              <p className="text-stone-500 text-lg pr-4">Let's plan something exciting.</p>
            </div>
          )}
        </div>

        <div className="pt-4 pb-2 shrink-0">
          <button
            onClick={onPlan}
            className="w-full py-4 px-8 bg-stone-900 text-white rounded-full font-medium text-lg hover:bg-stone-800 transition-all shadow-[0_8px_30px_rgba(28,25,23,0.2)] active:scale-[0.98]"
          >
            Plan Itinerary ✨
          </button>
        </div>
      </div>
    </motion.div>
  );
}
