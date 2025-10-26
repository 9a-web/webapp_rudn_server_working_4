import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { liveCardVariants, fadeInScale } from '../utils/animations';

export const LiveScheduleCard = ({ currentClass, minutesLeft }) => {
  const [time, setTime] = useState(new Date());
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Расчет прогресса для progress bar (предполагаем, что пара длится 90 минут)
  const progressPercentage = useMemo(() => {
    if (!currentClass || !minutesLeft) return 0;
    const totalClassDuration = 90; // минут
    const elapsed = totalClassDuration - minutesLeft;
    return Math.max(0, Math.min(100, (elapsed / totalClassDuration) * 100));
  }, [currentClass, minutesLeft]);

  // SVG circle параметры
  const circleRadius = 42;
  const circleCircumference = 2 * Math.PI * circleRadius;

  return (
    <div className="mt-4 flex justify-center px-6 md:px-0">
      <motion.div 
        className="relative w-full max-w-[373px] md:max-w-[420px] lg:max-w-[480px]" 
        style={{ paddingBottom: '49px' }}
        initial="initial"
        animate="animate"
        variants={liveCardVariants}
      >
        {/* 3rd layer - самая маленькая и дальняя с параллакс эффектом */}
        <motion.div 
          className="absolute rounded-3xl mx-auto left-0 right-0"
          style={{ 
            backgroundColor: '#212121',
            width: '83.4%', // 311/373
            height: '140px',
            top: '49px',
            zIndex: 1
          }}
          initial={{ opacity: 0, y: 15, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.1,
            duration: 0.6,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        ></motion.div>
        {/* 2nd layer - средняя с параллакс эффектом */}
        <motion.div 
          className="absolute rounded-3xl mx-auto left-0 right-0"
          style={{ 
            backgroundColor: '#2C2C2C',
            width: '93%', // 347/373
            height: '156px',
            top: '22px',
            zIndex: 2
          }}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            delay: 0.15,
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        ></motion.div>
        
        {/* Main card - 1-я карточка (самая большая) */}
        <motion.div 
          className="relative rounded-3xl p-6 md:p-8 shadow-card overflow-hidden"
          style={{ 
            backgroundColor: '#343434',
            width: '100%',
            height: '167px',
            zIndex: 3
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            delay: 0.2,
            duration: 0.4,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        >
          {/* Subtle background gradient с пульсацией */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent"
            animate={{ 
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          ></motion.div>
          
          <div className="relative flex items-center justify-between">
            {/* Left side - Text content с улучшенными анимациями */}
            <div className="flex-1">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentClass || 'no-class'}
                  className="mb-2"
                  initial={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <motion.p 
                    className="font-bold text-base md:text-lg lg:text-xl" 
                    style={{ color: '#FFFFFF' }}
                    animate={currentClass ? {
                      textShadow: [
                        '0 0 0px rgba(163, 247, 191, 0)',
                        '0 0 10px rgba(163, 247, 191, 0.5)',
                        '0 0 0px rgba(163, 247, 191, 0)'
                      ]
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {currentClass ? t('liveScheduleCard.currentClass') : t('liveScheduleCard.noClass')}
                  </motion.p>
                  {currentClass && (
                    <motion.p 
                      className="font-bold text-base md:text-lg lg:text-xl" 
                      style={{ color: '#FFFFFF' }}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      {currentClass}
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>
              <AnimatePresence mode="wait">
                <motion.p 
                  key={minutesLeft}
                  className="font-medium text-sm md:text-base" 
                  style={{ color: '#999999' }}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 5 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {currentClass ? t('liveScheduleCard.timeLeft', { minutes: minutesLeft }) : t('liveScheduleCard.relax')}
                </motion.p>
              </AnimatePresence>
            </div>

            {/* Right side - Gradient circle with time and progress bar */}
            <motion.div 
              className="relative flex items-center justify-center w-24 h-24 md:w-28 md:h-28"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: [1, 1.02, 1],
                opacity: 1
              }}
              transition={{ 
                scale: {
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                },
                opacity: {
                  duration: 0.4,
                  delay: 0.3
                }
              }}
            >
              {/* Glowing background effect */}
              <motion.div
                className="absolute w-24 h-24 md:w-28 md:h-28 rounded-full"
                style={{
                  background: 'radial-gradient(circle, rgba(163, 247, 191, 0.3) 0%, rgba(255, 230, 109, 0.2) 25%, rgba(255, 180, 209, 0.2) 50%, rgba(196, 163, 255, 0.2) 75%, rgba(128, 232, 255, 0.3) 100%)',
                  filter: 'blur(20px)'
                }}
                animate={{ 
                  scale: [1, 1.15, 1],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* SVG Progress Bar (всегда отображается) */}
              <svg 
                className="absolute w-24 h-24 md:w-28 md:h-28"
                style={{ transform: 'rotate(-90deg)' }}
              >
                {/* Gradient definitions */}
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#A3F7BF" />
                    <stop offset="25%" stopColor="#FFE66D" />
                    <stop offset="50%" stopColor="#FFB4D1" />
                    <stop offset="75%" stopColor="#C4A3FF" />
                    <stop offset="100%" stopColor="#80E8FF" />
                  </linearGradient>
                  <filter id="glowFilter">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Background circle - всегда видимое яркое */}
                <circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  stroke="url(#progressGradient)"
                  strokeWidth="4"
                  fill="none"
                  opacity="0.8"
                  filter="url(#glowFilter)"
                />
                
                {/* Progress circle - заполняется во время пары */}
                <motion.circle
                  cx="48"
                  cy="48"
                  r={circleRadius}
                  stroke="url(#progressGradient)"
                  strokeWidth="5"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ 
                    strokeDasharray: circleCircumference,
                    strokeDashoffset: circleCircumference
                  }}
                  animate={{ 
                    strokeDashoffset: currentClass 
                      ? circleCircumference - (circleCircumference * progressPercentage) / 100
                      : circleCircumference
                  }}
                  transition={{ 
                    duration: 1,
                    ease: [0.25, 0.1, 0.25, 1]
                  }}
                  style={{
                    filter: currentClass 
                      ? 'drop-shadow(0 0 12px rgba(163, 247, 191, 0.8)) drop-shadow(0 0 20px rgba(163, 247, 191, 0.5))' 
                      : 'url(#glowFilter)'
                  }}
                />
              </svg>
              
              {/* Center content with time */}
              <motion.div 
                className="relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center z-10" 
                style={{ backgroundColor: '#343434' }}
                animate={{ 
                  boxShadow: currentClass 
                    ? [
                        '0 0 0 rgba(163, 247, 191, 0)',
                        '0 0 20px rgba(163, 247, 191, 0.3)',
                        '0 0 0 rgba(163, 247, 191, 0)'
                      ]
                    : [
                        '0 0 0 rgba(128, 232, 255, 0)',
                        '0 0 15px rgba(128, 232, 255, 0.2)',
                        '0 0 0 rgba(128, 232, 255, 0)'
                      ]
                }}
                transition={{ 
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.span 
                    key={formatTime(time)}
                    className="text-xl md:text-2xl font-bold" 
                    style={{ color: '#FFFFFF' }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    {formatTime(time)}
                  </motion.span>
                </AnimatePresence>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
