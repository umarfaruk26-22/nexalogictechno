/* admin.js */

const API_BASE = window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1') || window.location.protocol === 'file:'
    ? 'http://localhost:8000/api' 
    : '/api';

function getAdminToken() {
    return localStorage.getItem('adminToken');
}

function checkAdminAuth() {
    const token = getAdminToken();
    if (!token && !window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-login.html';
    }
    if (token && window.location.pathname.includes('admin-login.html')) {
        window.location.href = 'admin-dashboard.html';
    }
}

// Global Headers
function authHeaders() {
    return {
        'Authorization': `Bearer ${getAdminToken()}` // or form data depending on implementation
    };
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();

    // Logout
    const logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('adminToken');
            window.location.href = 'admin-login.html';
        });
    }

    // Login Form
    const loginForm = document.getElementById('admin-login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('admin-username').value;
            const pass = document.getElementById('admin-password').value;
            try {
                const res = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password: pass })
                });
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('adminToken', data.token);
                    window.location.href = 'admin-dashboard.html';
                } else {
                    alert('Invalid credentials');
                }
            } catch (err) {
                alert('Login failed');
            }
        });
    }

    if (window.location.pathname.includes('admin-dashboard.html')) {
        loadDashboardData();
    }
});

// Load Dashboard Data
async function loadDashboardData() {
    await Promise.all([
        loadServicesCrud(),
        loadInquiriesCrud(),
        loadTestimonialsCrud()
    ]);
}

// ---------------------------------
// Services CRUD
// ---------------------------------
async function loadServicesCrud() {
    const tbody = document.getElementById('services-crud-table-body');
    if (!tbody) return;
    try {
        const res = await fetch(`${API_BASE}/services/admin/all?token=${getAdminToken()}`);
        if (!res.ok) throw new Error();
        const services = await res.json();
        
        document.getElementById('stat-active-services').textContent = services.length;
        
        if (services.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No services found.</td></tr>';
            return;
        }

        tbody.innerHTML = services.map(s => `
            <tr>
                <td>${s.id}</td>
                <td>${s.title}</td>
                <td>${s.slug}</td>
                <td>${s.tag}</td>
                <td>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-edit" onclick="editService(${s.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteService(${s.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Failed to load services.</td></tr>';
    }
}

async function deleteService(id) {
    if (!confirm('Are you sure you want to delete this service?')) return;
    try {
        const res = await fetch(`${API_BASE}/services/${id}?token=${getAdminToken()}`, { method: 'DELETE' });
        if (res.ok) {
            loadServicesCrud();
        } else {
            alert('Failed to delete service');
        }
    } catch {
        alert('Error deleting service');
    }
}

// Placeholder for editService
window.editService = async function(id) {
    alert('Edit service functionality. Populate form and open modal.');
}

// ---------------------------------
// Inquiries CRUD
// ---------------------------------
async function loadInquiriesCrud() {
    const tbody = document.getElementById('inquiries-crud-table-body');
    if (!tbody) return;
    try {
        const res = await fetch(`${API_BASE}/inquiries?token=${getAdminToken()}`);
        if (!res.ok) throw new Error();
        const inquiries = await res.json();
        
        document.getElementById('stat-total-inquiries').textContent = inquiries.length;
        
        if (inquiries.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">No inquiries found.</td></tr>';
            return;
        }

        tbody.innerHTML = inquiries.map(i => `
            <tr>
                <td>${i.id}</td>
                <td>${i.name}</td>
                <td>${i.email}</td>
                <td>${i.subject}</td>
                <td>${i.created_at.split(' ')[0]}</td>
                <td>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-edit" onclick="editInquiry(${i.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteInquiry(${i.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center">Failed to load inquiries.</td></tr>';
    }
}



// ---------------------------------
// Testimonials CRUD
// ---------------------------------
async function loadTestimonialsCrud() {
    const tbody = document.querySelector('#testimonials-crud-table tbody');
    if (!tbody) return;
    try {
        const res = await fetch(`${API_BASE}/testimonials/admin/all?token=${getAdminToken()}`);
        if (!res.ok) throw new Error();
        const items = await res.json();
        
        document.getElementById('stat-total-testimonials').textContent = items.length;
        
        if (items.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">No testimonials found.</td></tr>';
            return;
        }

        tbody.innerHTML = items.map(i => `
            <tr>
                <td>${i.id}</td>
                <td>${i.author_name}</td>
                <td>${i.company}</td>
                <td>${i.content.substring(0, 30)}...</td>
                <td>
                    <div style="display: flex; gap: 8px; align-items: center;">
                        <button class="btn-edit" onclick="editTestimonial(${i.id})">Edit</button>
                        <button class="btn-delete" onclick="deleteTestimonial(${i.id})">Delete</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center">Failed to load testimonials.</td></tr>';
    }
}

async function deleteTestimonial(id) {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;
    try {
        const res = await fetch(`${API_BASE}/testimonials/${id}?token=${getAdminToken()}`, { method: 'DELETE' });
        if (res.ok) {
            loadTestimonialsCrud();
        } else {
            alert('Failed to delete testimonial');
        }
    } catch {
        alert('Error deleting testimonial');
    }
}

