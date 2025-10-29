import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LiveScheduleCard } from './LiveScheduleCard';
import { WeatherWidget } from './WeatherWidget';
import { AchievementsModal } from './AchievementsModal';

export const LiveScheduleCarousel = ({ 
  currentClass, 
  minutesLeft, 
  hapticFeedback,
  allAchievements,
  userAchievements,
  userStats,
  user
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAchievementsOpen, setIsAchievementsOpen] = useState(false);

  const cards = [
    { id: 0, type: 'schedule' },
    { id: 1, type: 'weather' },
    { id: 2, type: 'achievements' }
  ];

  const handlePrevious = (e) => {
    e.stopPropagation();
    hapticFeedback && hapticFeedback('impact', 'light');
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    hapticFeedback && hapticFeedback('impact', 'light');
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const currentCard = cards[currentIndex];

  return (
    <>
      {/* Вертикальная карусель справа от основной карточки - для ВСЕХ устройств */}
      <div className="flex gap-3 md:gap-4 mt-4 items-start px-6 md:px-0">
        {/* Основная карточка слева - меняется в зависимости от currentIndex */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
            >
              {currentCard.type === 'schedule' && (
                <LiveScheduleCard 
                  currentClass={currentClass} 
                  minutesLeft={minutesLeft}
                />
              )}

              {currentCard.type === 'weather' && (
                <div style={{ paddingBottom: '49px' }}>
                  {/* 3rd layer */}
                  <motion.div 
                    className="absolute rounded-3xl mx-auto left-0 right-0"
                    style={{ 
                      backgroundColor: '#212121',
                      width: '83.4%',
                      height: '140px',
                      top: '49px',
                      zIndex: 1
                    }}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  />
                  {/* 2nd layer */}
                  <motion.div 
                    className="absolute rounded-3xl mx-auto left-0 right-0"
                    style={{ 
                      backgroundColor: '#2C2C2C',
                      width: '93%',
                      height: '156px',
                      top: '22px',
                      zIndex: 2
                    }}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                  />
                  {/* Main card with weather */}
                  <motion.div 
                    className="relative rounded-3xl overflow-hidden"
                    style={{ 
                      backgroundColor: '#343434',
                      width: '100%',
                      zIndex: 3
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <div className="p-4">
                      <WeatherWidget hapticFeedback={hapticFeedback} />
                    </div>
                  </motion.div>
                </div>
              )}

              {currentCard.type === 'achievements' && user && (
                <div 
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAchievementsOpen(true);
                  }}
                  style={{ paddingBottom: '49px' }}
                >
                  {/* 3rd layer */}
                  <motion.div 
                    className="absolute rounded-3xl mx-auto left-0 right-0"
                    style={{ 
                      backgroundColor: '#212121',
                      width: '83.4%',
                      height: '140px',
                      top: '49px',
                      zIndex: 1
                    }}
                    initial={{ opacity: 0, y: 15, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.6 }}
                  />
                  {/* 2nd layer */}
                  <motion.div 
                    className="absolute rounded-3xl mx-auto left-0 right-0"
                    style={{ 
                      backgroundColor: '#2C2C2C',
                      width: '93%',
                      height: '156px',
                      top: '22px',
                      zIndex: 2
                    }}
                    initial={{ opacity: 0, y: 10, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.5 }}
                  />
                  {/* Main card with achievements preview */}
                  <motion.div 
                    className="relative rounded-3xl p-6 overflow-hidden"
                    style={{ 
                      backgroundColor: '#343434',
                      width: '100%',
                      zIndex: 3
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                  >
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-br from-[#FFE66D]/20 to-transparent"
                      animate={{ opacity: [0.3, 0.5, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl">🏆</span>
                          <h3 className="text-xl font-bold text-white">Достижения</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#FFE66D]">
                            {userStats?.total_points || 0}
                          </div>
                          <div className="text-xs text-gray-400">очков</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-3xl font-bold text-white mb-1">
                            {userStats?.achievements_count || 0}/{allAchievements.length}
                          </div>
                          <div className="text-sm text-gray-400">Получено</div>
                        </div>

                        {/* Последние 3 достижения */}
                        <div className="flex gap-2">
                          {userAchievements.slice(0, 3).map((ua, idx) => (
                            <motion.div
                              key={idx}
                              className="text-3xl"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: 0.3 + idx * 0.1 }}
                            >
                              {ua.achievement.emoji}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 text-center text-sm text-[#A3F7BF]">
                        Нажмите, чтобы открыть
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Вертикальная карусель справа - скрыта на десктопах (md и больше) */}
        <div className="flex flex-col items-center gap-3 md:hidden">
          {/* Кнопка вверх */}
          <motion.button
            onClick={handlePrevious}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp className="w-4 h-4 text-white" />
          </motion.button>

          {/* Вертикальные индикаторы */}
          <div className="flex flex-col justify-center gap-2">
            {cards.map((card, index) => (
              <motion.button
                key={card.id}
                onClick={(e) => {
                  e.stopPropagation();
                  hapticFeedback && hapticFeedback('impact', 'light');
                  setCurrentIndex(index);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex ? 'bg-[#A3F7BF] h-6' : 'bg-gray-600'
                }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Кнопка вниз */}
          <motion.button
            onClick={handleNext}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown className="w-4 h-4 text-white" />
          </motion.button>
        </div>
      </div>

      {/* Модалка достижений */}
      {user && (
        <AchievementsModal
          isOpen={isAchievementsOpen}
          onClose={() => setIsAchievementsOpen(false)}
          allAchievements={allAchievements}
          userAchievements={userAchievements}
          userStats={userStats}
          hapticFeedback={hapticFeedback}
        />
      )}
    </>
  );
};
