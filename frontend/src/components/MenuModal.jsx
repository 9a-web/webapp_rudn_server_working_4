import React from 'react';
import { Languages, BarChart3, Trophy, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const MenuModal = ({ 
  isOpen, 
  onClose, 
  onCalendarClick, 
  onNotificationsClick, 
  onAnalyticsClick, 
  onAchievementsClick,
  hapticFeedback 
}) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    if (hapticFeedback) hapticFeedback('impact', 'light');
    const newLang = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const handleMenuItemClick = (action) => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    action();
    onClose();
  };

  const menuItems = [
    {
      id: 'achievements',
      icon: Trophy,
      label: t('menu.achievements', 'Достижения'),
      color: '#FFE66D',
      action: onAchievementsClick,
      show: !!onAchievementsClick
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: t('menu.analytics', 'Аналитика'),
      color: '#80E8FF',
      action: onAnalyticsClick,
      show: !!onAnalyticsClick
    },
    {
      id: 'language',
      icon: Languages,
      label: `${t('menu.language', 'Язык')}: ${i18n.language.toUpperCase()}`,
      color: '#C4A3FF',
      action: toggleLanguage,
      show: true
    }
  ];

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const modalVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.9,
      y: -20
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: -20,
      transition: {
        duration: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (custom) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: custom * 0.1,
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    })
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed top-20 right-6 md:right-8 lg:right-10 z-50 w-72 md:w-80"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  {t('menu.title', 'Меню')}
                </h3>
                <button
                  onClick={() => {
                    if (hapticFeedback) hapticFeedback('impact', 'light');
                    onClose();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="p-3">
                {menuItems.filter(item => item.show).map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <motion.button
                      key={item.id}
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleMenuItemClick(item.action)}
                      className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all duration-300 group"
                    >
                      <div 
                        className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: `${item.color}20` }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: item.color }}
                        />
                      </div>
                      <span className="text-base font-medium text-gray-800 flex-1 text-left">
                        {item.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 text-center">
                  {t('menu.footer', 'RUDN Schedule')}
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
