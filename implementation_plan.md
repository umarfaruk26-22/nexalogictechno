# Dynamic UI & Admin Features Implementation Plan

This plan addresses all your requested features, including dynamic grids, new APIs for carousels and testimonials, and global UI enhancements.

## User Review Required
> [!IMPORTANT]
> **Carousel on all pages:** You mentioned "jaisa home page pr caraousal h vaisa hi har page par hona chahiye". Adding a full carousel to every page (About, Contact, Services) might be overwhelming for users and bad for SEO/UX. Do you want the **exact same sliding carousel** on all pages, or do you mean you want the **Hero Banner** on those pages to have the same premium look and feel as the homepage carousel? I recommend keeping the sliding carousel only on the Home page, and using static premium banners for other pages. Please confirm your preference.

## Proposed Changes

### Backend (Database & APIs)
- **[MODIFY] [models.py](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/backend/models.py)**
  - Add `Testimonial` model.
  - Add `CarouselSlide` model.
  - Add `CompanySetting` model.
- **[MODIFY] [main.py](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/backend/main.py)**
  - Add CRUD endpoints for `Testimonials`.
  - Add CRUD endpoints for `CarouselSlides`.
  - Add CRUD endpoints for `CompanySettings`.
  - Add `DELETE` and `PUT` endpoints for `Inquiries`.

### Frontend - Global UI & CSS
- **[MODIFY] [navbar-footer.css](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/css/navbar-footer.css)**
  - Fix navbar height so it remains consistent across all pages.
  - Increase the logo size in the navbar.
  - Add styling for footer social media icons (Instagram, LinkedIn, Facebook, WhatsApp) using their OG (original) brand colors.
- **[MODIFY] All HTML Pages (index, about, services, contact)**
  - Update footer HTML to include social icons and ensure the logo path is correct.

### Frontend - Specific Features
- **[MODIFY] [testimonials.js](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/js/testimonials.js)**
  - Implement auto-slide functionality (`setInterval`) for the Testimonials section.
  - Fetch testimonials dynamically from the new backend API.
- **[MODIFY] [about.html](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/about.html) & [about.css](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/css/about.css)**
  - Redesign the "NexaLogic in numbers" section to look premium, positioned right above the workspace gallery.
- **[MODIFY] [services.js](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/js/services.js)**
  - Add logic to assign a dynamic CSS class to the grid container based on the number of services (1, 2, 3, 4, 6) to achieve the requested column layouts (e.g., max 3 columns).
  - Add `#` symbol before service tags.
  - Inject keywords into the `<meta name="keywords">` tag for SEO on `service-detail.html`.
- **[MODIFY] [services.css](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/css/services.css)**
  - Add grid classes (`grid-1`, `grid-2`, `grid-3`) to handle dynamic column counts.

### Admin Dashboard Enhancements
- **[MODIFY] [admin-dashboard.html](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/admin-dashboard.html) & [admin-login.html](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/admin-login.html)**
  - Fix the logo path next to "Admin Panel" and on the login page to use `assets/images/logo.png`.
  - Add "Edit" and "Delete" buttons to the Inquiries table.
  - Update the "Keywords" input in the service form to explicitly state "comma-separated".
- **[MODIFY] [admin.css](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/css/admin.css)**
  - Style the Edit (Green) and Delete (Red) buttons for Services and Inquiries to make them attractive.
- **[MODIFY] [main.js](file:///c:/Users/umarf/OneDrive/Desktop/NexaLogic%20IT/frontend/assets/js/main.js)**
  - Wire up dynamic API calls for Carousel settings, Testimonial CRUD, Company Settings, and Inquiry Edit/Delete.

## Verification Plan
1. Start the backend server and ensure all new database tables are created automatically.
2. Login to the admin panel and test adding/editing/deleting Carousel slides, Testimonials, and Company settings.
3. Test editing and deleting Inquiries.
4. Add 1, 2, 3, 4, and 6 services to visually verify the dynamic grid layout.
5. Verify SEO keyword injection in the browser's elements inspector on `service-detail.html`.
6. Verify footer OG colored icons and consistent navbar sizes.
