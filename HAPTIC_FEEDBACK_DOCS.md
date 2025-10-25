# Haptic Feedback Implementation

## Дата: 25 октября 2025

---

## 🎯 Обзор

Добавлена тактильная обратная связь (haptic feedback) для всех интерактивных элементов приложения, используя Telegram WebApp API.

---

## 📱 Типы вибрации

### 1. **Impact Feedback** - физическое воздействие
- `light` - лёгкое касание (используется для выбора дня)
- `medium` - среднее воздействие (используется для кнопок недель и смены группы)
- `heavy` - сильное воздействие (не используется в текущей версии)

### 2. **Notification Feedback** - уведомления
- `success` - используется при успешной загрузке расписания
- `warning` - для предупреждений (не используется в текущей версии)
- `error` - для ошибок (не используется в текущей версии)

### 3. **Selection Feedback** - изменение выбора
- Используется при развертывании/сворачивании карточек расписания

---

## 🔧 Реализация

### Обновленные компоненты:

#### 1. **LiveScheduleSection.jsx**

**Добавленный проп**:
```javascript
export const LiveScheduleSection = ({ 
  // ... другие пропсы
  hapticFeedback 
}) => {
```

**Кнопки недель** - `medium` impact:
```javascript
<button
  onClick={() => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    onWeekChange(1);
  }}
>
  Текущая неделя
</button>
```

**Кнопка смены группы** - `medium` impact:
```javascript
<button
  onClick={() => {
    if (hapticFeedback) hapticFeedback('impact', 'medium');
    onChangeGroup();
  }}
>
  Сменить группу
</button>
```

**Развертывание карточек** - `selection` feedback:
```javascript
const toggleExpand = (index) => {
  if (hapticFeedback) hapticFeedback('selection');
  setExpandedIndex(expandedIndex === index ? null : index);
};
```

---

#### 2. **WeekDaySelector.jsx**

**Добавленный проп**:
```javascript
export const WeekDaySelector = ({ 
  selectedDate, 
  onDateSelect, 
  weekNumber = 1, 
  hapticFeedback 
}) => {
```

**Выбор дня** - `light` impact:
```javascript
const handleDayClick = (index, day) => {
  if (hapticFeedback) hapticFeedback('impact', 'light');
  setSelectedIndex(index);
  if (onDateSelect) {
    onDateSelect(day.fullDate);
  }
};
```

---

#### 3. **App.js**

**Передача hapticFeedback в дочерние компоненты**:
```javascript
const { user, isReady, showAlert, hapticFeedback } = useTelegram();

// ...

<WeekDaySelector 
  selectedDate={selectedDate}
  onDateSelect={handleDateSelect}
  weekNumber={weekNumber}
  hapticFeedback={hapticFeedback}
/>

<LiveScheduleSection 
  selectedDate={selectedDate}
  mockSchedule={schedule}
  weekNumber={weekNumber}
  onWeekChange={handleWeekChange}
  groupName={userSettings?.group_name}
  onChangeGroup={handleChangeGroup}
  hapticFeedback={hapticFeedback}
/>
```

---

## 🎨 Карта вибраций

| Действие | Тип вибрации | Интенсивность | Компонент |
|----------|--------------|---------------|-----------|
| Выбор дня недели | impact | light | WeekDaySelector |
| Клик "Текущая неделя" | impact | medium | LiveScheduleSection |
| Клик "Следующая неделя" | impact | medium | LiveScheduleSection |
| Клик "Сменить группу" | impact | medium | LiveScheduleSection |
| Развернуть/свернуть карточку | selection | - | LiveScheduleSection |
| Открытие календаря | impact | light | App.js |
| Смена группы (сохранение) | impact | medium | App.js |
| Загрузка расписания | notification | success | App.js |

---

## 🔍 Принцип работы

### TelegramContext
Функция `hapticFeedback` определена в `/app/frontend/src/contexts/TelegramContext.js`:

```javascript
const hapticFeedback = (type = 'impact', style = 'medium') => {
  if (webApp?.HapticFeedback) {
    if (type === 'impact') {
      webApp.HapticFeedback.impactOccurred(style);
    } else if (type === 'notification') {
      webApp.HapticFeedback.notificationOccurred(style);
    } else if (type === 'selection') {
      webApp.HapticFeedback.selectionChanged();
    }
  }
};
```

### Безопасность
Все вызовы проверяют наличие функции перед использованием:
```javascript
if (hapticFeedback) hapticFeedback('impact', 'medium');
```

Это гарантирует работу приложения даже:
- В браузере (вне Telegram)
- На старых версиях Telegram
- На устройствах без поддержки вибрации

---

## ✅ Преимущества

1. **Улучшенная обратная связь** - пользователь чувствует отклик на каждое действие
2. **Нативный опыт** - ощущения как в нативном приложении
3. **Интуитивность** - разные типы вибрации для разных действий
4. **Доступность** - помогает пользователям с ограниченными возможностями
5. **Совместимость** - работает только там, где поддерживается

---

## 🧪 Тестирование

### В Telegram
1. Откройте приложение в Telegram Mini App
2. Убедитесь, что вибрация включена в настройках устройства
3. Нажмите на различные кнопки и элементы
4. Почувствуйте разные типы вибрации для разных действий

### Вне Telegram
1. Откройте приложение в браузере
2. Функционал работает без ошибок (вибрация просто не срабатывает)
3. Никаких консольных ошибок

---

## 📊 Статус

✅ **Implemented and Tested**
- Все компоненты обновлены
- ESLint проверки пройдены
- Frontend успешно скомпилирован
- Backward compatibility обеспечена
- Graceful degradation реализована

---

## 🔮 Будущие улучшения

Возможные дополнения:
- [ ] Настройка интенсивности вибрации в профиле пользователя
- [ ] Возможность отключения вибрации
- [ ] Пользовательские паттерны вибрации
- [ ] Вибрация при долгом нажатии (long press)
- [ ] Вибрация при свайпах

---

## 📝 Заметки для разработчиков

### Добавление новой вибрации
1. Получите `hapticFeedback` из контекста или пропсов
2. Вызовите в обработчике события:
   ```javascript
   if (hapticFeedback) hapticFeedback('impact', 'medium');
   ```
3. Выберите подходящий тип и интенсивность из таблицы выше

### Выбор типа вибрации
- **Кнопки/действия** → `impact` (light/medium/heavy)
- **Результаты операций** → `notification` (success/warning/error)
- **Изменение выбора** → `selection` (без параметров)

---

Дата обновления: 25 октября 2025
Автор: Emergent AI Agent (Main)
