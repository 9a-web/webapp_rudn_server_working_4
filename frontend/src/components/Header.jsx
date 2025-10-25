import React from 'react';
import { Calendar } from 'lucide-react';

export const Header = ({ onCalendarClick }) => {
  return (
    <header className="px-6 md:px-8 lg:px-10 py-5 md:py-6 flex items-center justify-between">
      {/* Left side - Logo and text */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
          <img 
            src="/LogoRudn.png" 
            alt="RUDN Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-sm md:text-base lg:text-lg font-bold tracking-tight" style={{ color: '#E7E7E7' }}>
          Rudn Schedule
        </h1>
      </div>

      {/* Right side - Calendar icon */}
      <button
        onClick={onCalendarClick}
        className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Open calendar"
      >
        <Calendar className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#E7E7E7' }} />
      </button>
    </header>
  );
};
