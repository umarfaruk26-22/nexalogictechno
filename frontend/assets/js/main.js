/* main.js */

// Backend Base URL - Adjust if hosted elsewhere
const API_BASE_URL = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:'
    ? 'http://localhost:8000/api' 
    : '/api';

document.addEventListener('DOMContentLoaded', () => {
    /* -------------------------------------
       1. Mobile Side Navigation Drawer (Glaimagain Style)
    ------------------------------------- */
    const navToggleBtn = document.getElementById('btnMobileNavToggle') || document.querySelector('.menu-toggle');
    const navCloseBtn = document.getElementById('btnMobileNavClose') || document.querySelector('.mobile-nav-close-btn');
    const navDrawer = document.getElementById('mobileNavDrawer') || document.querySelector('.mobile-nav-drawer');
    const navBackdrop = document.getElementById('mobileNavBackdrop') || document.querySelector('.mobile-nav-backdrop');

    function openMobileNav() {
        if (navDrawer && navBackdrop) {
            navDrawer.classList.add('active');
            navBackdrop.classList.add('active');
            if (navToggleBtn) navToggleBtn.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeMobileNav() {
        if (navDrawer && navBackdrop) {
            navDrawer.classList.remove('active');
            navBackdrop.classList.remove('active');
            if (navToggleBtn) navToggleBtn.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (navToggleBtn) {
        navToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (navDrawer && navDrawer.classList.contains('active')) {
                closeMobileNav();
            } else {
                openMobileNav();
            }
        });
    }

    if (navCloseBtn) {
        navCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeMobileNav();
        });
    }

    if (navBackdrop) {
        navBackdrop.addEventListener('click', closeMobileNav);
    }

    if (navDrawer) {
        navDrawer.querySelectorAll('.mobile-nav-item, .mobile-drawer-cta').forEach(link => {
            link.addEventListener('click', () => {
                closeMobileNav();
            });
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navDrawer && navDrawer.classList.contains('active')) {
            closeMobileNav();
        }
    });

    /* -------------------------------------
       2. Header Scroll Effect
    ------------------------------------- */
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* -------------------------------------
       3. Fade-Up Animation Observer
    ------------------------------------- */
    const fadeElements = document.querySelectorAll('.fade-up');
    
    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        fadeElements.forEach(el => observer.observe(el));
    }
    
    /* -------------------------------------
       4. Modal Overlay Click Outside
    ------------------------------------- */
    const modalOverlay = document.getElementById('inquiry-modal-overlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    /* -------------------------------------
       8. Company Settings (Footer)
    ------------------------------------- */
    loadCompanySettings();

    /* ==========================================================================
       BACKEND INTEGRATION SECTION
       ========================================================================== */

    /* -------------------------------------
       5. Contact Form Submissions (Contact Page & Service Detail)
    ------------------------------------- */
    const handleInquirySubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Submitting...';
        btn.disabled = true;

        let payload = {};
        if (form.id === 'contact-inquiry-form') {
            payload = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value
            };
        } else if (form.id === 'service-inquiry-form') {
            const serviceName = document.getElementById('inquiry-service-selected').value;
            payload = {
                name: document.getElementById('inquiry-name').value,
                email: document.getElementById('inquiry-email').value,
                subject: `Service Inquiry: ${serviceName}`,
                message: document.getElementById('inquiry-message').value
            };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/inquiries`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                alert('Your inquiry has been submitted successfully! We will contact you soon.');
                form.reset();
                if (form.id === 'service-inquiry-form') closeModal();
            } else {
                alert('Failed to submit inquiry. Please try again later.');
            }
        } catch (error) {
            console.error('Error submitting inquiry:', error);
            alert('A network error occurred. Please try again.');
        } finally {
            btn.innerText = originalText;
            btn.disabled = false;
        }
    };

    const contactForm = document.getElementById('contact-inquiry-form');
    if (contactForm) contactForm.addEventListener('submit', handleInquirySubmit);

    const serviceForm = document.getElementById('service-inquiry-form');
    if (serviceForm) serviceForm.addEventListener('submit', handleInquirySubmit);

    /* -------------------------------------
       6. Admin Authentication
    ------------------------------------- */
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = document.getElementById('login-submit-btn');
            const feedback = document.getElementById('login-feedback-message');
            btn.innerText = 'Authenticating...';
            btn.disabled = true;

            const payload = {
                username: document.getElementById('admin-username').value,
                password: document.getElementById('admin-password').value
            };

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('adminToken', data.token);
                    feedback.style.color = 'green';
                    feedback.innerText = 'Login successful! Redirecting...';
                    setTimeout(() => {
                        window.location.href = 'admin-dashboard.html';
                    }, 1000);
                } else {
                    feedback.style.color = 'red';
                    feedback.innerText = 'Invalid username or password.';
                }
            } catch (error) {
                feedback.style.color = 'red';
                feedback.innerText = 'Network error. Cannot reach server.';
            } finally {
                btn.innerText = 'Authenticate';
                btn.disabled = false;
            }
        });
    }

    /* -------------------------------------
       7. Admin Dashboard Protected Data Fetch
    ------------------------------------- */
    const loadDashboardData = async () => {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            alert('Unauthorized access. Please login first.');
            window.location.href = 'admin-login.html';
            return;
        }

        try {
            // Fetch Inquiries
            const response = await fetch(`${API_BASE_URL}/inquiries?token=${token}`);
            if (response.status === 401) {
                alert('Session expired. Please login again.');
                localStorage.removeItem('adminToken');
                window.location.href = 'admin-login.html';
                return;
            }

            if (response.ok) {
                const inquiries = await response.json();
                
                // Update stats
                document.getElementById('stat-total-inquiries').innerText = inquiries.length;
                
                // Populate Table
                const tbody = document.getElementById('inquiries-table-body');
                if (inquiries.length === 0) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 20px;">No inquiries found.</td></tr>`;
                } else {
                    tbody.innerHTML = '';
                    inquiries.forEach(inq => {
                        const tr = document.createElement('tr');
                        tr.innerHTML = `
                            <td>${inq.created_at}</td>
                            <td><strong>${inq.name}</strong></td>
                            <td><a href="mailto:${inq.email}">${inq.email}</a></td>
                            <td>${inq.subject}</td>
                            <td>${inq.message}</td>
                            <td>
                                <div style="display: flex; gap: 8px; align-items: center;">
                                    <button type="button" class="btn-edit btn-sm" onclick="editInquiry(${inq.id})">Edit</button>
                                    <button type="button" class="btn-delete btn-sm" onclick="deleteInquiry(${inq.id})">Delete</button>
                                </div>
                            </td>
                        `;
                        tbody.appendChild(tr);
                    });
                }
            }
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            const tbody = document.getElementById('inquiries-table-body');
            if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error connecting to server.</td></tr>`;
        }
    };

    // If we are on the dashboard page, load data
    if (document.getElementById('dashboard-main-content')) {
        loadDashboardData();
        loadAdminServices();
        loadAdminTestimonials();
        loadCarouselSettings();
        loadCompanySettingsForm();

        const logoutBtn = document.getElementById('admin-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('adminToken');
                window.location.href = 'admin-login.html';
            });
        }

        const serviceForm = document.getElementById('service-crud-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', handleServiceFormSubmit);
        }

        const addServiceBtn = document.getElementById('add-service-btn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => resetServiceForm());
        }

        const titleInput = document.getElementById('service-form-title-input');
        const slugInput = document.getElementById('service-form-slug');
        if (titleInput && slugInput) {
            titleInput.addEventListener('input', () => {
                if (!slugInput.dataset.manual) {
                    slugInput.value = titleInput.value
                        .toLowerCase()
                        .trim()
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-');
                }
            });
            slugInput.addEventListener('input', () => {
                slugInput.dataset.manual = 'true';
            });
        }

        const carouselForm = document.getElementById('homepage-carousel-form');
        if (carouselForm) carouselForm.addEventListener('submit', handleCarouselFormSubmit);

        const testimonialForm = document.getElementById('testimonial-crud-form');
        if (testimonialForm) testimonialForm.addEventListener('submit', handleTestimonialFormSubmit);

        const companyForm = document.getElementById('company-settings-form');
        if (companyForm) companyForm.addEventListener('submit', handleCompanySettingsSubmit);

        const inquiryEditForm = document.getElementById('inquiry-edit-form');
        if (inquiryEditForm) inquiryEditForm.addEventListener('submit', handleInquiryEditSubmit);

        const addTestimonialBtn = document.getElementById('add-testimonial-btn');
        if (addTestimonialBtn) {
            addTestimonialBtn.addEventListener('click', () => {
                resetTestimonialForm();
                openAdminModal('testimonial-form-modal');
            });
        }
    }
});

/* -------------------------------------
   9. Admin Services CRUD
------------------------------------- */
function resetServiceForm() {
    document.getElementById('service-form-id').value = '';
    document.getElementById('service-form-title-input').value = '';
    document.getElementById('service-form-slug').value = '';
    document.getElementById('service-form-slug').dataset.manual = '';
    document.getElementById('service-form-meta-title').value = '';
    document.getElementById('service-form-desc').value = '';
    document.getElementById('service-form-keyword').value = '';
    document.getElementById('service-form-tag').value = '';
    document.getElementById('service-form-image').value = '';
    document.getElementById('service-form-image-preview').innerHTML = '';
    document.getElementById('service-form-title').innerText = 'Create Service Record';
}

async function loadAdminServices() {
    const tbody = document.getElementById('services-crud-table-body');
    const statEl = document.getElementById('stat-active-services');
    if (!tbody) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/services/admin/all?token=${token}`);
        if (!response.ok) throw new Error('Failed');

        const services = await response.json();
        if (statEl) statEl.innerText = services.length;

        if (!services.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No services yet. Add one.</td></tr>';
            return;
        }

        tbody.innerHTML = services.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${s.title}</td>
                <td>${s.slug}</td>
                <td>${s.tag || '-'}</td>
                <td>
                    <button type="button" class="btn-edit btn-sm" onclick="editService(${s.id})">Edit</button>
                    <button type="button" class="btn-delete btn-sm" onclick="deleteService(${s.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;padding:20px;">Failed to load services.</td></tr>';
    }
}

async function editService(id) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/services/admin/${id}?token=${token}`);
        if (!response.ok) throw new Error('Not found');
        const s = await response.json();

        document.getElementById('service-form-id').value = s.id;
        document.getElementById('service-form-title-input').value = s.title;
        document.getElementById('service-form-slug').value = s.slug;
        document.getElementById('service-form-slug').dataset.manual = 'true';
        document.getElementById('service-form-meta-title').value = s.meta_title;
        document.getElementById('service-form-desc').value = s.long_description;
        document.getElementById('service-form-keyword').value = s.keyword || '';
        document.getElementById('service-form-tag').value = s.tag || '';
        document.getElementById('service-form-image').value = '';
        document.getElementById('service-form-image-preview').innerHTML = s.image
            ? `<br><img src="${s.image}" alt="Current" style="max-width:120px;border-radius:6px;margin-top:8px;">`
            : '';
        document.getElementById('service-form-title').innerText = 'Edit Service Record';
        openAdminModal('service-form-modal');
    } catch {
        alert('Could not load service for editing.');
    }
}

async function deleteService(id) {
    if (!confirm('Delete this service permanently?')) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/services/${id}?token=${token}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        loadAdminServices();
    } catch {
        alert('Failed to delete service.');
    }
}

async function handleServiceFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const id = document.getElementById('service-form-id').value;
    const formData = new FormData();
    formData.append('token', token);
    formData.append('title', document.getElementById('service-form-title-input').value);
    formData.append('slug', document.getElementById('service-form-slug').value);
    formData.append('meta_title', document.getElementById('service-form-meta-title').value);
    formData.append('long_description', document.getElementById('service-form-desc').value);
    formData.append('keyword', document.getElementById('service-form-keyword').value);
    formData.append('tag', document.getElementById('service-form-tag').value);

    const imageFile = document.getElementById('service-form-image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = id ? `${API_BASE_URL}/services/${id}` : `${API_BASE_URL}/services`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, { method, body: formData });
        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || 'Failed to save service.');
            return;
        }
        closeAdminModal('service-form-modal');
        resetServiceForm();
        loadAdminServices();
    } catch {
        alert('Network error while saving service.');
    }
}

/* -------------------------------------
   10. Admin Testimonials CRUD
------------------------------------- */
function resetTestimonialForm() {
    document.getElementById('testimonial-form-id').value = '';
    document.getElementById('testimonial-form-author').value = '';
    document.getElementById('testimonial-form-company').value = '';
    document.getElementById('testimonial-form-content').value = '';
    document.getElementById('testimonial-form-title').innerText = 'Record Testimonial';
}

async function loadAdminTestimonials() {
    const tbody = document.getElementById('testimonials-crud-table-body');
    const statEl = document.getElementById('stat-total-testimonials');
    if (!tbody) return;

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/admin/all?token=${token}`);
        if (!response.ok) throw new Error('Failed');
        const testimonials = await response.json();
        if (statEl) statEl.innerText = testimonials.length;

        if (!testimonials.length) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No testimonials recorded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = testimonials.map(t => `
            <tr>
                <td>${t.id}</td>
                <td>${t.author_name}</td>
                <td>${t.company}</td>
                <td>${t.content.slice(0, 60)}${t.content.length > 60 ? '...' : ''}</td>
                <td>
                    <button type="button" class="btn-edit btn-sm" onclick="editTestimonial(${t.id})">Edit</button>
                    <button type="button" class="btn-delete btn-sm" onclick="deleteTestimonial(${t.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:red;padding:20px;">Failed to load testimonials.</td></tr>';
    }
}

async function editTestimonial(id) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/admin/all?token=${token}`);
        if (!response.ok) throw new Error('Failed');
        const testimonials = await response.json();
        const t = testimonials.find(item => item.id == id);
        if (!t) throw new Error('Not found');

        document.getElementById('testimonial-form-id').value = t.id;
        document.getElementById('testimonial-form-author').value = t.author_name;
        document.getElementById('testimonial-form-company').value = t.company;
        document.getElementById('testimonial-form-content').value = t.content;
        document.getElementById('testimonial-form-title').innerText = 'Edit Testimonial';
        openAdminModal('testimonial-form-modal');
    } catch (err) {
        console.error(err);
        alert('Could not load testimonial for editing.');
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Delete this testimonial permanently?')) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/testimonials/${id}?token=${token}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        loadAdminTestimonials();
    } catch {
        alert('Failed to delete testimonial.');
    }
}

async function handleTestimonialFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const id = document.getElementById('testimonial-form-id').value;
    const payload = {
        author_name: document.getElementById('testimonial-form-author').value,
        company: document.getElementById('testimonial-form-company').value,
        content: document.getElementById('testimonial-form-content').value,
    };

    const url = id
        ? `${API_BASE_URL}/testimonials/${id}?token=${token}`
        : `${API_BASE_URL}/testimonials?token=${token}`;
    const method = id ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const data = await response.json();
        if (!response.ok) {
            let errorMsg = 'Failed to save testimonial.';
            if (data.detail) {
                errorMsg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
            }
            alert(errorMsg);
            return;
        }
        closeAdminModal('testimonial-form-modal');
        resetTestimonialForm();
        loadAdminTestimonials();
    } catch (err) {
        console.error(err);
        alert('Network error while saving testimonial.');
    }
}

/* -------------------------------------
   11. Admin Carousel Settings
------------------------------------- */
async function loadCarouselSettings() {
    const form = document.getElementById('homepage-carousel-form');
    if (!form) return;

    try {
        const response = await fetch(`${API_BASE_URL}/carousel-slides`);
        if (!response.ok) return;
        const slides = await response.json();
        slides.forEach((slide, i) => {
            const idx = i + 1;
            const heading = document.getElementById(`slide${idx}-heading`);
            const desc = document.getElementById(`slide${idx}-description`);
            const cta = document.getElementById(`slide${idx}-cta`);
            if (heading) heading.value = slide.heading;
            if (desc) desc.value = slide.description;
            if (cta) cta.value = slide.cta_text;
        });
    } catch {
        /* keep default form values */
    }
}

async function handleCarouselFormSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const slides = [];
    for (let i = 1; i <= 4; i++) {
        slides.push({
            heading: document.getElementById(`slide${i}-heading`).value,
            description: document.getElementById(`slide${i}-description`).value,
            cta_text: document.getElementById(`slide${i}-cta`).value,
        });
    }

    try {
        const response = await fetch(`${API_BASE_URL}/carousel-slides/bulk?token=${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slides }),
        });
        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || 'Failed to update carousel.');
            return;
        }
        alert('Carousel slides updated successfully.');
    } catch {
        alert('Network error while saving carousel.');
    }
}

/* -------------------------------------
   12. Admin Company Settings
------------------------------------- */
async function loadCompanySettingsForm() {
    const form = document.getElementById('company-settings-form');
    if (!form) return;

    try {
        const response = await fetch(`${API_BASE_URL}/company-settings`);
        if (!response.ok) return;
        const settings = await response.json();
        document.getElementById('setting-company-name').value = settings.company_name;
        document.getElementById('setting-email').value = settings.email;
        document.getElementById('setting-phone').value = settings.phone;
        document.getElementById('setting-address').value = settings.address;
    } catch {
        /* keep defaults */
    }
}

async function loadCompanySettings() {
    try {
        const response = await fetch(`${API_BASE_URL}/company-settings`);
        if (!response.ok) return;
        const settings = await response.json();

        // Update Footer Contact Information
        document.querySelectorAll('.footer-contact address').forEach(addr => {
            addr.innerHTML = `Email: ${settings.email}<br>Phone: ${settings.phone}<br>Address: ${settings.address}`;
        });

        // Update Copyright Name
        document.querySelectorAll('.footer-bottom p').forEach(p => {
            p.innerHTML = `&copy; ${new Date().getFullYear()} ${settings.company_name}. All rights reserved.`;
        });

        // Update Contact Page Address
        document.querySelectorAll('.contact-address').forEach(addr => {
            addr.innerHTML = `<strong>${settings.company_name}</strong><br>${settings.address}<br><br><strong>Email:</strong> <a href="mailto:${settings.email}">${settings.email}</a><br><strong>Phone:</strong> ${settings.phone}`;
        });

        // Update Logos
        document.querySelectorAll('#nav-logo').forEach(img => {
            if (settings.logo_path) img.src = settings.logo_path;
        });
    } catch {
        /* keep static defaults */
    }
}

async function handleCompanySettingsSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const formData = new FormData();
    formData.append('token', token);
    formData.append('company_name', document.getElementById('setting-company-name').value);
    formData.append('email', document.getElementById('setting-email').value);
    formData.append('phone', document.getElementById('setting-phone').value);
    formData.append('address', document.getElementById('setting-address').value);

    const logoFile = document.getElementById('setting-logo-upload').files[0];
    if (logoFile) formData.append('logo', logoFile);

    try {
        const response = await fetch(`${API_BASE_URL}/company-settings`, { method: 'PUT', body: formData });
        const data = await response.json();
        if (!response.ok) {
            alert(data.detail || 'Failed to save settings.');
            return;
        }
        alert('Company settings updated successfully.');
    } catch {
        alert('Network error while saving settings.');
    }
}

/* -------------------------------------
   13. Admin Inquiry Edit/Delete
------------------------------------- */
async function editInquiry(id) {
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/inquiries?token=${token}`);
        if (!response.ok) throw new Error('Failed');
        const inquiries = await response.json();
        const inq = inquiries.find(item => item.id === id);
        if (!inq) throw new Error('Not found');

        document.getElementById('inquiry-edit-id').value = inq.id;
        document.getElementById('inquiry-edit-name').value = inq.name;
        document.getElementById('inquiry-edit-email').value = inq.email;
        document.getElementById('inquiry-edit-subject').value = inq.subject;
        document.getElementById('inquiry-edit-message').value = inq.message;
        openAdminModal('inquiry-edit-modal');
    } catch {
        alert('Could not load inquiry for editing.');
    }
}

async function deleteInquiry(id) {
    if (!confirm('Delete this inquiry permanently?')) return;
    const token = localStorage.getItem('adminToken');
    try {
        const response = await fetch(`${API_BASE_URL}/inquiries/${id}?token=${token}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Delete failed');
        loadDashboardData();
    } catch {
        alert('Failed to delete inquiry.');
    }
}

async function handleInquiryEditSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const id = document.getElementById('inquiry-edit-id').value;
    const payload = {
        name: document.getElementById('inquiry-edit-name').value,
        email: document.getElementById('inquiry-edit-email').value,
        subject: document.getElementById('inquiry-edit-subject').value,
        message: document.getElementById('inquiry-edit-message').value,
    };

    try {
        const response = await fetch(`${API_BASE_URL}/inquiries/${id}?token=${token}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const data = await response.json();
            alert(data.detail || 'Failed to update inquiry.');
            return;
        }
        closeAdminModal('inquiry-edit-modal');
        loadDashboardData();
    } catch {
        alert('Network error while updating inquiry.');
    }
}

/* -------------------------------------
   8. Global Modal Functions
------------------------------------- */
function openModal() {
    const modal = document.getElementById('inquiry-modal-overlay');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; 
        }, 10);
    }
}

function closeModal() {
    const modal = document.getElementById('inquiry-modal-overlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
}
