import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, X } from 'lucide-react';

export const AchievementNotification = ({ achievement, onClose, hapticFeedback }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Вибрация при появлении
    hapticFeedback && hapticFeedback('notification', 'success');
    
    // Автоматически закрываем через 5 секунд
    const timer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!achievement) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] sm:w-[90%] max-w-md px-2 sm:px-0"
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: 1,
            transition: {
              type: "spring",
              damping: 15,
              stiffness: 300
            }
          }}
          exit={{ 
            opacity: 0, 
            y: -50,
            scale: 0.9,
            transition: { duration: 0.3 }
          }}
        >
          <motion.div
            className="bg-gradient-to-br from-[#A3F7BF] via-[#FFE66D] to-[#A3F7BF] p-[2px] rounded-2xl shadow-2xl"
            animate={{
              boxShadow: [
                "0 0 20px rgba(163, 247, 191, 0.3)",
                "0 0 40px rgba(163, 247, 191, 0.5)",
                "0 0 20px rgba(163, 247, 191, 0.3)",
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <div className="bg-[#2A2A2A] rounded-2xl p-3 sm:p-4 relative overflow-hidden">
              {/* Анимированный фон */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[#A3F7BF]/10 via-[#FFE66D]/10 to-transparent"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />

              {/* Контент */}
              <div className="relative z-10">
                <div className="flex items-start gap-2 sm:gap-3">
                  {/* Иконка трофея */}
                  <motion.div
                    className="flex-shrink-0"
                    animate={{
                      rotate: [0, -10, 10, -10, 0],
                      scale: [1, 1.1, 1, 1.1, 1],
                    }}
                    transition={{
                      duration: 0.5,
                      delay: 0.2,
                    }}
                  >
                    <div className="bg-gradient-to-br from-[#FFE66D]/20 to-[#A3F7BF]/20 rounded-xl p-2">
                      <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-[#FFE66D]" />
                    </div>
                  </motion.div>

                  {/* Текст */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs sm:text-sm font-bold text-[#A3F7BF]">
                        Новое достижение!
                      </h3>
                      <motion.div
                        animate={{
                          rotate: [0, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      >
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-[#FFE66D]" />
                      </motion.div>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl sm:text-3xl flex-shrink-0">{achievement.emoji}</span>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm sm:text-base text-white truncate">{achievement.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-300 line-clamp-2">{achievement.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#FFE66D]">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>+{achievement.points} очков</span>
                    </div>
                  </div>

                  {/* Кнопка закрытия */}
                  <button
                    onClick={handleClose}
                    className="flex-shrink-0 p-1 hover:bg-white/10 rounded-full transition-colors touch-manipulation"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Конфетти эффект */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                  style={{
                    background: i % 2 === 0 ? '#A3F7BF' : '#FFE66D',
                    left: `${20 + i * 10}%`,
                    top: '50%',
                  }}
                  initial={{ scale: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    y: [-50, -100, -150],
                    x: [(Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100],
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
