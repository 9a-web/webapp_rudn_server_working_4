import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const ProfileModal = ({ 
  isOpen, 
  onClose, 
  user, 
  userSettings,
  profilePhoto,
  hapticFeedback 
}) => {
  const modalRef = useRef(null);

  // Закрытие при клике вне модального окна
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Закрытие при нажатии ESC
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!user) return null;

  // Формируем полное имя
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
  
  // Получаем username
  const username = user.username ? `@${user.username}` : '';

  // Получаем название группы
  const groupName = userSettings?.group_name || userSettings?.group_id || 'Группа не выбрана';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay с затемнением */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100]"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={onClose}
          />

          {/* Модальное окно профиля */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: {
                type: "spring",
                damping: 20,
                stiffness: 300
              }
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.9,
              y: -20,
              transition: { duration: 0.2 }
            }}
            className="fixed z-[101] flex flex-col items-center"
            style={{
              top: '70px',
              right: '24px',
              width: '280px',
              padding: '24px',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, #2D2D2D 0%, #1F1F2E 100%)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            {/* Аватар пользователя */}
            <div 
              className="relative mb-4"
              style={{
                width: '80px',
                height: '80px',
              }}
            >
              <div
                className="w-full h-full rounded-full overflow-hidden"
                style={{
                  border: '3px solid rgba(255, 255, 255, 0.1)',
                  background: 'linear-gradient(135deg, #3B3B3B, #2A2A2A)',
                }}
              >
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {user.first_name?.[0] || '👤'}
                  </div>
                )}
              </div>
            </div>

            {/* Имя пользователя с градиентом */}
            <h2 
              className="text-xl font-bold text-center mb-3 leading-tight px-2"
              style={{
                background: 'linear-gradient(90deg, #A3C4F3 0%, #FFB4D1 50%, #FFFFFF 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textShadow: '0 2px 10px rgba(163, 196, 243, 0.3)',
              }}
            >
              {fullName}
            </h2>

            {/* Username и группа */}
            <div className="flex items-center justify-center gap-2 w-full flex-wrap">
              {username && (
                <span
                  className="text-sm font-medium"
                  style={{ color: '#FFB4D1' }}
                >
                  {username}
                </span>
              )}
              
              {username && groupName && (
                <span style={{ color: '#666666' }}>•</span>
              )}

              <div
                className="px-3 py-1.5 rounded-lg text-sm font-medium"
                style={{
                  backgroundColor: '#3D3D3D',
                  color: '#FFFFFF',
                }}
              >
                {groupName}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
