# Changelog: Calendar-Week Synchronization Feature

## Дата: 25 октября 2025
## Версия: 1.2.0

---

## 🎯 Цель изменений

Реализована двусторонняя синхронизация между выбором даты в календаре и кнопками "Текущая неделя" / "Следующая неделя":

- При выборе даты в календаре автоматически активируется соответствующая кнопка недели
- При клике на кнопку недели обновляется выбранная дата (если она не в той неделе)
- Если дата выходит за пределы текущей и следующей недели, обе кнопки становятся неактивными

---

## 📝 Изменённые файлы

### 1. **Новый файл: `/app/frontend/src/utils/dateUtils.js`**

**Назначение**: Утилиты для работы с датами и неделями

**Основные функции**:
- `getCurrentWeekMonday()` - получение понедельника текущей недели
- `getCurrentWeekSunday()` - получение воскресенья текущей недели
- `getNextWeekMonday()` - получение понедельника следующей недели
- `getNextWeekSunday()` - получение воскресенья следующей недели
- `getWeekNumberForDate(date)` - определение номера недели для даты (1, 2 или null)
- `isDateInCurrentWeek(date)` - проверка, входит ли дата в текущую неделю
- `isDateInNextWeek(date)` - проверка, входит ли дата в следующую неделю
- `isDateInWeekRange(date)` - проверка, входит ли дата в диапазон текущей/следующей недели
- `formatWeekRange(weekNumber)` - форматирование диапазона дат недели

**Логика определения недели**:
- Неделя начинается с понедельника
- Текущая неделя (1): от понедельника до воскресенья текущей недели
- Следующая неделя (2): от понедельника до воскресенья следующей недели
- null: дата вне этих диапазонов

---

### 2. **Обновлён: `/app/frontend/src/App.js`**

**Изменения**:

1. Добавлен импорт:
```javascript
import { getWeekNumberForDate } from './utils/dateUtils';
```

2. Обновлена функция `handleDateSelect()`:
```javascript
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
```

3. Добавлена новая функция `handleWeekChange()`:
```javascript
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
      monday.setDate(monday.getDate() + 7);
    }
    
    setSelectedDate(monday);
    console.log('Week changed to:', newWeekNumber, 'Date updated to:', monday);
  }
};
```

4. Обновлен проп `onWeekChange`:
```javascript
<LiveScheduleSection 
  // ...
  onWeekChange={handleWeekChange}  // вместо setWeekNumber
  // ...
/>
```

---

### 3. **Обновлён: `/app/frontend/src/components/LiveScheduleSection.jsx`**

**Изменения**:

1. Добавлен импорт:
```javascript
import { getWeekNumberForDate } from '../utils/dateUtils';
```

2. Добавлена переменная для определения недели выбранной даты:
```javascript
// Определяем, к какой неделе относится выбранная дата
const selectedWeekNumber = getWeekNumberForDate(selectedDate);
```

3. Обновлена логика кнопок недель:
```javascript
{/* Week selector */}
{onWeekChange && (
  <div className="flex gap-2 mb-4">
    <button
      onClick={() => onWeekChange(1)}
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
      onClick={() => onWeekChange(2)}
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
```

**Ключевые изменения**:
- Активная кнопка определяется по `selectedWeekNumber` (неделя выбранной даты), а не по `weekNumber`
- Добавлен атрибут `disabled` когда `selectedWeekNumber === null`
- Обновлена визуальная обратная связь для неактивных кнопок (серый цвет, `cursor-not-allowed`)

---

## 🔄 Принцип работы

### Сценарий 1: Выбор даты в календаре
1. Пользователь открывает календарь и выбирает дату
2. Функция `handleDateSelect()` вызывается с выбранной датой
3. `getWeekNumberForDate()` определяет, к какой неделе относится дата:
   - Возвращает `1` - если дата в текущей неделе
   - Возвращает `2` - если дата в следующей неделе
   - Возвращает `null` - если дата вне диапазона
4. `setWeekNumber()` обновляет состояние недели
5. В `LiveScheduleSection` соответствующая кнопка становится активной (или обе неактивны)
6. Загружается расписание для выбранной даты и недели

### Сценарий 2: Клик на кнопку недели
1. Пользователь кликает на "Текущая неделя" или "Следующая неделя"
2. Функция `handleWeekChange()` вызывается с номером недели (1 или 2)
3. Проверяется, соответствует ли текущая выбранная дата этой неделе
4. Если нет - `selectedDate` обновляется на понедельник выбранной недели
5. Загружается расписание для новой недели

### Сценарий 3: Дата вне диапазона
1. Пользователь выбирает дату, которая не входит ни в текущую, ни в следующую неделю
2. `getWeekNumberForDate()` возвращает `null`
3. Обе кнопки недель становятся неактивными (disabled)
4. Визуально кнопки отображаются серым цветом с `cursor-not-allowed`
5. Пользователь не может кликнуть на неактивные кнопки

---

## ✅ Тестирование

### Модульные тесты (локально выполнены)
```bash
node /tmp/test_date_utils.js
```

**Результаты**:
- ✅ Сегодня (25.10.2025) правильно определяется как неделя 1
- ✅ Понедельник текущей недели (20.10.2025) - неделя 1
- ✅ Воскресенье текущей недели (26.10.2025) - неделя 1
- ✅ Понедельник следующей недели (27.10.2025) - неделя 2
- ✅ Воскресенье следующей недели (02.11.2025) - неделя 2
- ✅ Прошлая неделя - `null`
- ✅ Через 3 недели - `null`

### Компиляция
- ✅ ESLint: No issues found
- ✅ Frontend compiled successfully
- ✅ No runtime errors

---

## 🎨 UI/UX Изменения

### Визуальная обратная связь:

**Активная кнопка** (дата в этой неделе):
- Фон: `bg-black` (черный)
- Текст: `text-white` (белый)
- Состояние: enabled

**Неактивная кнопка** (дата в другой неделе, но в диапазоне):
- Фон: `bg-gray-100` (светло-серый)
- Текст: `text-gray-600` (серый)
- Hover: `hover:bg-gray-200`
- Состояние: enabled

**Заблокированная кнопка** (дата вне диапазона):
- Фон: `bg-gray-200` (серый)
- Текст: `text-gray-400` (бледно-серый)
- Курсор: `cursor-not-allowed`
- Состояние: disabled
- Hover: отсутствует

---

## 🔧 Технические детали

### Определение недели
Неделя считается с понедельника по воскресенье (ISO 8601 стандарт).

**Алгоритм**:
1. Получаем текущую дату
2. Вычисляем смещение до понедельника (0 для воскресенья = -6 дней, 1 для понедельника = 0 дней, и т.д.)
3. Получаем понедельник текущей недели
4. Воскресенье = понедельник + 6 дней
5. Следующая неделя = текущая неделя + 7 дней

### Обработка крайних случаев
- ✅ Воскресенье корректно обрабатывается (getDay() = 0)
- ✅ Переход между месяцами
- ✅ Переход через Новый год
- ✅ Високосные годы (обрабатываются встроенным JavaScript Date)

---

## 📦 Зависимости

Новых зависимостей не добавлено. Используется только встроенный JavaScript `Date` API.

---

## 🚀 Развертывание

Изменения применяются автоматически при hot-reload frontend приложения.

**Проверка статуса**:
```bash
sudo supervisorctl status frontend
# Должно быть: RUNNING
```

**Просмотр логов**:
```bash
tail -f /var/log/supervisor/frontend.out.log
# Ожидается: "Compiled successfully!"
```

---

## 📖 Документация API

### `dateUtils.js` API

#### `getWeekNumberForDate(date: Date): number | null`
Определяет номер недели для указанной даты.

**Параметры**:
- `date` (Date): Проверяемая дата

**Возвращает**:
- `1`: Дата в текущей неделе (понедельник-воскресенье)
- `2`: Дата в следующей неделе (понедельник-воскресенье)
- `null`: Дата вне диапазона текущей и следующей недели

**Пример**:
```javascript
import { getWeekNumberForDate } from './utils/dateUtils';

const today = new Date();
const weekNum = getWeekNumberForDate(today);
// weekNum = 1 (если сегодня в текущей неделе)
```

---

## 🐛 Известные ограничения

1. Поддерживаются только текущая и следующая недели
2. Даты за пределами этих недель блокируют кнопки недель
3. Изменение недели через кнопку всегда устанавливает дату на понедельник выбранной недели

---

## 💡 Будущие улучшения

Возможные расширения функционала:
- [ ] Поддержка произвольного количества недель вперед/назад
- [ ] Сохранение последней выбранной даты в localStorage
- [ ] Анимации при переключении недель
- [ ] Подсветка диапазона текущей/следующей недели в календаре
- [ ] Быстрый переход на "Сегодня"

---

## ✍️ Автор

Emergent AI Agent (Main)
Дата: 25 октября 2025

---

## 📊 Статус

✅ **Completed and Tested**
- Все файлы созданы/обновлены
- ESLint проверки пройдены
- Frontend успешно скомпилирован
- Логика протестирована
- Документация обновлена
