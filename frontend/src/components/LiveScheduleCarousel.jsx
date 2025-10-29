import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { LiveScheduleCard } from './LiveScheduleCard';
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

  const handleCardClick = () => {
    hapticFeedback && hapticFeedback('impact', 'light');
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

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
        {/* Основная LiveScheduleCard слева */}
        <div className="flex-1">
          <LiveScheduleCard 
            currentClass={currentClass} 
            minutesLeft={minutesLeft}
          />
        </div>

        {/* Вертикальная карусель справа */}
        <div className="flex flex-col items-center gap-3">
          {/* Кнопка вверх */}
          <motion.button
            onClick={handlePrevious}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronUp className="w-5 h-5 text-white" />
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
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronDown className="w-5 h-5 text-white" />
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
