import React, { useState } from 'react';
import { Menu, Calendar, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { headerItemVariants, buttonVariants } from '../utils/animations';
import { MenuModal } from './MenuModal';

export const Header = React.memo(({ onCalendarClick, onNotificationsClick, onAnalyticsClick, onAchievementsClick, hapticFeedback }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuClick = () => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
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

        {/* Right side - Calendar, Notifications, and Menu buttons */}
        <div className="flex items-center gap-2">
          {/* Calendar button */}
          <motion.button
            onClick={() => {
              if (hapticFeedback) hapticFeedback('impact', 'medium');
              onCalendarClick();
            }}
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300 relative overflow-hidden group"
            aria-label="Open calendar"
            custom={1}
            initial="initial"
            animate="animate"
            variants={headerItemVariants}
            whileHover="hover"
            whileTap="tap"
            {...buttonVariants}
          >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-teal-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Calendar className="w-5 h-5 md:w-6 md:h-6 relative z-10" style={{ color: '#E7E7E7' }} />
          </motion.button>

          {/* Notifications button */}
          <motion.button
            onClick={() => {
              if (hapticFeedback) hapticFeedback('impact', 'medium');
              onNotificationsClick();
            }}
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300 relative overflow-hidden group"
            aria-label="Open notifications"
            custom={2}
            initial="initial"
            animate="animate"
            variants={headerItemVariants}
            whileHover="hover"
            whileTap="tap"
            {...buttonVariants}
          >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-rose-400/20 to-red-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Bell className="w-5 h-5 md:w-6 md:h-6 relative z-10" style={{ color: '#E7E7E7' }} />
          </motion.button>

          {/* Menu button */}
          <motion.button
            onClick={handleMenuClick}
            className="w-10 h-10 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-accent/50 hover:bg-accent transition-all duration-300 relative overflow-hidden group"
            aria-label="Open menu"
            custom={3}
            initial="initial"
            animate="animate"
            variants={headerItemVariants}
            whileHover="hover"
            whileTap="tap"
            {...buttonVariants}
          >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-pink-400/20 to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <Menu className="w-5 h-5 md:w-6 md:h-6 relative z-10" style={{ color: '#E7E7E7' }} />
          </motion.button>
        </div>
      </header>

      {/* Menu Modal */}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onCalendarClick={onCalendarClick}
        onNotificationsClick={onNotificationsClick}
        onAnalyticsClick={onAnalyticsClick}
        onAchievementsClick={onAchievementsClick}
        hapticFeedback={hapticFeedback}
      />
    </>
  );
});
