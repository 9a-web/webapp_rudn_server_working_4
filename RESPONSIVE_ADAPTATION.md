# Адаптация RUDN Schedule под Desktop и Tablet

## 📱 Адаптивные Breakpoints

Приложение теперь поддерживает три режима отображения:

### Mobile (< 768px)
- **Дизайн**: Одна колонка, вертикальная прокрутка
- **LiveScheduleCarousel**: Карусель с переключением между расписанием, погодой и достижениями
- **Расписание**: Карточки в одну колонку
- **WeekDaySelector**: Горизонтальная прокрутка для дней недели

### Tablet (768px - 1279px) 
- **Дизайн**: Двухколоночный layout
- **Левая колонка**: Основной контент (расписание, календарь, селектор дней)
- **Правая колонка**: Desktop Sidebar (погода, достижения, быстрые действия)
- **LiveScheduleCarousel**: Статичная LiveScheduleCard (без карусели)
- **Расписание**: Карточки в одну колонку в каждой колонке
- **WeekDaySelector**: Все дни видны без прокрутки

### Desktop (≥ 1280px)
- **Дизайн**: Двухколоночный layout с фиксированным sidebar
- **Левая колонка**: Основной контент (расписание)
- **Правая колонка**: Desktop Sidebar (380px фиксированная ширина)
- **Расписание**: Grid 2 колонки для карточек занятий
- **Максимальная ширина**: 1920px (Full HD)

## 🎨 Новые Компоненты

### DesktopSidebar.jsx
Правый сайдбар для tablet и desktop:
- **Погодный виджет**: Постоянно видимый (как запрошено)
- **Мини-панель достижений**: Прогресс, очки, последние достижения
- **Быстрые действия**: Кнопки для аналитики и календаря

## 📐 Изменённые Компоненты

### App.js
- Обновлена структура layout с адаптивной grid системой
- Добавлен DesktopSidebar в правую колонку
- Максимальная ширина контейнера увеличена до 1920px

### LiveScheduleCarousel.jsx
- **Mobile**: Карусель с навигацией
- **Tablet/Desktop**: Статичная LiveScheduleCard без переключения

### LiveScheduleSection.jsx
- Адаптивные paddings для разных экранов
- Grid layout для карточек: 1 колонка (mobile), 2 колонки (desktop)
- Увеличенные размеры заголовков на больших экранах

### WeekDaySelector.jsx
- Адаптивные отступы
- На desktop все 7 дней недели видны без прокрутки
- Увеличенные gaps между кнопками

### Header.jsx
- Адаптивные размеры логотипа и текста
- Увеличенные кнопки на tablet/desktop

### MenuModal.jsx
- **Скрыта функция смены языка** (по запросу пользователя)
- Меню теперь содержит только: Достижения и Аналитика

## 🎯 Tailwind Configuration

Добавлены новые breakpoints и max-width в `tailwind.config.js`:
```js
screens: {
  '2xl': '1920px',
},
maxWidth: {
  '8xl': '1920px',
}
```

## 📊 Responsive Grid Система

### Main Container
```
Mobile:    max-w-[430px]
Tablet:    max-w-3xl (768px)
Desktop:   max-w-7xl (1280px)
2XL:       max-w-8xl (1920px)
```

### Layout Grid
```
Mobile:    grid-cols-1
Tablet:    grid-cols-2 (equal width)
Desktop:   grid-cols-[1fr_380px] (main + fixed sidebar)
```

### Schedule Cards Grid
```
Mobile:    grid-cols-1
Desktop:   grid-cols-2
```

## 🔄 Адаптивные Особенности

1. **Sticky Sidebar**: На desktop sidebar закреплен и прокручивается вместе с контентом
2. **Adaptive Padding**: Увеличенные отступы на больших экранах для лучшей читаемости
3. **Responsive Typography**: Размеры шрифтов адаптируются под экран
4. **Flexible Gaps**: Отступы между элементами увеличиваются на больших экранах

## 🌐 Локализация

Добавлены новые переводы для sidebar в `ru.json` и `en.json`:
- achievements.title
- achievements.totalPoints
- achievements.progress
- achievements.viewAll
- achievements.recent
- achievements.points
- sidebar.quickActions

## ✅ Тестирование

Рекомендуется протестировать на следующих разрешениях:
- **Mobile**: 430px (iPhone), 375px (iPhone SE)
- **Tablet**: 768px (iPad Portrait), 1024px (iPad Landscape)
- **Desktop**: 1280px, 1440px, 1920px (Full HD)

## 📝 Примечания

- Все изменения обратно совместимы с mobile версией
- Hot reload работает корректно
- Компиляция прошла без ошибок
- Функция смены языка закомментирована в MenuModal (легко восстановить при необходимости)
