import React, { useState, useEffect } from 'react';

export const WeekDaySelector = ({ selectedDate, onDateSelect, weekNumber = 1, hapticFeedback }) => {
  const [weekDays, setWeekDays] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

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
    const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    return days[dayIndex];
  };

  const handleDayClick = (index, day) => {
    if (hapticFeedback) hapticFeedback('impact', 'light');
    setSelectedIndex(index);
    if (onDateSelect) {
      onDateSelect(day.fullDate);
    }
  };

  return (
    <div className="px-6 overflow-x-auto scrollbar-hide">
      <div className="flex gap-3 justify-start min-w-max pl-1 items-center" style={{ height: '127px' }}>
        {weekDays.map((day, index) => {
          const isSelected = index === selectedIndex;
          
          return (
            <button
              key={index}
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
                width: '61px', 
                height: isSelected ? '127px' : '99px'
              }}
            >
              {/* Date */}
              <span
                className="font-zaglav font-normal leading-none"
                style={{
                  fontSize: '52px',
                  color: isSelected ? '#F9F9F9' : '#BEBEBE',
                  fontWeight: 400,
                  marginBottom: '1px'
                }}
              >
                {String(day.date).padStart(2, '0')}
              </span>
              
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
            </button>
          );
        })}
      </div>
    </div>
  );
};
