from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, ConfigDict
from typing import List, Optional
import uvicorn
import os
import smtplib
import uuid
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from database import engine, get_db, Base
import models

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="NexaLogic IT Solution API")

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# Fake Admin DB (Ideally this should also be in DB in production)
# ---------------------------------------------------------
fake_admin_db = {
    "admin": "admin123"
}

ADMIN_TOKEN = "fake-jwt-token-12345"
SERVICES_UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "assets", "images", "services")
)
LOGO_UPLOAD_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "frontend", "assets", "images")
)
os.makedirs(SERVICES_UPLOAD_DIR, exist_ok=True)
os.makedirs(LOGO_UPLOAD_DIR, exist_ok=True)


def verify_admin_token(token: Optional[str] = None):
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized access")


def service_to_public(service: models.Service) -> dict:
    return {
        "id": service.id,
        "title": service.title,
        "slug": service.slug,
        "meta_title": service.meta_title,
        "long_description": service.long_description,
        "image": service.image,
        "tag": service.tag,
        "created_at": service.created_at,
        "updated_at": service.updated_at,
    }


def service_to_admin(service: models.Service) -> dict:
    data = service_to_public(service)
    data["keyword"] = service.keyword
    return data


async def save_service_image(image: UploadFile) -> str:
    ext = os.path.splitext(image.filename or "")[1].lower()
    if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        raise HTTPException(status_code=400, detail="Invalid image format")
    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(SERVICES_UPLOAD_DIR, filename)
    content = await image.read()
    with open(filepath, "wb") as f:
        f.write(content)
    return f"/assets/images/services/{filename}"

# ---------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------
class InquiryCreate(BaseModel):
    name: str
    email: str
    subject: str
    message: str

class InquiryResponse(BaseModel):
    id: int
    name: str
    email: str
    subject: str
    message: str
    created_at: str

    class Config:
        orm_mode = True
        # For pydantic v2 use: from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str


class ServiceCreate(BaseModel):
    title: str
    slug: str
    meta_title: str
    long_description: str
    image: str = ""
    keyword: str = ""
    tag: str = ""


class ServiceUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    meta_title: Optional[str] = None
    long_description: Optional[str] = None
    image: Optional[str] = None
    keyword: Optional[str] = None
    tag: Optional[str] = None


class TestimonialCreate(BaseModel):
    author_name: str
    company: str
    content: str


class TestimonialUpdate(BaseModel):
    author_name: Optional[str] = None
    company: Optional[str] = None
    content: Optional[str] = None


class TestimonialResponse(BaseModel):
    id: int
    author_name: str
    company: str
    content: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)


class CarouselSlideCreate(BaseModel):
    heading: str
    description: str
    cta_text: str


class CarouselSlideResponse(BaseModel):
    id: int
    heading: str
    description: str
    cta_text: str

    model_config = ConfigDict(from_attributes=True)


class CarouselBulkUpdate(BaseModel):
    slides: List[CarouselSlideCreate]


class CompanySettingUpdate(BaseModel):
    company_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class CompanySettingResponse(BaseModel):
    id: int
    company_name: str
    email: str
    phone: str
    address: str
    logo_path: str

    model_config = ConfigDict(from_attributes=True)


class InquiryUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    subject: Optional[str] = None
    message: Optional[str] = None

# ---------------------------------------------------------
# Email Config (set in environment or replace defaults)
# ---------------------------------------------------------
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "umarfaruksuratwala@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "eoewfkmiyffiquif")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "umarfaruksuratwala@gmail.com")


def send_inquiry_email(name: str, email: str, subject: str, message: str) -> str:
    """Send inquiry notification via simple smtplib (no token/auth checks)."""
    msg = MIMEMultipart()
    msg["From"] = SMTP_EMAIL
    msg["To"] = ADMIN_EMAIL
    msg["Subject"] = f"New Inquiry: {subject}"

    body = f"""New Inquiry Received from NexaLogic Website:

Name: {name}
Email: {email}
Subject: {subject}
Message:
{message}
"""
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_EMAIL, SMTP_PASSWORD)
        server.send_message(msg)

    return "Email sent successfully"


# ---------------------------------------------------------
# API Endpoints
# ---------------------------------------------------------

@app.post("/api/auth/login")
def login(request: LoginRequest):
    if request.username in fake_admin_db and fake_admin_db[request.username] == request.password:
        return {"token": ADMIN_TOKEN, "role": "admin"}
    raise HTTPException(status_code=401, detail="Invalid username or password")


# ---------------------------------------------------------
# Services API
# ---------------------------------------------------------

@app.get("/api/services")
def list_services(
    search: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    query = db.query(models.Service)
    if tag and tag.lower() != "all":
        query = query.filter(models.Service.tag.ilike(f"%{tag}%"))
    if search:
        term = f"%{search.lower()}%"
        query = query.filter(
            (models.Service.title.ilike(term))
            | (models.Service.long_description.ilike(term))
            | (models.Service.keyword.ilike(term))
            | (models.Service.tag.ilike(term))
        )
    services = query.order_by(models.Service.id.desc()).all()
    return [service_to_public(s) for s in services]


@app.get("/api/services/slug/{slug}")
def get_service_by_slug(slug: str, db: Session = Depends(get_db)):
    service = db.query(models.Service).filter(models.Service.slug == slug).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    data = service_to_public(service)
    data["keyword"] = service.keyword
    return data


@app.get("/api/services/admin/all")
def list_services_admin(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    services = db.query(models.Service).order_by(models.Service.id.desc()).all()
    return [service_to_admin(s) for s in services]


@app.get("/api/services/admin/{service_id}")
def get_service_admin(service_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return service_to_admin(service)


@app.post("/api/services")
async def create_service(
    title: str = Form(...),
    slug: str = Form(...),
    meta_title: str = Form(...),
    long_description: str = Form(...),
    keyword: str = Form(""),
    tag: str = Form(""),
    token: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    slug = slug.strip().lower()
    if db.query(models.Service).filter(models.Service.slug == slug).first():
        raise HTTPException(status_code=400, detail="Slug already exists")

    image_path = ""
    if image and image.filename:
        image_path = await save_service_image(image)

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    service = models.Service(
        title=title.strip(),
        slug=slug,
        meta_title=meta_title.strip(),
        long_description=long_description.strip(),
        image=image_path,
        keyword=keyword.strip(),
        tag=tag.strip(),
        created_at=now,
        updated_at=now,
    )
    db.add(service)
    db.commit()
    db.refresh(service)
    return {"message": "Service created", "service": service_to_admin(service)}


@app.put("/api/services/{service_id}")
async def update_service(
    service_id: int,
    title: str = Form(...),
    slug: str = Form(...),
    meta_title: str = Form(...),
    long_description: str = Form(...),
    keyword: str = Form(""),
    tag: str = Form(""),
    token: str = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    slug = slug.strip().lower()
    existing = db.query(models.Service).filter(
        models.Service.slug == slug, models.Service.id != service_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Slug already exists")

    if image and image.filename:
        service.image = await save_service_image(image)

    service.title = title.strip()
    service.slug = slug
    service.meta_title = meta_title.strip()
    service.long_description = long_description.strip()
    service.keyword = keyword.strip()
    service.tag = tag.strip()
    service.updated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    db.commit()
    db.refresh(service)
    return {"message": "Service updated", "service": service_to_admin(service)}


@app.delete("/api/services/{service_id}")
def delete_service(service_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    db.delete(service)
    db.commit()
    return {"message": "Service deleted"}

@app.post("/api/inquiries", response_model=dict)
def submit_inquiry(inquiry: InquiryCreate, db: Session = Depends(get_db)):
    # 1. Save to Database
    db_inquiry = models.Inquiry(
        name=inquiry.name,
        email=inquiry.email,
        subject=inquiry.subject,
        message=inquiry.message
    )
    db.add(db_inquiry)
    db.commit()
    db.refresh(db_inquiry)

    # 2. Send Email via smtplib
    try:
        email_status = send_inquiry_email(
            inquiry.name,
            inquiry.email,
            inquiry.subject,
            inquiry.message,
        )
    except Exception as e:
        print(f"Failed to send email: {e}")
        email_status = "Database saved, but email failed to send (Check SMTP credentials)"

    return {"message": "Inquiry submitted successfully", "id": db_inquiry.id, "email_status": email_status}

@app.get("/api/inquiries", response_model=List[InquiryResponse])
def get_inquiries(token: str = None, db: Session = Depends(get_db)):
    verify_admin_token(token)
    
    inquiries = db.query(models.Inquiry).order_by(models.Inquiry.id.desc()).all()
    return inquiries


@app.put("/api/inquiries/{inquiry_id}", response_model=InquiryResponse)
def update_inquiry(
    inquiry_id: int,
    update: InquiryUpdate,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    if update.name is not None:
        inquiry.name = update.name.strip()
    if update.email is not None:
        inquiry.email = update.email.strip()
    if update.subject is not None:
        inquiry.subject = update.subject.strip()
    if update.message is not None:
        inquiry.message = update.message.strip()

    db.commit()
    db.refresh(inquiry)
    return inquiry


@app.delete("/api/inquiries/{inquiry_id}")
def delete_inquiry(inquiry_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    inquiry = db.query(models.Inquiry).filter(models.Inquiry.id == inquiry_id).first()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    db.delete(inquiry)
    db.commit()
    return {"message": "Inquiry deleted"}


# ---------------------------------------------------------
# Testimonials API
# ---------------------------------------------------------

@app.get("/api/testimonials", response_model=List[TestimonialResponse])
def list_testimonials(db: Session = Depends(get_db)):
    return db.query(models.Testimonial).order_by(models.Testimonial.id.asc()).all()


@app.get("/api/testimonials/admin/all", response_model=List[TestimonialResponse])
def list_testimonials_admin(token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    return db.query(models.Testimonial).order_by(models.Testimonial.id.desc()).all()


@app.post("/api/testimonials", response_model=TestimonialResponse)
def create_testimonial(
    testimonial: TestimonialCreate,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    db_testimonial = models.Testimonial(
        author_name=testimonial.author_name.strip(),
        company=testimonial.company.strip(),
        content=testimonial.content.strip(),
    )
    db.add(db_testimonial)
    db.commit()
    db.refresh(db_testimonial)
    return db_testimonial


@app.put("/api/testimonials/{testimonial_id}", response_model=TestimonialResponse)
def update_testimonial(
    testimonial_id: int,
    update: TestimonialUpdate,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")

    if update.author_name is not None:
        testimonial.author_name = update.author_name.strip()
    if update.company is not None:
        testimonial.company = update.company.strip()
    if update.content is not None:
        testimonial.content = update.content.strip()

    db.commit()
    db.refresh(testimonial)
    return testimonial


@app.delete("/api/testimonials/{testimonial_id}")
def delete_testimonial(testimonial_id: int, token: str = Query(...), db: Session = Depends(get_db)):
    verify_admin_token(token)
    testimonial = db.query(models.Testimonial).filter(models.Testimonial.id == testimonial_id).first()
    if not testimonial:
        raise HTTPException(status_code=404, detail="Testimonial not found")
    db.delete(testimonial)
    db.commit()
    return {"message": "Testimonial deleted"}


# ---------------------------------------------------------
# Carousel Slides API
# ---------------------------------------------------------

DEFAULT_CAROUSEL_SLIDES = [
    {
        "heading": "Innovating the Future of Business IT",
        "description": "We deliver bespoke software, cloud architecture, and security services tailored for your enterprise.",
        "cta_text": "Explore Services",
    },
    {
        "heading": "Our Strategic Process",
        "description": "From assessment to execution, we ensure quality checkpoints and seamless digital transitions.",
        "cta_text": "Our Process",
    },
    {
        "heading": "Industries We Support",
        "description": "Empowering Healthcare, Finance, Logistics, and E-commerce with robust backend systems.",
        "cta_text": "Partner With Us",
    },
    {
        "heading": "Featured Solutions",
        "description": "Discover our specialized cloud migration and machine learning APIs built to scale.",
        "cta_text": "Learn More",
    },
]


@app.get("/api/carousel-slides", response_model=List[CarouselSlideResponse])
def list_carousel_slides(db: Session = Depends(get_db)):
    slides = db.query(models.CarouselSlide).order_by(models.CarouselSlide.id.asc()).all()
    if not slides:
        for slide in DEFAULT_CAROUSEL_SLIDES:
            db.add(models.CarouselSlide(**slide))
        db.commit()
        slides = db.query(models.CarouselSlide).order_by(models.CarouselSlide.id.asc()).all()
    return slides


@app.put("/api/carousel-slides/bulk", response_model=List[CarouselSlideResponse])
def update_carousel_slides_bulk(
    payload: CarouselBulkUpdate,
    token: str = Query(...),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    db.query(models.CarouselSlide).delete()
    db.commit()

    new_slides = []
    for slide in payload.slides:
        db_slide = models.CarouselSlide(
            heading=slide.heading.strip(),
            description=slide.description.strip(),
            cta_text=slide.cta_text.strip(),
        )
        db.add(db_slide)
        new_slides.append(db_slide)

    db.commit()
    for slide in new_slides:
        db.refresh(slide)
    return new_slides


# ---------------------------------------------------------
# Company Settings API
# ---------------------------------------------------------

DEFAULT_COMPANY_SETTINGS = {
    "company_name": "NexaLogic IT Solution",
    "email": "info@nexalogicit.com",
    "phone": "+1 (555) 019-2834",
    "address": "Tech Square Tower 4, Suite 800, Silicon Valley, CA",
    "logo_path": "/assets/images/logo.png",
}


def get_or_create_company_settings(db: Session) -> models.CompanySetting:
    settings = db.query(models.CompanySetting).first()
    if not settings:
        settings = models.CompanySetting(**DEFAULT_COMPANY_SETTINGS)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@app.get("/api/company-settings", response_model=CompanySettingResponse)
def get_company_settings(db: Session = Depends(get_db)):
    return get_or_create_company_settings(db)


@app.put("/api/company-settings", response_model=CompanySettingResponse)
async def update_company_settings(
    company_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    address: str = Form(...),
    token: str = Form(...),
    logo: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    verify_admin_token(token)
    settings = get_or_create_company_settings(db)

    settings.company_name = company_name.strip()
    settings.email = email.strip()
    settings.phone = phone.strip()
    settings.address = address.strip()

    if logo and logo.filename:
        ext = os.path.splitext(logo.filename)[1].lower()
        if ext not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
            raise HTTPException(status_code=400, detail="Invalid logo format")
        filename = f"logo{ext}"
        filepath = os.path.join(LOGO_UPLOAD_DIR, filename)
        content = await logo.read()
        with open(filepath, "wb") as f:
            f.write(content)
        settings.logo_path = f"/assets/images/{filename}"

    db.commit()
    db.refresh(settings)
    return settings

# ---------------------------------------------------------
# Static File Serving (Frontend)
# ---------------------------------------------------------
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'frontend'))
app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
