import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Компонент подсказки о swipe-навигации
 * Показывается один раз при первом входе
 */
export const SwipeHint = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Проверяем, показывали ли уже подсказку
    const hasSeenHint = localStorage.getItem('hasSeenSwipeHint');
    
    if (!hasSeenHint) {
      // Показываем подсказку через 2 секунды после загрузки
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      // Автоматически скрываем через 5 секунд
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem('hasSeenSwipeHint', 'true');
      }, 7000);

      return () => {
        clearTimeout(timer);
        clearTimeout(hideTimer);
      };
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenSwipeHint', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="fixed bottom-24 left-1/2 z-50 pointer-events-auto"
          style={{ transform: 'translateX(-50%)' }}
        >
          <div
            onClick={handleDismiss}
            className="bg-black/90 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-2xl max-w-sm mx-4 cursor-pointer"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <motion.div
                animate={{ x: [-10, 0, -10] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </motion.div>
              
              <p className="text-white text-sm font-medium text-center">
                Свайпайте влево и вправо<br />
                для навигации между днями
              </p>
              
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </motion.div>
            </div>
            
            <p className="text-gray-400 text-xs text-center mt-2">
              Нажмите, чтобы скрыть
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
