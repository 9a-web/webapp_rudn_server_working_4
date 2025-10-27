"""
Планировщик задач для отправки уведомлений о парах
"""

import logging
from datetime import datetime, timedelta
from typing import List, Dict
import pytz
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from motor.motor_asyncio import AsyncIOMotorDatabase
from notifications import get_notification_service

logger = logging.getLogger(__name__)

# Московское время
MOSCOW_TZ = pytz.timezone('Europe/Moscow')


class NotificationScheduler:
    """Планировщик для проверки и отправки уведомлений"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Инициализация планировщика
        
        Args:
            db: База данных MongoDB
        """
        self.db = db
        self.scheduler = AsyncIOScheduler()
        self.notification_service = get_notification_service()
    
    def start(self):
        """Запустить планировщик"""
        # Проверяем уведомления каждую минуту
        self.scheduler.add_job(
            self.check_and_send_notifications,
            trigger=IntervalTrigger(minutes=1),
            id='check_notifications',
            name='Check and send class notifications',
            replace_existing=True
        )
        
        # Очищаем старые записи уведомлений раз в час
        self.scheduler.add_job(
            self.cleanup_old_notifications,
            trigger=IntervalTrigger(hours=1),
            id='cleanup_notifications',
            name='Cleanup old notification records',
            replace_existing=True
        )
        
        self.scheduler.start()
        logger.info("Notification scheduler started")
    
    def stop(self):
        """Остановить планировщик"""
        self.scheduler.shutdown()
        logger.info("Notification scheduler stopped")
    
    async def check_and_send_notifications(self):
        """
        Проверить и отправить уведомления о предстоящих парах
        """
        try:
            # Получаем текущее время в московской зоне
            now = datetime.now(MOSCOW_TZ)
            current_day = now.strftime('%A')  # Название дня недели
            
            logger.debug(f"Checking for upcoming classes at {now.strftime('%Y-%m-%d %H:%M:%S %Z')}")
            
            # Переводим день недели на русский
            day_mapping = {
                'Monday': 'Понедельник',
                'Tuesday': 'Вторник',
                'Wednesday': 'Среда',
                'Thursday': 'Четверг',
                'Friday': 'Пятница',
                'Saturday': 'Суббота',
                'Sunday': 'Воскресенье'
            }
            russian_day = day_mapping.get(current_day, current_day)
            
            # Определяем номер недели (1 или 2)
            week_number = self._get_week_number(now)
            
            # Получаем всех пользователей с включенными уведомлениями
            users = await self.db.user_settings.find({
                "notifications_enabled": True,
                "group_id": {"$exists": True, "$ne": None}
            }).to_list(None)
            
            logger.debug(f"Found {len(users)} users with notifications enabled")
            
            # Проверяем каждого пользователя
            for user in users:
                await self._check_user_classes(
                    user,
                    russian_day,
                    week_number,
                    now
                )
        
        except Exception as e:
            logger.error(f"Error in notification scheduler: {e}", exc_info=True)
    
    async def _check_user_classes(
        self,
        user: Dict,
        day: str,
        week_number: int,
        current_time,
        now: datetime
    ):
        """
        Проверить пары конкретного пользователя
        
        Args:
            user: Данные пользователя
            day: День недели (на русском)
            week_number: Номер недели (1 или 2)
            current_time: Текущее время
            now: Текущая дата и время
        """
        try:
            telegram_id = user['telegram_id']
            notification_time = user.get('notification_time', 10)
            
            # Получаем расписание пользователя из кэша
            cached_schedule = await self.db.schedule_cache.find_one({
                "group_id": user['group_id'],
                "week_number": week_number,
                "expires_at": {"$gt": now}
            })
            
            if not cached_schedule:
                logger.debug(f"No cached schedule for user {telegram_id}")
                return
            
            events = cached_schedule.get('events', [])
            
            # Фильтруем пары на сегодня
            today_classes = [e for e in events if e.get('day') == day]
            
            # Проверяем каждую пару
            for class_event in today_classes:
                await self._check_and_notify(
                    telegram_id,
                    class_event,
                    notification_time,
                    current_time,
                    now
                )
        
        except Exception as e:
            logger.error(f"Error checking classes for user {user.get('telegram_id')}: {e}")
    
    async def _check_and_notify(
        self,
        telegram_id: int,
        class_event: Dict,
        notification_time: int,
        current_time,
        now: datetime
    ):
        """
        Проверить и отправить уведомление о конкретной паре
        
        Args:
            telegram_id: ID пользователя в Telegram
            class_event: Событие (пара)
            notification_time: За сколько минут уведомлять
            current_time: Текущее время
            now: Текущая дата и время
        """
        try:
            # Парсим время начала пары
            time_str = class_event.get('time', '')
            if not time_str or '-' not in time_str:
                return
            
            start_time_str = time_str.split('-')[0].strip()
            start_hour, start_minute = map(int, start_time_str.split(':'))
            
            # Вычисляем время уведомления
            class_start_time = now.replace(hour=start_hour, minute=start_minute, second=0, microsecond=0)
            notification_datetime = class_start_time - timedelta(minutes=notification_time)
            
            # Проверяем, нужно ли отправлять уведомление
            # Отправляем если текущее время в диапазоне [notification_time, notification_time + 1 минута]
            time_diff = (now - notification_datetime).total_seconds()
            
            if 0 <= time_diff <= 60:
                # Проверяем, не отправляли ли уже уведомление
                notification_key = f"{telegram_id}_{class_event.get('discipline')}_{time_str}_{now.strftime('%Y-%m-%d')}"
                
                sent_notification = await self.db.sent_notifications.find_one({
                    "notification_key": notification_key
                })
                
                if sent_notification:
                    logger.debug(f"Notification already sent: {notification_key}")
                    return
                
                # Отправляем уведомление
                success = await self.notification_service.send_class_notification(
                    telegram_id=telegram_id,
                    class_info=class_event,
                    minutes_before=notification_time
                )
                
                if success:
                    # Сохраняем информацию об отправленном уведомлении
                    await self.db.sent_notifications.insert_one({
                        "notification_key": notification_key,
                        "telegram_id": telegram_id,
                        "class_discipline": class_event.get('discipline'),
                        "class_time": time_str,
                        "sent_at": now,
                        "expires_at": now + timedelta(days=1)
                    })
                    
                    logger.info(f"Notification sent to {telegram_id} for {class_event.get('discipline')}")
        
        except Exception as e:
            logger.error(f"Error notifying about class: {e}")
    
    def _get_week_number(self, date: datetime) -> int:
        """
        Определить номер недели (1 или 2) для даты
        
        Args:
            date: Дата для проверки
            
        Returns:
            1 для текущей недели, 2 для следующей
        """
        # Получаем понедельник текущей недели
        day_of_week = date.weekday()  # 0 = понедельник
        monday = date - timedelta(days=day_of_week)
        monday = monday.replace(hour=0, minute=0, second=0, microsecond=0)
        
        # Получаем воскресенье текущей недели
        sunday = monday + timedelta(days=6)
        sunday = sunday.replace(hour=23, minute=59, second=59)
        
        # Проверяем, входит ли дата в текущую неделю
        if monday <= date <= sunday:
            return 1
        
        # Проверяем следующую неделю
        next_monday = monday + timedelta(days=7)
        next_sunday = sunday + timedelta(days=7)
        
        if next_monday <= date <= next_sunday:
            return 2
        
        # По умолчанию текущая неделя
        return 1


# Глобальный экземпляр планировщика
scheduler_instance = None


def get_scheduler(db: AsyncIOMotorDatabase) -> NotificationScheduler:
    """Получить глобальный экземпляр планировщика"""
    global scheduler_instance
    
    if scheduler_instance is None:
        scheduler_instance = NotificationScheduler(db)
    
    return scheduler_instance
