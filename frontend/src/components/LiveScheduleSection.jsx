import React, { useState, useEffect } from 'react';
import { Calendar, ChevronRight, ChevronDown, RefreshCw, Users } from 'lucide-react';
import { getWeekNumberForDate } from '../utils/dateUtils';
import { useTranslation } from 'react-i18next';

export const LiveScheduleSection = ({ 
  selectedDate, 
  mockSchedule, 
  weekNumber = 1,
  onWeekChange,
  groupName,
  onChangeGroup,
  hapticFeedback 
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { t } = useTranslation();

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Определяем, к какой неделе относится выбранная дата
  const selectedWeekNumber = getWeekNumberForDate(selectedDate);

  // Format date for display
  const dayNumber = selectedDate.getDate();
  const dayName = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
  
  // Format date for the button (e.g., "Oct. 12")
  const monthShort = selectedDate.toLocaleDateString('ru-RU', { month: 'short' });
  const dateButton = `${dayNumber} ${monthShort}`;

  // Function to determine class status
  const getClassStatus = (classItem) => {
    const now = currentTime;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    // Проверяем, что выбранный день - сегодня
    const today = new Date();
    const isToday = selectedDate.toDateString() === today.toDateString();

    const timeRange = classItem.time.split('-');
    if (timeRange.length !== 2) return { status: t('classStatus.upcoming'), color: '#FF6B6B' };

    const [startHour, startMin] = timeRange[0].trim().split(':').map(Number);
    const [endHour, endMin] = timeRange[1].trim().split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Если выбран прошлый день - все пары закончились
    if (selectedDate < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return { status: t('classStatus.finished'), color: '#76EF83' };
    }

    // Если выбран будущий день - все пары предстоят
    if (selectedDate > new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
      return { status: t('classStatus.upcoming'), color: '#FF6B6B' };
    }

    // Если сегодня - проверяем по времени
    if (isToday) {
      if (currentMinutes >= endTime) {
        return { status: t('classStatus.finished'), color: '#76EF83' };
      } else if (currentMinutes >= startTime && currentMinutes < endTime) {
        return { status: t('classStatus.inProgress'), color: '#FFC83F' };
      } else {
        return { status: t('classStatus.upcoming'), color: '#FF6B6B' };
      }
    }

    return { status: t('classStatus.upcoming'), color: '#FF6B6B' };
  };

  const toggleExpand = (index) => {
    if (hapticFeedback) hapticFeedback('selection');
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  // Фильтруем расписание по выбранному дню
  const currentDayName = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
  const formattedDayName = currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1);
  const todaySchedule = mockSchedule.filter(item => item.day === formattedDayName);

  return (
    <div className="bg-white rounded-t-[40px] mt-6 min-h-screen">
      <div className="px-6 md:px-8 lg:px-10 pt-8 md:pt-10 pb-6">
        {/* Header section */}
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <div>
            <h2 
              className="font-bold mb-1 text-2xl md:text-3xl lg:text-4xl"
              style={{ 
                color: '#1C1C1C',
                fontFamily: 'Plus Jakarta Sans, sans-serif',
                lineHeight: '1.2'
              }}
            >
              Live Schedule
            </h2>
            {groupName && (
              <p 
                className="mt-1 text-sm md:text-base"
                style={{ 
                  color: '#666666',
                  fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontWeight: 500
                }}
              >
                Группа: {groupName}
              </p>
            )}
          </div>
          
          {/* Date button */}
          <button
            className="flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-[30px] transition-all duration-300 hover:opacity-80"
            style={{ 
              backgroundColor: '#1C1C1C'
            }}
          >
            <Calendar className="w-4 h-4 md:w-5 md:h-5 text-white" />
            <span 
              className="text-sm md:text-base font-medium text-white"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              {dateButton}
            </span>
          </button>
        </div>

        {/* Week selector */}
        {onWeekChange && (
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                if (hapticFeedback) hapticFeedback('impact', 'medium');
                onWeekChange(1);
              }}
              disabled={selectedWeekNumber === null}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedWeekNumber === 1
                  ? 'bg-black text-white' 
                  : selectedWeekNumber === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Текущая неделя
            </button>
            <button
              onClick={() => {
                if (hapticFeedback) hapticFeedback('impact', 'medium');
                onWeekChange(2);
              }}
              disabled={selectedWeekNumber === null}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
                selectedWeekNumber === 2
                  ? 'bg-black text-white' 
                  : selectedWeekNumber === null
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Следующая неделя
            </button>
          </div>
        )}

        {/* Change group button */}
        {onChangeGroup && (
          <button
            onClick={() => {
              if (hapticFeedback) hapticFeedback('impact', 'medium');
              onChangeGroup();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all mb-4"
          >
            <Users className="w-4 h-4" />
            Сменить группу
          </button>
        )}

        {/* Schedule list */}
        {todaySchedule.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400 text-base md:text-lg">
              {mockSchedule.length === 0 
                ? 'Загрузка расписания...' 
                : 'На этот день занятий нет'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
            {todaySchedule.map((classItem, index) => {
              const { status, color } = getClassStatus(classItem);
              const isExpanded = expandedIndex === index;

              return (
                <div 
                  key={index} 
                  className="rounded-2xl md:rounded-3xl p-4 md:p-5 transition-all duration-300 cursor-pointer hover:shadow-md"
                  style={{ 
                    backgroundColor: '#F5F5F5',
                  }}
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p 
                        className="font-bold mb-2 text-base md:text-lg"
                        style={{ 
                          color: '#2C2C2C',
                          fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                        }}
                      >
                        {classItem.discipline}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div 
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span 
                          className="font-medium"
                          style={{ 
                            fontSize: '13px',
                            color: '#3B3B3B',
                            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                          }}
                        >
                          {status}
                        </span>
                        <span 
                          style={{ 
                            fontSize: '13px',
                            color: '#3B3B3B',
                            fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                          }}
                        >
                          , {classItem.time}
                        </span>
                        {classItem.lessonType && (
                          <span 
                            className="px-2 py-0.5 rounded text-xs"
                            style={{ 
                              backgroundColor: '#E0E0E0',
                              color: '#555555',
                              fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                            }}
                          >
                            {classItem.lessonType}
                          </span>
                        )}
                      </div>

                      {/* Expanded details */}
                      {isExpanded && (
                        <div className="mt-3 space-y-2 animate-in fade-in duration-200">
                          {classItem.auditory && (
                            <p 
                              style={{ 
                                fontSize: '13px',
                                color: '#999999',
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            >
                              Аудитория: <span style={{ color: '#3B3B3B' }}>{classItem.auditory}</span>
                            </p>
                          )}
                          {classItem.teacher && (
                            <p 
                              style={{ 
                                fontSize: '13px',
                                color: '#999999',
                                fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif'
                              }}
                            >
                              Преподаватель: <span style={{ color: '#3B3B3B' }}>{classItem.teacher}</span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Chevron icon */}
                    {isExpanded ? (
                      <ChevronDown className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1C1C1C' }} />
                    ) : (
                      <ChevronRight className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: '#1C1C1C' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
