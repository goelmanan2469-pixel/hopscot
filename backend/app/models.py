import uuid
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
    Table,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

def generate_uuid():
    return str(uuid.uuid4())

class College(Base):
    __tablename__ = "colleges"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False, unique=True)
    short_code = Column(String, nullable=False, index=True)
    location = Column(String, nullable=False)
    metro_station = Column(String, nullable=True)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    events = relationship("Event", back_populates="college")
    users = relationship("User", back_populates="college")

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True, index=True)
    hashed_password = Column(String, nullable=False)
    role = Column(String, nullable=False, default="student") # student | organizer | admin
    college_id = Column(String, ForeignKey("colleges.id"), nullable=True)
    course = Column(String, nullable=True)
    year = Column(String, nullable=True)
    bio = Column(Text, nullable=True)
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    is_suspended = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="users")
    organized_events = relationship("Event", back_populates="organizer")
    tickets = relationship("Ticket", back_populates="user")
    travel_plans = relationship("TravelPlan", back_populates="user")

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    tagline = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    category = Column(String, nullable=False, index=True) # Hackathons, Cultural fests, etc.
    college_id = Column(String, ForeignKey("colleges.id"), nullable=False)
    venue = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    banner_url = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    registration_deadline = Column(DateTime, nullable=True)
    organizer_id = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="approved") # pending | approved | rejected
    rejection_reason = Column(String, nullable=True)
    is_featured = Column(Boolean, default=False)
    attendee_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    college = relationship("College", back_populates="events")
    organizer = relationship("User", back_populates="organized_events")
    ticket_types = relationship("TicketType", back_populates="event", cascade="all, delete-orphan")
    tickets = relationship("Ticket", back_populates="event")
    travel_plans = relationship("TravelPlan", back_populates="event")
    travel_groups = relationship("TravelGroup", back_populates="event")

class TicketType(Base):
    __tablename__ = "ticket_types"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Integer, default=0) # INR
    total_quantity = Column(Integer, nullable=False, default=500)
    sold_quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="ticket_types")

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    ticket_type_id = Column(String, ForeignKey("ticket_types.id"), nullable=False)
    quantity = Column(Integer, default=1)
    total_amount = Column(Integer, default=0)
    payment_status = Column(String, default="free") # free | pending | paid | failed
    payment_id = Column(String, nullable=True)
    order_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(String, primary_key=True, default=generate_uuid)
    ticket_number = Column(String, unique=True, nullable=False, index=True)
    booking_id = Column(String, nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    ticket_type_id = Column(String, ForeignKey("ticket_types.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    qr_payload = Column(String, unique=True, nullable=False)
    status = Column(String, default="valid") # valid | used | cancelled
    checked_in_at = Column(DateTime, nullable=True)
    checked_in_by = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="tickets")
    user = relationship("User", back_populates="tickets")

class TravelPlan(Base):
    __tablename__ = "travel_plans"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    origin_name = Column(String, nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_name = Column(String, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    event_date = Column(String, nullable=False)
    departure_time = Column(String, nullable=False) # e.g. "08:45"
    transport_mode = Column(String, default="Metro")
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="travel_plans")
    event = relationship("Event", back_populates="travel_plans")

class TravelGroup(Base):
    __tablename__ = "travel_groups"

    id = Column(String, primary_key=True, default=generate_uuid)
    event_id = Column(String, ForeignKey("events.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    origin_name = Column(String, nullable=False)
    origin_lat = Column(Float, nullable=False)
    origin_lng = Column(Float, nullable=False)
    destination_name = Column(String, nullable=False)
    destination_lat = Column(Float, nullable=False)
    destination_lng = Column(Float, nullable=False)
    departure_time = Column(String, nullable=False)
    event_date = Column(String, nullable=False)
    transport_mode = Column(String, default="Metro")
    creator_id = Column(String, ForeignKey("users.id"), nullable=False)
    max_members = Column(Integer, default=5)
    status = Column(String, default="open") # open | full | closed
    created_at = Column(DateTime, default=datetime.utcnow)

    event = relationship("Event", back_populates="travel_groups")

class GroupMessage(Base):
    __tablename__ = "group_messages"

    id = Column(String, primary_key=True, default=generate_uuid)
    group_id = Column(String, ForeignKey("travel_groups.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, nullable=False)
    link = Column(String, nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Report(Base):
    __tablename__ = "reports"

    id = Column(String, primary_key=True, default=generate_uuid)
    reporter_id = Column(String, ForeignKey("users.id"), nullable=False)
    target_type = Column(String, nullable=False) # user | group | event
    target_id = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
