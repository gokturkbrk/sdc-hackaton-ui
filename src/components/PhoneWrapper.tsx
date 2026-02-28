import type { ReactNode } from 'react';

export function PhoneWrapper({ children }: { children: ReactNode }) {
  return (
    <div className="relative w-full h-full bg-[#fdfdfc] rounded-[3rem] shadow-2xl overflow-hidden border-[8px] border-stone-800 ring-4 ring-stone-900/10 flex flex-col">
      {/* Notch */}
      <div className="absolute top-0 inset-x-0 h-7 flex justify-center z-50 pointer-events-none">
        <div className="w-[120px] h-full bg-stone-800 rounded-b-3xl"></div>
      </div>
      
      {/* Device Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative w-full h-full bg-[#fdfdfc] flex flex-col">
        {children}
      </div>

      {/* Home Indicator */}
      <div className="absolute bottom-1 inset-x-0 h-3 flex justify-center items-center z-50 pointer-events-none">
        <div className="w-[120px] h-1.5 bg-stone-900/20 backdrop-blur-md rounded-full"></div>
      </div>
    </div>
  );
}
