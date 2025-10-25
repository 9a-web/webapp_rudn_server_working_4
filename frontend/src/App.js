import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { Header } from './components/Header';
import { LiveScheduleCard } from './components/LiveScheduleCard';
import { CalendarModal } from './components/CalendarModal';
import { WeekDaySelector } from './components/WeekDaySelector';
import { TopGlow } from './components/TopGlow';
import { LiveScheduleSection } from './components/LiveScheduleSection';
import GroupSelector from './components/GroupSelector';
import { TelegramProvider, useTelegram } from './contexts/TelegramContext';
import { scheduleAPI, userAPI } from './services/api';
import { getWeekNumberForDate } from './utils/dateUtils';
import { useTranslation } from 'react-i18next';
import './i18n/config';

const Home = () => {
  const { user, isReady, showAlert, hapticFeedback } = useTelegram();
  const { t } = useTranslation();
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentClass, setCurrentClass] = useState(null);
  const [minutesLeft, setMinutesLeft] = useState(0);
  
  // Состояния для расписания
  const [schedule, setSchedule] = useState([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Состояния для пользователя
  const [userSettings, setUserSettings] = useState(null);
  const [showGroupSelector, setShowGroupSelector] = useState(false);

  // Загрузка данных пользователя при монтировании
  useEffect(() => {
    if (isReady && user) {
      loadUserData();
    }
  }, [isReady, user]);

  // Загрузка расписания при изменении настроек или недели
  useEffect(() => {
    if (userSettings) {
      loadSchedule();
    }
  }, [userSettings, weekNumber]);

  // Обновление текущей пары
  useEffect(() => {
    if (schedule.length > 0) {
      updateCurrentClass();
      const interval = setInterval(updateCurrentClass, 60000);
      return () => clearInterval(interval);
    }
  }, [schedule]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const settings = await userAPI.getUserSettings(user.id);
      
      if (settings) {
        setUserSettings(settings);
      } else {
        setShowGroupSelector(true);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const scheduleData = await scheduleAPI.getSchedule({
        facultet_id: userSettings.facultet_id,
        level_id: userSettings.level_id,
        kurs: userSettings.kurs,
        form_code: userSettings.form_code,
        group_id: userSettings.group_id,
        week_number: weekNumber,
      });
      
      setSchedule(scheduleData.events || []);
      hapticFeedback('notification', 'success');
    } catch (err) {
      console.error('Error loading schedule:', err);
      setError(err.message);
      showAlert(t('common.scheduleError', { message: err.message }));
    } finally {
      setLoading(false);
    }
  };

  const updateCurrentClass = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('ru-RU', { weekday: 'long' });
    const dayName = currentDay.charAt(0).toUpperCase() + currentDay.slice(1);
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const todayClasses = schedule.filter(event => event.day === dayName);

    for (const classItem of todayClasses) {
      const timeRange = classItem.time.split('-');
      if (timeRange.length !== 2) continue;
      
      const [startHour, startMin] = timeRange[0].trim().split(':').map(Number);
      const [endHour, endMin] = timeRange[1].trim().split(':').map(Number);
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      if (currentTime >= startTime && currentTime < endTime) {
        setCurrentClass(classItem.discipline);
        setMinutesLeft(endTime - currentTime);
        return;
      }
    }

    setCurrentClass(null);
    setMinutesLeft(0);
  };

  const handleGroupSelected = async (groupData) => {
    try {
      hapticFeedback('impact', 'medium');
      
      const settings = await userAPI.saveUserSettings({
        telegram_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        ...groupData,
      });
      
      setUserSettings(settings);
      setShowGroupSelector(false);
      showAlert(t('common.groupSelected', { groupName: groupData.group_name }));
    } catch (err) {
      console.error('Error saving user settings:', err);
      showAlert(t('common.settingsError', { message: err.message }));
    }
  };

  const handleCalendarClick = () => {
    hapticFeedback('impact', 'light');
    setIsCalendarOpen(true);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // Автоматически определяем и устанавливаем номер недели
    const weekNum = getWeekNumberForDate(date);
    if (weekNum !== null) {
      setWeekNumber(weekNum);
      console.log('Selected date:', date, 'Week number:', weekNum);
    } else {
      console.log('Selected date:', date, 'is outside current/next week range');
    }
  };

  const handleWeekChange = (newWeekNumber) => {
    setWeekNumber(newWeekNumber);
    
    // Если выбранная дата не входит в новую неделю, обновляем дату на первый день новой недели
    const currentWeekNum = getWeekNumberForDate(selectedDate);
    if (currentWeekNum !== newWeekNumber) {
      const today = new Date();
      const day = today.getDay();
      const diff = day === 0 ? -6 : 1 - day;
      const monday = new Date(today);
      monday.setDate(today.getDate() + diff);
      
      if (newWeekNumber === 2) {
        // Следующая неделя - добавляем 7 дней
        monday.setDate(monday.getDate() + 7);
      }
      
      setSelectedDate(monday);
      console.log('Week changed to:', newWeekNumber, 'Date updated to:', monday);
    }
  };


  const handleChangeGroup = () => {
    hapticFeedback('impact', 'medium');
    setShowGroupSelector(true);
  };

  // Показываем GroupSelector
  if (showGroupSelector) {
    return (
      <GroupSelector
        onGroupSelected={handleGroupSelected}
        onCancel={userSettings ? () => setShowGroupSelector(false) : null}
      />
    );
  }

  // Показываем экран загрузки
  if (loading && !userSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/70">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Показываем ошибку
  if (error && !userSettings) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={loadUserData}
            className="bg-white text-black px-6 py-3 rounded-full font-medium"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background telegram-webapp relative">
      <TopGlow />
      
      {/* Adaptive container with max-width for desktop */}
      <div className="relative mx-auto max-w-[430px] md:max-w-2xl lg:max-w-4xl" style={{ zIndex: 10 }}>
        <Header onCalendarClick={handleCalendarClick} />
        
        <LiveScheduleCard 
          currentClass={currentClass} 
          minutesLeft={minutesLeft} 
        />
      
        <WeekDaySelector 
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          weekNumber={weekNumber}
          hapticFeedback={hapticFeedback}
        />
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <LiveScheduleSection 
            selectedDate={selectedDate}
            mockSchedule={schedule}
            weekNumber={weekNumber}
            onWeekChange={handleWeekChange}
            groupName={userSettings?.group_name}
            onChangeGroup={handleChangeGroup}
            hapticFeedback={hapticFeedback}
          />
        )}
        
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          onDateSelect={handleDateSelect}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <TelegramProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </BrowserRouter>
      </TelegramProvider>
    </div>
  );
}

export default App;
