import React from 'react';
import { Calendar } from 'lucide-react';

export const Header = ({ onCalendarClick }) => {
  return (
    <header className="px-6 py-5 flex items-center justify-between">
      {/* Left side - Logo and text */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 flex items-center justify-center">
          <img 
            src="/LogoRudn.png" 
            alt="RUDN Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-sm font-bold tracking-tight" style={{ color: '#E7E7E7' }}>
          Rudn Schedule
        </h1>
      </div>

      {/* Right side - Calendar icon */}
      <button
        onClick={onCalendarClick}
        className="w-10 h-10 flex items-center justify-center rounded-lg bg-accent/50 hover:bg-accent transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Open calendar"
      >
        <Calendar className="w-5 h-5" style={{ color: '#E7E7E7' }} />
      </button>
    </header>
  );
};
