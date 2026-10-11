from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "student"
    college_id: Optional[str] = None
    course: Optional[str] = None
    year: Optional[str] = None
    bio: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    avatar: Optional[str] = None
    is_suspended: bool = False
    created_at: datetime

    class Config:
        from_attributes = True

class TicketTypeSchema(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    price: int = 0
    total_quantity: int = 500
    sold_quantity: int = 0

class EventCreate(BaseModel):
    title: str
    tagline: Optional[str] = None
    description: str
    category: str
    college_id: str
    venue: str
    lat: float
    lng: float
    banner_url: str
    start_date: datetime
    end_date: datetime
    ticket_types: List[TicketTypeSchema]

class EventResponse(BaseModel):
    id: str
    title: str
    tagline: Optional[str] = None
    description: str
    category: str
    college_id: str
    venue: str
    lat: float
    lng: float
    banner_url: str
    start_date: datetime
    end_date: datetime
    status: str
    attendee_count: int
    ticket_types: List[TicketTypeSchema]

    class Config:
        from_attributes = True

class QRVerificationRequest(BaseModel):
    qr_payload: Optional[str] = None
    ticket_number: Optional[str] = None

class TravelPlanCreate(BaseModel):
    event_id: str
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    event_date: str
    departure_time: str
    transport_mode: str = "Metro"
    notes: Optional[str] = None

class TravelGroupCreate(BaseModel):
    event_id: str
    name: str
    description: Optional[str] = None
    origin_name: str
    origin_lat: float
    origin_lng: float
    destination_name: str
    destination_lat: float
    destination_lng: float
    departure_time: str
    event_date: str
    transport_mode: str = "Metro"
    max_members: int = 5
