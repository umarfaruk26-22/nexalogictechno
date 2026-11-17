/* services.js - Dynamic services from API */

const SERVICES_API = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:'
    ? 'http://localhost:8000/api/services'
    : '/api/services';

function truncateText(text, max = 160) {
    if (!text || text.length <= max) return text || '';
    return text.slice(0, max).trim() + '...';
}

function serviceDetailUrl(slug) {
    return `service-detail.html?slug=${encodeURIComponent(slug)}`;
}

function getGridClass(count) {
    if (count <= 1) return 'grid-1';
    if (count === 2) return 'grid-2';
    return 'grid-3';
}

function formatTag(tag) {
    if (!tag) return '';
    return tag.startsWith('#') ? tag : `#${tag}`;
}

function renderServiceCard(service, linkClass = 'details-button') {
    const imgHtml = service.image
        ? `<img src="${service.image}" alt="${service.title}" class="service-card-img">`
        : `<div class="service-card-img service-card-img-placeholder">📦</div>`;

    return `
        <article class="service-card card-premium" data-tag="${service.tag || ''}" data-slug="${service.slug}">
            ${imgHtml}
            <div class="service-card-content">
                <h3>${service.title}</h3>
                <p>${truncateText(service.long_description)}</p>
                <a href="${serviceDetailUrl(service.slug)}" class="${linkClass}">View Details <span>&rarr;</span></a>
            </div>
        </article>
    `;
}

async function fetchServices(params = {}) {
    const query = new URLSearchParams(params).toString();
    const url = query ? `${SERVICES_API}?${query}` : SERVICES_API;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load services');
    return response.json();
}

async function fetchServiceBySlug(slug) {
    const response = await fetch(`${SERVICES_API}/slug/${encodeURIComponent(slug)}`);
    if (!response.ok) throw new Error('Service not found');
    return response.json();
}

function initServicesListingPage() {
    const grid = document.getElementById('services-grid-container');
    if (!grid) return;

    const searchInput = document.getElementById('service-search-input');
    const searchBtn = document.getElementById('search-button');
    const tagFilters = document.getElementById('tag-filters');

    let activeTag = 'all';
    let currentPage = 1;
    const itemsPerPage = 8;
    let currentServices = [];

    const prevBtn = document.querySelector('.pagination-prev');
    const nextBtn = document.querySelector('.pagination-next');
    const infoSpan = document.querySelector('.pagination-info');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderGrid();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(currentServices.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                renderGrid();
            }
        });
    }

    const renderGrid = () => {
        if (!currentServices.length) {
            grid.className = 'services-grid grid-1';
            grid.innerHTML = '<p class="empty-services-msg">No services found.</p>';
            if(prevBtn) prevBtn.disabled = true;
            if(nextBtn) nextBtn.disabled = true;
            if(infoSpan) infoSpan.textContent = 'Page 1 of 1';
            return;
        }

        const totalPages = Math.ceil(currentServices.length / itemsPerPage);
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
        if (infoSpan) infoSpan.textContent = `Page ${currentPage} of ${totalPages}`;

        const startIdx = (currentPage - 1) * itemsPerPage;
        const pageServices = currentServices.slice(startIdx, startIdx + itemsPerPage);

        grid.className = 'services-circle-wrapper';
        
        let centerText = `
            <div class="services-circle-center-text">
                <h3>Our Services</h3>
                <p>Innovative solutions tailored for your business needs.</p>
            </div>
        `;
        
        let circleHtml = `<div class="services-circle">`;
        
        pageServices.forEach((s, i) => {
            const angle = (i / pageServices.length) * 360;
            circleHtml += `
                <div class="circle-item" style="--angle: ${angle}deg;">
                    ${renderServiceCard(s, 'details-button')}
                </div>
            `;
        });
        
        circleHtml += `</div>`;
        grid.innerHTML = centerText + circleHtml;
    };

    const buildTagFilters = (services) => {
        if (!tagFilters) return;
        
        // Extract just the first tag/category for the filter buttons
        const categories = [...new Set(services.map(s => {
            if (!s.tag) return null;
            return s.tag.split(',')[0].trim();
        }).filter(Boolean))];

        tagFilters.innerHTML = `
            <span class="filter-label">Category:</span>
            <button type="button" class="filter-btn active" data-tag="all">All</button>
            ${categories.map(cat => `<button type="button" class="filter-btn" data-tag="${cat}">${cat}</button>`).join('')}
        `;
        tagFilters.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                tagFilters.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                activeTag = btn.dataset.tag;
                loadServices();
            });
        });
    };

    const loadServices = async () => {
        grid.innerHTML = '<p class="empty-services-msg">Loading services...</p>';
        try {
            const params = {};
            if (activeTag !== 'all') params.tag = activeTag;
            if (searchInput && searchInput.value.trim()) params.search = searchInput.value.trim();
            currentServices = await fetchServices(params);
            currentPage = 1;
            renderGrid();
        } catch {
            grid.innerHTML = '<p class="empty-services-msg">Unable to load services.</p>';
        }
    };

    const initialLoad = async () => {
        try {
            currentServices = await fetchServices();
            buildTagFilters(currentServices);
            currentPage = 1;
            renderGrid();
        } catch {
            grid.innerHTML = '<p class="empty-services-msg">Unable to load services.</p>';
        }
    };

    if (searchBtn) searchBtn.addEventListener('click', loadServices);
    if (searchInput) {
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') loadServices();
        });
    }

    initialLoad();
}

async function initServiceDetailPage() {
    if (!document.getElementById('service-title')) return; // Only run on service detail page
    
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug') || params.get('service');
    if (!slug) {
        window.location.href = 'services.html';
        return;
    }

    const titleEl = document.getElementById('service-title');
    const metaTitleEl = document.getElementById('service-meta-title');
    const descEl = document.getElementById('service-description-content');
    const tagEl = document.getElementById('service-tag-display');
    const heroImg = document.getElementById('service-hero-image');
    const inquiryService = document.getElementById('inquiry-service-selected');
    const relatedContainer = document.getElementById('related-services-container');

    try {
        const service = await fetchServiceBySlug(slug);

        document.title = `${service.meta_title || service.title} | NexaLogic IT Solution`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.content = truncateText(service.long_description, 160);

        let metaKeywords = document.querySelector('meta[name="keywords"]');
        if (!metaKeywords) {
            metaKeywords = document.createElement('meta');
            metaKeywords.name = 'keywords';
            document.head.appendChild(metaKeywords);
        }
        if (service.keyword) metaKeywords.content = service.keyword;

        if (titleEl) titleEl.textContent = service.title;
        if (metaTitleEl) metaTitleEl.textContent = service.meta_title;
        if (inquiryService) inquiryService.value = service.title;

        if (heroImg) {
            if (service.image) {
                heroImg.innerHTML = `<img src="${service.image}" alt="${service.title}">`;
            } else {
                heroImg.innerHTML = '<div class="service-card-img-placeholder">📦</div>';
            }
        }

        if (descEl) {
            descEl.innerHTML = `
                <h2>About the Solution</h2>
                <p>${service.long_description.replace(/\n/g, '</p><p>')}</p>
            `;
        }

        if (tagEl) {
            if (service.tag) {
                // Format tags as individual badges
                const hashtagHTML = service.tag.split(',')
                    .map(t => t.trim())
                    .filter(t => t)
                    .map(t => `<span class="hashtag">${t.startsWith('#') ? t : '#' + t}</span>`)
                    .join('');
                tagEl.innerHTML = hashtagHTML;
            } else {
                tagEl.innerHTML = '';
            }
        }

        if (relatedContainer) {
            const all = await fetchServices();
            const related = all.filter(s => s.slug !== slug).slice(0, 3);
            relatedContainer.innerHTML = related.length
                ? related.map(s => renderServiceCard(s, 'details-button')).join('')
                : '<p class="empty-services-msg">No related services.</p>';
        }
    } catch {
        if (titleEl) titleEl.textContent = 'Service Not Found';
        if (descEl) descEl.innerHTML = '<p>This service does not exist. <a href="services.html">Back to services</a></p>';
    }

    // Scroll to Top Logic
    const scrollTopBtn = document.getElementById('scroll-top-btn');
    if (scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

async function initFeaturedServices() {
    const container = document.getElementById('featured-services-container');
    if (!container) return;

    try {
        const services = await fetchServices();
        const featured = services.slice(0, 3);
        if (!featured.length) {
            container.innerHTML = '<p class="empty-services-msg">No services available yet.</p>';
            return;
        }
        container.innerHTML = featured.map(s => {
            const imgHtml = s.image
                ? `<img src="${s.image}" alt="${s.title}" class="service-card-img">`
                : `<div class="service-card-img service-card-img-placeholder">📦</div>`;
            return `
                <article class="service-card card-premium">
                    ${imgHtml}
                    <div class="service-card-body">
                        <h3>${s.title}</h3>
                        <p>${truncateText(s.long_description)}</p>
                        <a href="${serviceDetailUrl(s.slug)}" class="details-link">Read Details <span>&rarr;</span></a>
                    </div>
                </article>
            `;
        }).join('');
    } catch {
        container.innerHTML = '<p class="empty-services-msg">Unable to load services.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initServicesListingPage();
    initServiceDetailPage();
    initFeaturedServices();
});
