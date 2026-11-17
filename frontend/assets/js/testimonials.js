/**
 * Testimonials Slider - Dynamic fetch + auto-slide
 */
const TESTIMONIALS_API = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:'
    ? 'http://localhost:8000/api/testimonials'
    : '/api/testimonials';

const CAROUSEL_CTA_LINKS = ['services.html', 'about.html', 'contact.html', 'services.html'];

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initTestimonialSlider() {
    const container = document.getElementById('testimonial-container');
    const controls = document.querySelector('.testimonial-controls');
    if (!container) return;

    const slides = container.querySelectorAll('.testimonial-slide');
    const dots = controls ? controls.querySelectorAll('.t-dot') : [];
    if (slides.length === 0) return;

    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 6000;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active-testi'));
        dots.forEach(dot => dot.classList.remove('active'));

        if (index >= slides.length) {
            currentSlide = 0;
        } else if (index < 0) {
            currentSlide = slides.length - 1;
        } else {
            currentSlide = index;
        }

        slides[currentSlide].classList.add('active-testi');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function startSlide() {
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    function resetInterval() {
        clearInterval(slideInterval);
        startSlide();
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            resetInterval();
        });
    });

    showSlide(0);
    startSlide();
}

function renderTestimonialSlides(testimonials) {
    const container = document.getElementById('testimonial-container');
    const controls = document.querySelector('.testimonial-controls');
    if (!container) return;

    container.innerHTML = testimonials.map((t, i) => `
        <div class="testimonial-slide${i === 0 ? ' active-testi' : ''}">
            <div class="quote-icon">❝</div>
            <blockquote>
                <p>"${escapeHtml(t.content)}"</p>
                <cite>
                    <strong>${escapeHtml(t.author_name)}</strong>
                    <span>${escapeHtml(t.company)}</span>
                </cite>
            </blockquote>
        </div>
    `).join('');

    if (controls) {
        controls.innerHTML = testimonials.map((_, i) =>
            `<span class="t-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
        ).join('');
    }

    initTestimonialSlider();
}

async function loadTestimonials() {
    const container = document.getElementById('testimonial-container');
    if (!container) return;

    try {
        const response = await fetch(TESTIMONIALS_API);
        if (!response.ok) throw new Error('Failed');
        const testimonials = await response.json();
        if (testimonials.length) {
            renderTestimonialSlides(testimonials);
        } else {
            initTestimonialSlider();
        }
    } catch {
        initTestimonialSlider();
    }
}

document.addEventListener('DOMContentLoaded', loadTestimonials);
