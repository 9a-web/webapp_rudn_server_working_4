import React from 'react';
import { Calendar, Languages, Bell, BarChart3, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { headerItemVariants, buttonVariants } from '../utils/animations';

export const Header = ({ onCalendarClick, onNotificationsClick, onAnalyticsClick, onAchievementsClick }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  return (
    <header className="px-6 md:px-8 lg:px-10 py-5 md:py-6 flex items-center justify-between">
      {/* Left side - Logo and text */}
      <motion.div 
        className="flex items-center gap-3 md:gap-4"
        custom={0}
        initial="initial"
        animate="animate"
        variants={headerItemVariants}
      >
        <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center">
          <img 
            src="/LogoRudn.png" 
            alt="RUDN Logo" 
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-sm md:text-base lg:text-lg font-bold tracking-tight" style={{ color: '#E7E7E7' }}>
          {t('header.title')}
        </h1>
      </motion.div>

      {/* Right side - Analytics, Notifications, Language switcher and Calendar icon */}
      <div className="flex items-center gap-2">
        {/* Analytics icon */}
        {onAnalyticsClick && (
          <motion.button
            onClick={onAnalyticsClick}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
            aria-label="Analytics"
            custom={1}
            initial="initial"
            animate="animate"
            variants={headerItemVariants}
            whileHover="hover"
            whileTap="tap"
            {...buttonVariants}
          >
            <BarChart3 className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#E7E7E7' }} />
          </motion.button>
        )}

        {/* Notifications icon */}
        {onNotificationsClick && (
          <motion.button
            onClick={onNotificationsClick}
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
            aria-label="Notifications settings"
            custom={2}
            initial="initial"
            animate="animate"
            variants={headerItemVariants}
            whileHover="hover"
            whileTap="tap"
            {...buttonVariants}
          >
            <Bell className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#E7E7E7' }} />
          </motion.button>
        )}

        {/* Language switcher */}
        <motion.button
          onClick={toggleLanguage}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
          aria-label="Switch language"
          custom={3}
          initial="initial"
          animate="animate"
          variants={headerItemVariants}
          whileHover="hover"
          whileTap="tap"
          {...buttonVariants}
        >
          <div className="flex flex-col items-center justify-center">
            <Languages className="w-4 h-4 md:w-5 md:h-5" style={{ color: '#E7E7E7' }} />
            <span className="text-[9px] md:text-[10px] font-medium mt-0.5" style={{ color: '#E7E7E7' }}>
              {i18n.language.toUpperCase()}
            </span>
          </div>
        </motion.button>

        {/* Calendar icon */}
        <motion.button
          onClick={onCalendarClick}
          className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg md:rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300"
          aria-label="Open calendar"
          custom={4}
          initial="initial"
          animate="animate"
          variants={headerItemVariants}
          whileHover="hover"
          whileTap="tap"
          {...buttonVariants}
        >
          <Calendar className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#E7E7E7' }} />
        </motion.button>
      </div>
    </header>
  );
};
