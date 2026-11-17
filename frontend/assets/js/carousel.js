const CAROUSEL_API = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:'
    ? 'http://localhost:8000/api/carousel-slides'
    : '/api/carousel-slides';

const SLIDE_BACKGROUNDS = [
    "assets/images/slide1.png",
    "assets/images/slide2.png",
    "assets/images/slide3.png",
    "assets/images/slide4.png",
];

const SLIDE_LINKS = ['services.html', 'about.html', 'contact.html', 'services.html'];

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function initCarouselSlider() {
    const slides = document.querySelectorAll('.carousel-slide');
    const dots = document.querySelectorAll('.carousel-dots .dot');
    const prevBtn = document.getElementById('prev-slide');
    const nextBtn = document.getElementById('next-slide');
    const carouselContainer = document.getElementById('hero-carousel');

    if (slides.length === 0) return;

    let currentSlide = 0;
    let autoSlideInterval = null;
    const slideDuration = 5000;

    function showSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        currentSlide = (index + slides.length) % slides.length;
        slides[currentSlide].classList.add('active');
        if (dots[currentSlide]) dots[currentSlide].classList.add('active');
    }

    function nextSlide() { showSlide(currentSlide + 1); }
    function prevSlide() { showSlide(currentSlide - 1); }

    function startAutoSlide() {
        if (!autoSlideInterval) autoSlideInterval = setInterval(nextSlide, slideDuration);
    }

    function stopAutoSlide() {
        if (autoSlideInterval) {
            clearInterval(autoSlideInterval);
            autoSlideInterval = null;
        }
    }

    function resetAutoSlide() {
        stopAutoSlide();
        startAutoSlide();
    }

    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoSlide(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoSlide(); });

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { showSlide(index); resetAutoSlide(); });
    });

    showSlide(0);
    startAutoSlide();
}

function renderCarouselSlides(slides) {
    const slidesContainer = document.querySelector('#hero-carousel .carousel-slides');
    const dotsContainer = document.querySelector('#hero-carousel .carousel-dots');
    if (!slidesContainer) return;

    slidesContainer.innerHTML = slides.map((slide, i) => `
        <article class="carousel-slide${i === 0 ? ' active' : ''}" style="background-image: url('${SLIDE_BACKGROUNDS[i % SLIDE_BACKGROUNDS.length]}');">
            <h1>${escapeHtml(slide.heading)}</h1>
            <p>${escapeHtml(slide.description)}</p>
            <a href="${SLIDE_LINKS[i % SLIDE_LINKS.length]}" class="cta-button">${escapeHtml(slide.cta_text)}</a>
        </article>
    `).join('');

    if (dotsContainer) {
        dotsContainer.innerHTML = slides.map((_, i) =>
            `<span class="dot${i === 0 ? ' active' : ''}" data-slide="${i}" aria-label="Slide ${i + 1} navigation"></span>`
        ).join('');
    }

    initCarouselSlider();
}

async function loadCarousel() {
    const carousel = document.getElementById('hero-carousel');
    if (!carousel) return;

    try {
        const response = await fetch(CAROUSEL_API);
        if (!response.ok) throw new Error('Failed');
        const slides = await response.json();
        if (slides.length) {
            renderCarouselSlides(slides);
        } else {
            initCarouselSlider();
        }
    } catch {
        initCarouselSlider();
    }
}

document.addEventListener('DOMContentLoaded', loadCarousel);
