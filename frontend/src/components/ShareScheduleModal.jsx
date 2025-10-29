import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Copy, Check, MessageCircle, Image as ImageIcon, X } from 'lucide-react';

/**
 * Компонент для шаринга расписания
 */
export const ShareScheduleModal = ({ 
  isOpen, 
  onClose, 
  schedule, 
  selectedDate,
  groupName,
  hapticFeedback 
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Форматирование даты
  const formatDate = (date) => {
    return date.toLocaleDateString('ru-RU', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  // Генерация текста расписания
  const generateScheduleText = () => {
    const dateStr = formatDate(selectedDate);
    const dayName = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
    const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    const todaySchedule = schedule.filter(item => item.day === formattedDayName);

    if (todaySchedule.length === 0) {
      return `📅 Расписание на ${dateStr}\n${groupName ? `Группа: ${groupName}\n` : ''}\n✨ Пар нет! Свободный день! 🎉`;
    }

    let text = `📅 Расписание на ${dateStr}\n`;
    if (groupName) {
      text += `👥 Группа: ${groupName}\n`;
    }
    text += `\n`;

    todaySchedule.forEach((classItem, index) => {
      text += `${index + 1}. ${classItem.discipline}\n`;
      text += `   ⏰ ${classItem.time}\n`;
      if (classItem.auditory) {
        text += `   📍 ${classItem.auditory}\n`;
      }
      if (classItem.teacher) {
        text += `   👨‍🏫 ${classItem.teacher}\n`;
      }
      text += `\n`;
    });

    text += `\n📱 RUDN Schedule – Telegram WebApp`;
    
    return text;
  };

  // Генерация красивого текста для Telegram
  const generateTelegramText = () => {
    const dateStr = formatDate(selectedDate);
    const dayName = selectedDate.toLocaleDateString('ru-RU', { weekday: 'long' });
    const formattedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    const todaySchedule = schedule.filter(item => item.day === formattedDayName);

    if (todaySchedule.length === 0) {
      return `📅 *Расписание на ${dateStr}*\n${groupName ? `Группа: _${groupName}_\n` : ''}\n✨ Пар нет! Свободный день! 🎉`;
    }

    let text = `📅 *Расписание на ${dateStr}*\n`;
    if (groupName) {
      text += `👥 Группа: _${groupName}_\n`;
    }
    text += `\n`;

    todaySchedule.forEach((classItem, index) => {
      text += `*${index + 1}. ${classItem.discipline}*\n`;
      text += `⏰ \`${classItem.time}\`\n`;
      if (classItem.auditory) {
        text += `📍 ${classItem.auditory}\n`;
      }
      if (classItem.teacher) {
        text += `👨‍🏫 ${classItem.teacher}\n`;
      }
      text += `\n`;
    });

    text += `📱 _RUDN Schedule – Telegram WebApp_`;
    
    return text;
  };

  // Копирование в буфер обмена
  const handleCopyToClipboard = async () => {
    try {
      const text = generateScheduleText();
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (hapticFeedback) hapticFeedback('notification', 'success');
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Шаринг через Telegram Web App API
  const handleShareToTelegram = () => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    
    const text = generateTelegramText();
    
    // Проверяем доступность Telegram Web App API
    if (window.Telegram?.WebApp) {
      // Используем Telegram.WebApp.switchInlineQuery для шаринга
      // Или открываем диалог выбора чата
      const encodedText = encodeURIComponent(text);
      const url = `https://t.me/share/url?url=${encodedText}`;
      window.open(url, '_blank');
    } else {
      // Fallback: копируем в буфер
      handleCopyToClipboard();
    }
  };

  // Шаринг как изображение (screenshot)
  const handleShareAsImage = () => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    // TODO: Implement screenshot functionality
    alert('Функция скриншота в разработке! 📸');
  };

  // Создание приглашения в группу
  const handleInviteFriends = () => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    
    const inviteText = `🎓 Привет! Я использую RUDN Schedule для просмотра расписания.\n\nПрисоединяйся! 👇\n\n📱 RUDN Schedule – Telegram WebApp`;
    const encodedText = encodeURIComponent(inviteText);
    const url = `https://t.me/share/url?url=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[160] w-[90%] max-w-md"
          >
            <div className="bg-white rounded-3xl p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Поделиться расписанием
                </h2>
                <button
                  onClick={() => {
                    if (hapticFeedback) hapticFeedback('impact', 'light');
                    onClose();
                  }}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <p className="text-sm text-gray-600 text-center">
                  📅 {formatDate(selectedDate)}
                </p>
                {groupName && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    Группа: {groupName}
                  </p>
                )}
              </div>

              {/* Share Options */}
              <div className="space-y-3">
                {/* Поделиться в Telegram */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareToTelegram}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Отправить в чат</p>
                    <p className="text-xs text-white/80">Поделиться через Telegram</p>
                  </div>
                  <Share2 className="w-5 h-5" />
                </motion.button>

                {/* Копировать текст */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCopyToClipboard}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20">
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">
                      {copied ? 'Скопировано!' : 'Копировать текст'}
                    </p>
                    <p className="text-xs text-white/80">
                      {copied ? 'Текст в буфере обмена' : 'Скопировать расписание'}
                    </p>
                  </div>
                </motion.button>

                {/* Поделиться как изображение */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleShareAsImage}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-green-500 to-teal-500 text-white hover:shadow-lg transition-shadow"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Сохранить как картинку</p>
                    <p className="text-xs text-white/80">Скриншот расписания</p>
                  </div>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Скоро</span>
                </motion.button>

                {/* Пригласить друзей */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleInviteFriends}
                  className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                >
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-white">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-semibold">Пригласить друзей</p>
                    <p className="text-xs text-gray-500">Рассказать о приложении</p>
                  </div>
                </motion.button>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl max-h-48 overflow-y-auto">
                <p className="text-xs text-gray-500 mb-2">Предпросмотр:</p>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                  {generateScheduleText()}
                </pre>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
