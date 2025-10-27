/**
 * API Service для работы с backend расписания РУДН
 */

import axios from 'axios';

// Определяем URL backend в зависимости от окружения
const getBackendURL = () => {
  // Если запущено локально (localhost:3000), используем локальный backend
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:8001';
  }
  // В production используем текущий домен (чтобы избежать CORS)
  return window.location.origin;
};

const BACKEND_URL = getBackendURL();
const API_BASE = `${BACKEND_URL}/api`;

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Обработка ошибок
const handleError = (error) => {
  if (error.response) {
    // Сервер ответил с ошибкой
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.detail || error.response.data.error || 'Ошибка сервера');
  } else if (error.request) {
    // Запрос был отправлен, но ответа нет
    console.error('Network Error:', error.request);
    throw new Error('Ошибка сети. Проверьте подключение к интернету');
  } else {
    // Что-то пошло не так при настройке запроса
    console.error('Error:', error.message);
    throw new Error(error.message);
  }
};

/**
 * API методы для расписания
 */
export const scheduleAPI = {
  /**
   * Получить список факультетов
   */
  getFaculties: async () => {
    try {
      const response = await api.get('/faculties');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Получить данные фильтров (уровни, курсы, формы, группы)
   * @param {Object} params - Параметры фильтрации
   * @param {string} params.facultet_id - ID факультета
   * @param {string} [params.level_id] - ID уровня
   * @param {string} [params.kurs] - Курс
   * @param {string} [params.form_code] - Форма обучения
   */
  getFilterData: async (params) => {
    try {
      const response = await api.post('/filter-data', params);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Получить расписание для группы
   * @param {Object} params - Параметры запроса
   * @param {string} params.facultet_id - ID факультета
   * @param {string} params.level_id - ID уровня
   * @param {string} params.kurs - Курс
   * @param {string} params.form_code - Форма обучения
   * @param {string} params.group_id - ID группы
   * @param {number} [params.week_number=1] - Номер недели (1 или 2)
   */
  getSchedule: async (params) => {
    try {
      const response = await api.post('/schedule', params);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Получить кэшированное расписание
   * @param {string} groupId - ID группы
   * @param {number} weekNumber - Номер недели
   */
  getCachedSchedule: async (groupId, weekNumber) => {
    try {
      const response = await api.get(`/schedule-cached/${groupId}/${weekNumber}`);
      return response.data;
    } catch (error) {
      // Для кэша не бросаем ошибку, просто возвращаем null
      return null;
    }
  },
};

/**
 * API методы для пользовательских настроек
 */
export const userAPI = {
  /**
   * Получить настройки пользователя
   * @param {number} telegramId - Telegram ID пользователя
   */
  getUserSettings: async (telegramId) => {
    try {
      const response = await api.get(`/user-settings/${telegramId}`);
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        // Пользователь не найден - это нормально
        return null;
      }
      handleError(error);
    }
  },

  /**
   * Сохранить настройки пользователя
   * @param {Object} settings - Настройки пользователя
   * @param {number} settings.telegram_id - Telegram ID
   * @param {string} [settings.username] - Username
   * @param {string} [settings.first_name] - Имя
   * @param {string} [settings.last_name] - Фамилия
   * @param {string} settings.group_id - ID группы
   * @param {string} settings.group_name - Название группы
   * @param {string} settings.facultet_id - ID факультета
   * @param {string} [settings.facultet_name] - Название факультета
   * @param {string} settings.level_id - ID уровня
   * @param {string} settings.kurs - Курс
   * @param {string} settings.form_code - Форма обучения
   */
  saveUserSettings: async (settings) => {
    try {
      const response = await api.post('/user-settings', settings);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Удалить настройки пользователя
   * @param {number} telegramId - Telegram ID пользователя
   */
  deleteUserSettings: async (telegramId) => {
    try {
      const response = await api.delete(`/user-settings/${telegramId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Получить настройки уведомлений
   * @param {number} telegramId - Telegram ID пользователя
   */
  getNotificationSettings: async (telegramId) => {
    try {
      const response = await api.get(`/user-settings/${telegramId}/notifications`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  /**
   * Обновить настройки уведомлений
   * @param {number} telegramId - Telegram ID пользователя
   * @param {Object} settings - Настройки уведомлений
   * @param {boolean} settings.notifications_enabled - Включены ли уведомления
   * @param {number} settings.notification_time - За сколько минут уведомлять (5-30)
   */
  updateNotificationSettings: async (telegramId, settings) => {
    try {
      const response = await api.put(`/user-settings/${telegramId}/notifications`, settings);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },
};

export default api;
