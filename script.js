// ===== Mobile Navigation Toggle =====
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('active');
});

// Close mobile nav when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('active');
  });
});

// ===== Navbar Shadow on Scroll =====
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
});

// ===== Calendly Fallback =====
// Show fallback message if Calendly widget doesn't load
// (e.g., placeholder URL or no internet)
window.addEventListener('load', () => {
  const fallback = document.getElementById('calendlyFallback');
  const widget = document.querySelector('.calendly-inline-widget');

  if (fallback) {
    // Check if the Calendly URL is still the placeholder
    const calendlyUrl = widget?.getAttribute('data-url') || '';
    if (calendlyUrl.includes('YOUR-CALENDLY-LINK')) {
      fallback.classList.add('visible');
      if (widget) widget.style.display = 'none';
    }
  }
});

// ===== Contact Form Handling =====
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const formData = new FormData(contactForm);
  const data = Object.fromEntries(formData);

  // Show a success message (replace with actual form submission logic)
  const wrapper = contactForm.closest('.contact-form-wrapper');
  wrapper.innerHTML = `
    <div style="text-align: center; padding: 40px 0;">
      <div style="font-size: 3rem; margin-bottom: 16px;">&#9989;</div>
      <h3 style="font-size: 1.3rem; font-weight: 700; color: #0f172a; margin-bottom: 8px;">
        Message Sent!
      </h3>
      <p style="color: #64748b;">
        Thanks, ${data.name}! We'll get back to you as soon as possible.
      </p>
    </div>
  `;
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
