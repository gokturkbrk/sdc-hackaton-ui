import { User, Users, UsersRound, Compass, Coffee, Mountain, Leaf, Utensils, ShieldCheck, Accessibility, Footprints, ArrowUpSquare, Banknote, Landmark, Wallet, Carrot, CircleDashed } from 'lucide-react';
import { motion } from 'framer-motion';

export type FormData = {
  groupSize: string;
  activities: string;
  foodConstraints: string;
  accessibility: string;
  budget: string;
};

type Option = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

type QuestionProps = {
  title: string;
  subtitle: string;
  options: Option[];
  value: string | string[];
  onChange: (val: string | string[]) => void;
  onNext: () => void;
  multiple?: boolean;
  isLast?: boolean;
};

export function QuestionStep({ title, subtitle, options, value, onChange, onNext, multiple, isLast }: QuestionProps) {
  const toggleOption = (optId: string) => {
    // If the selected option is a 'none' option, clear others and just select none
    if (multiple) {
      if (optId.includes('none')) {
        onChange([optId]);
        setTimeout(onNext, 400); // auto-advance on none
      } else {
        let arr = (value as string[]) || [];
        // Remove any 'none' options if a real option is selected
        arr = arr.filter(id => !id.includes('none'));
        
        if (arr.includes(optId)) {
          onChange(arr.filter(id => id !== optId));
        } else {
          onChange([...arr, optId]);
        }
      }
    } else {
      onChange(optId);
      // Auto-advance for single selection if not the last question
      if (!isLast) {
        setTimeout(onNext, 400);
      }
    }
  };

  const isSelected = (optId: string) => {
    if (multiple) {
      return ((value as string[]) || []).includes(optId);
    }
    return value === optId;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-6 pt-12 h-full flex flex-col"
    >
      <h2 className="font-serif text-3xl font-bold text-stone-900 mb-2">{title}</h2>
      <p className="text-stone-500 mb-8">{subtitle}</p>
      
      <div className="flex-1 flex flex-col justify-center gap-4">
        {options.map((opt) => {
          const selected = isSelected(opt.id);
          return (
            <button
              key={opt.id}
              onClick={() => toggleOption(opt.id)}
              className={`p-5 rounded-[2rem] border-2 shadow-sm transition-all flex items-center gap-4 text-left ${
                selected 
                  ? 'border-rust-500 bg-rust-500/5 ring-4 ring-rust-500/10' 
                  : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50'
              } active:scale-[0.98]`}
            >
              <div className={`p-3 rounded-2xl ${selected ? 'bg-rust-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {opt.icon}
              </div>
              <span className={`text-lg font-medium ${selected ? 'text-rust-500' : 'text-stone-800'}`}>
                {opt.label}
              </span>
            </button>
          );
        })}
      </div>

      {isLast && (
        <div className="mt-8 pb-4">
          <button
            onClick={onNext}
            disabled={!value || (multiple && ((value as string[]) || []).length === 0)}
            className={`w-full py-4 px-8 rounded-full font-medium text-lg transition-colors active:scale-95 disabled:opacity-50 bg-stone-900 text-white hover:bg-stone-800 shadow-lg`}
          >
            Generate Plan ✨
          </button>
        </div>
      )}
    </motion.div>
  );
}

export const QUESTIONS_CONFIG = [
  {
    id: 'q1',
    title: 'Who’s traveling?',
    subtitle: 'Tell me your group size',
    field: 'groupSize',
    multiple: false,
    options: [
      { id: 'solo', label: 'Just me', icon: <User size={24} /> },
      { id: 'duo', label: 'Two people', icon: <Users size={24} /> },
      { id: 'group', label: 'Three or more', icon: <UsersRound size={24} /> },
    ]
  },
  {
    id: 'q2',
    title: 'What is the mood?',
    subtitle: 'Pick your preference',
    field: 'activities',
    multiple: false,
    options: [
      { id: 'wander', label: 'Wander & Explore', icon: <Compass size={24} /> },
      { id: 'chill', label: 'Chill & Relax', icon: <Coffee size={24} /> },
      { id: 'active', label: 'Active & Adventure', icon: <Mountain size={24} /> },
    ]
  },
  {
    id: 'q3',
    title: 'Any dietary restrictions?',
    subtitle: 'Select the one that best fits your need',
    field: 'foodConstraints',
    multiple: false,
    options: [
      { id: 'none', label: 'None', icon: <Utensils size={24} /> },
      { id: 'vegetarian', label: 'Vegetarian', icon: <Leaf size={24} /> },
      { id: 'vegan', label: 'Vegan', icon: <Carrot size={24} /> },
      { id: 'halal', label: 'Halal', icon: <ShieldCheck size={24} /> },
      { id: 'kosher', label: 'Kosher', icon: <CircleDashed size={24} /> },
    ]
  },
  {
    id: 'q4',
    title: 'Accessibility needs?',
    subtitle: 'Help us find the right places',
    field: 'accessibility',
    multiple: false,
    options: [
      { id: 'none', label: 'None', icon: <Footprints size={24} /> },
      { id: 'wheelchair', label: 'Wheelchair accessible', icon: <Accessibility size={24} /> },
      { id: 'less_walking', label: 'Minimal walking', icon: <User size={24} /> },
      { id: 'no_stairs', label: 'Avoid stairs', icon: <ArrowUpSquare size={24} /> },
    ]
  },
  {
    id: 'q5',
    title: 'Budget per person?',
    subtitle: 'Average spending on food & activities',
    field: 'budget',
    multiple: false,
    options: [
      { id: 'free', label: 'Free options', icon: <Wallet size={24} /> },
      { id: 'budget_low', label: 'Less than 50€', icon: <Banknote size={24} /> },
      { id: 'no_limit', label: 'No threshold', icon: <Landmark size={24} /> },
    ]
  }
];
