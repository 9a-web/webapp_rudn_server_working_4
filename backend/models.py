"""
Pydantic модели для API расписания РУДН
"""

from pydantic import BaseModel, Field, field_validator
from typing import List, Optional, Union
from datetime import datetime
import uuid


# ============ Модели для парсера расписания ============

class Faculty(BaseModel):
    """Модель факультета"""
    id: str
    name: str


class FilterOption(BaseModel):
    """Модель опции фильтра (уровень, курс, форма, группа)"""
    value: str
    label: Optional[str] = None
    name: Optional[str] = None
    disabled: bool = False
    
    @field_validator('value', mode='before')
    @classmethod
    def convert_value_to_string(cls, v: Union[str, int]) -> str:
        """Convert integer values to strings"""
        return str(v)


class FilterDataRequest(BaseModel):
    """Запрос данных фильтра"""
    facultet_id: str
    level_id: Optional[str] = ""
    kurs: Optional[str] = ""
    form_code: Optional[str] = ""


class FilterDataResponse(BaseModel):
    """Ответ с данными фильтров"""
    levels: List[FilterOption] = []
    courses: List[FilterOption] = []
    forms: List[FilterOption] = []
    groups: List[FilterOption] = []


class ScheduleRequest(BaseModel):
    """Запрос расписания"""
    facultet_id: str
    level_id: str
    kurs: str
    form_code: str
    group_id: str
    week_number: int = Field(default=1, ge=1, le=2)


class ScheduleEvent(BaseModel):
    """Событие расписания (одна пара)"""
    day: str
    time: str
    discipline: str
    lessonType: str = ""
    teacher: str = ""
    auditory: str = ""
    week: int


class ScheduleResponse(BaseModel):
    """Ответ с расписанием"""
    events: List[ScheduleEvent]
    group_id: str
    week_number: int


# ============ Модели для пользовательских настроек ============

class UserSettings(BaseModel):
    """Настройки пользователя (сохраненная группа)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    # Данные группы
    group_id: str
    group_name: str
    facultet_id: str
    facultet_name: Optional[str] = None
    level_id: str
    kurs: str
    form_code: str
    
    # Настройки уведомлений
    notifications_enabled: bool = False
    notification_time: int = Field(default=10, ge=5, le=30)  # минут до начала пары
    
    # Метаданные
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity: Optional[datetime] = None


class UserSettingsCreate(BaseModel):
    """Создание/обновление настроек пользователя"""
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    group_id: str
    group_name: str
    facultet_id: str
    facultet_name: Optional[str] = None
    level_id: str
    kurs: str
    form_code: str


class UserSettingsResponse(BaseModel):
    """Ответ с настройками пользователя"""
    id: str
    telegram_id: int
    username: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    
    group_id: str
    group_name: str
    facultet_id: str
    facultet_name: Optional[str] = None
    level_id: str
    kurs: str
    form_code: str
    
    created_at: datetime
    updated_at: datetime
    last_activity: Optional[datetime] = None


# ============ Модели для кэша расписания ============

class ScheduleCache(BaseModel):
    """Кэш расписания группы"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_id: str
    week_number: int
    events: List[ScheduleEvent]
    cached_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime


# ============ Общие модели ============

class ErrorResponse(BaseModel):
    """Модель ответа с ошибкой"""
    error: str
    detail: Optional[str] = None


class SuccessResponse(BaseModel):
    """Модель успешного ответа"""
    success: bool
    message: str
