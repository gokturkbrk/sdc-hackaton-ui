import { useState } from 'react';
import { Plane, Calendar, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type FlightInputViewProps = {
  onCheckFlight: () => void;
};

export function FlightInputView({ onCheckFlight }: FlightInputViewProps) {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheck = () => {
    setIsChecking(true);
    // Simulate network request
    setTimeout(() => {
      onCheckFlight();
    }, 1500);
  };

  return (
    <motion.div
      key="flight-input"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="p-6 pt-16 h-full flex flex-col justify-center"
    >
      <div className="mb-12">
        <div className="w-32 h-16 flex items-center justify-center mb-6 overflow-hidden p-2">
          <img src="/LayLa.svg" alt="LayLa Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="font-serif text-4xl font-bold text-stone-900 leading-tight mb-3">
          Find your<br/>next adventure.
        </h1>
        <p className="text-stone-500 text-lg">Let's check your upcoming flight details to craft the perfect plan.</p>
      </div>

      <div className="space-y-4 mb-12">
        <div className="relative">
          <label className="absolute -top-2.5 left-4 z-10 bg-[#fdfdfc] px-2 text-xs font-bold text-stone-400 uppercase tracking-wider">Flight Number</label>
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-900 cursor-not-allowed opacity-80">
            <Plane className="text-stone-400" size={20} />
            <span className="font-semibold text-lg tracking-wide">LH404</span>
          </div>
        </div>
        
        <div className="relative">
          <label className="absolute -top-2.5 left-4 z-10 bg-[#fdfdfc] px-2 text-xs font-bold text-stone-400 uppercase tracking-wider">Date & Time</label>
          <div className="flex items-center gap-3 w-full p-4 rounded-2xl border-2 border-stone-200 bg-stone-50 text-stone-900 cursor-not-allowed opacity-80">
            <Calendar className="text-stone-400" size={20} />
            <span className="font-semibold text-lg">Oct 24, 2026 - 14:30</span>
          </div>
        </div>
      </div>

      <div className="mt-auto pb-4">
        <button
          onClick={handleCheck}
          disabled={isChecking}
          className="w-full flex items-center justify-between py-4 px-8 bg-stone-900 text-white rounded-full font-medium text-lg hover:bg-stone-800 transition-all shadow-[0_8px_30px_rgba(28,25,23,0.2)] active:scale-[0.98] disabled:opacity-70 group"
        >
          <span>{isChecking ? 'Checking status...' : 'Check my flight'}</span>
          {!isChecking && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
        </button>
      </div>
    </motion.div>
  );
}
