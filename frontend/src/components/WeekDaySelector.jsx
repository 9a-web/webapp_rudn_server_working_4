import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { daySelectorVariants, listItemVariants } from '../utils/animations';

export const WeekDaySelector = ({ selectedDate, onDateSelect, weekNumber = 1, hapticFeedback }) => {
  const [weekDays, setWeekDays] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    generateWeekDays(weekNumber);
  }, [weekNumber]);

  // Синхронизация selectedIndex с selectedDate из родителя
  useEffect(() => {
    if (selectedDate && weekDays.length > 0) {
      // Находим индекс дня, который соответствует выбранной дате
      const index = weekDays.findIndex(day => {
        return day.fullDate.toDateString() === selectedDate.toDateString();
      });
      
      if (index !== -1) {
        setSelectedIndex(index);
      } else {
        // Если выбранная дата не в диапазоне недели, снимаем выделение
        setSelectedIndex(-1);
      }
    }
  }, [selectedDate, weekDays]);

  const generateWeekDays = (week) => {
    const today = new Date();
    const days = [];
    
    // Получаем понедельник текущей недели
    const currentDayOfWeek = today.getDay(); // 0 = Воскресенье, 1 = Понедельник, ...
    const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1; // Смещение от понедельника
    
    const monday = new Date(today);
    monday.setDate(today.getDate() - daysFromMonday);
    
    // Если выбрана следующая неделя, добавляем 7 дней
    if (week === 2) {
      monday.setDate(monday.getDate() + 7);
    }
    
    // Генерируем 7 дней недели (Пн-Вс)
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      days.push({
        date: date.getDate(),
        dayName: getDayName(date.getDay()),
        fullDate: date,
        isToday: date.toDateString() === today.toDateString()
      });
    }
    
    setWeekDays(days);
    
    // Автоматически выбираем сегодняшний день, если он есть в списке
    if (week === 1) {
      const todayIndex = days.findIndex(day => day.isToday);
      if (todayIndex !== -1) {
        setSelectedIndex(todayIndex);
        if (onDateSelect) {
          onDateSelect(days[todayIndex].fullDate);
        }
      }
    } else {
      // Для следующей недели выбираем понедельник
      setSelectedIndex(0);
      if (onDateSelect) {
        onDateSelect(days[0].fullDate);
      }
    }
  };

  const getDayName = (dayIndex) => {
    const daysMap = {
      0: t('weekDays.short.sun'),
      1: t('weekDays.short.mon'),
      2: t('weekDays.short.tue'),
      3: t('weekDays.short.wed'),
      4: t('weekDays.short.thu'),
      5: t('weekDays.short.fri'),
      6: t('weekDays.short.sat')
    };
    return daysMap[dayIndex];
  };

  const handleDayClick = (index, day) => {
    if (hapticFeedback) hapticFeedback('impact', 'light');
    setSelectedIndex(index);
    if (onDateSelect) {
      onDateSelect(day.fullDate);
    }
  };

  return (
    <div className="px-6 md:px-8 lg:px-10 overflow-x-auto scrollbar-hide">
      <motion.div 
        className="flex gap-3 md:gap-4 justify-start md:justify-center min-w-max md:min-w-0 items-center" 
        style={{ height: '127px', padding: '0 4px' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {weekDays.map((day, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <motion.button
              key={`${day.fullDate.toISOString()}-${index}`}
              onClick={() => handleDayClick(index, day)}
              className={`
                flex-shrink-0 rounded-[40px] flex flex-col items-center justify-center
                transition-all duration-300
                ${
                  isSelected
                    ? 'bg-gradient-live'
                    : 'bg-[#2C2C2C] hover:bg-[#353535]'
                }
              `}
              style={{ 
                width: isSelected ? '61px' : '61px',
                height: isSelected ? '127px' : '99px'
              }}
              custom={index}
              initial="initial"
              animate="animate"
              variants={listItemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap="tap"
              layout
              transition={{
                layout: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
              }}
            >
                {/* Date */}
                <motion.span
                  className="font-zaglav font-normal leading-none"
                  style={{
                    fontSize: '52px',
                    color: isSelected ? '#F9F9F9' : '#BEBEBE',
                    fontWeight: 400,
                    marginBottom: '1px'
                  }}
                  animate={{ 
                    scale: isSelected ? 1.05 : 1,
                    color: isSelected ? '#F9F9F9' : '#BEBEBE'
                  }}
                  transition={{ duration: 0.3 }}
                >
                  {String(day.date).padStart(2, '0')}
                </motion.span>
                
                {/* Day of week */}
                <span
                  className="font-zaglav font-normal leading-none"
                  style={{
                    fontSize: '36px',
                    color: '#999999',
                    fontWeight: 400
                  }}
                >
                  {day.dayName}
                </span>
              </motion.button>
          );
        })}
      </motion.div>
    </div>
  );
};
