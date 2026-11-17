from sqlalchemy import Column, Integer, String, Text
from database import Base
from datetime import datetime

class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, index=True)
    subject = Column(String)
    message = Column(String)
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))


class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    meta_title = Column(String, nullable=False)
    long_description = Column(Text, nullable=False)
    image = Column(String, default="")
    keyword = Column(String, default="")
    tag = Column(String, default="")
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    updated_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class Testimonial(Base):
    __tablename__ = "testimonials"
    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String, nullable=False)
    company = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(String, default=lambda: datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

class CarouselSlide(Base):
    __tablename__ = "carousel_slides"
    id = Column(Integer, primary_key=True, index=True)
    heading = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    cta_text = Column(String, nullable=False)

class CompanySetting(Base):
    __tablename__ = "company_settings"
    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    logo_path = Column(String, default="")
