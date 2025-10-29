import React, { useState, useRef } from 'react';
import { Menu, Calendar, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { headerItemVariants } from '../utils/animations';
import { MenuModal } from './MenuModal';
import { rainbowConfetti } from '../utils/confetti';

export const Header = React.memo(({ onCalendarClick, onNotificationsClick, onAnalyticsClick, onAchievementsClick, hapticFeedback }) => {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const clickTimerRef = useRef(null);

  const handleMenuClick = () => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogoClick = () => {
    // Увеличиваем счётчик кликов
    const newCount = logoClickCount + 1;
    setLogoClickCount(newCount);

    // Лёгкая вибрация при каждом клике
    if (hapticFeedback) hapticFeedback('impact', 'light');

    // Сбрасываем таймер
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
    }

    // Если достигли 10 кликов - запускаем пасхалку!
    if (newCount >= 10) {
      activateEasterEgg();
      setLogoClickCount(0);
      return;
    }

    // Сбрасываем счётчик через 2 секунды неактивности
    clickTimerRef.current = setTimeout(() => {
      setLogoClickCount(0);
    }, 2000);
  };

  const activateEasterEgg = () => {
    // Сильная вибрация
    if (hapticFeedback) hapticFeedback('notification', 'success');
    
    // Запускаем радужное конфетти!
    rainbowConfetti();
    
    // Показываем секретное сообщение
    setShowEasterEgg(true);
    
    // Скрываем через 4 секунды
    setTimeout(() => {
      setShowEasterEgg(false);
    }, 4000);
  };

  return (
    <>
      <header className="px-6 md:px-8 lg:px-10 py-5 md:py-6 flex items-center justify-between">
        {/* Left side - Logo and text */}
        <motion.div 
          className="flex items-center gap-3 md:gap-4 cursor-pointer select-none"
          custom={0}
          initial="initial"
          animate="animate"
          variants={headerItemVariants}
          onClick={handleLogoClick}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div 
            className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center"
            animate={logoClickCount > 0 ? {
              rotate: [0, -10, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <img 
              src="/LogoRudn.png" 
              alt="RUDN Logo" 
              className="w-full h-full object-contain"
            />
          </motion.div>
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
