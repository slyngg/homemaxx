// HomeMaxx - Core JavaScript

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initPropertyGrid();
  initContactForm();
  initScrollEffects();
  if (typeof ghlWebForm !== 'undefined') initGoHighLevel();
});

// Navigation
function initNavigation() {
  const menuToggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');
  
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      nav.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const targetPos = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;
        window.scrollTo({ top: targetPos, behavior: 'smooth' });
      }
    });
  });
}

// Property Grid
function initPropertyGrid() {
  const properties = [
    {
      id: 1,
      address: "123 Oasis Springs Dr, Las Vegas, NV",
      price: 350000,
      beds: 3,
      baths: 2,
      sqft: 1850,
      image: 'https://placehold.co/600x400/0D1117/FFFFFF?text=Property+1'
    },
    // Add more properties as needed
  ];

  const grid = document.getElementById('property-grid');
  if (!grid) return;

  grid.innerHTML = properties.map(prop => `
    <div class="property-card">
      <img src="${prop.image}" alt="${prop.address}" class="property-image">
      <div class="property-details">
        <h3>${prop.address}</h3>
        <p class="price">$${prop.price.toLocaleString()}</p>
        <div class="property-meta">
          <span>${prop.beds} Beds</span>
          <span>${prop.baths} Baths</span>
          <span>${prop.sqft} sqft</span>
        </div>
        <button class="btn btn-primary" data-id="${prop.id}">View Details</button>
      </div>
    </div>
  `).join('');
}

// Contact Form
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Basic validation
    const name = form.querySelector('[name="name"]');
    const email = form.querySelector('[name="email"]');
    const phone = form.querySelector('[name="phone"]');
    
    if (!name.value || !email.value || !phone.value) {
      showToast('Please fill in all required fields', 'error');
      return;
    }
    
    if (!isValidEmail(email.value)) {
      showToast('Please enter a valid email', 'error');
      return;
    }
    
    // Submit form (simulated)
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
      await simulateApiCall(new FormData(form));
      showToast('Message sent successfully!', 'success');
      form.reset();
    } catch (error) {
      showToast('Error sending message', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

// Scroll Effects
function initScrollEffects() {
  const fadeElements = document.querySelectorAll('.fade-in');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  
  fadeElements.forEach(el => observer.observe(el));
}

// GoHighLevel Integration
function initGoHighLevel() {
  // Initialize GoHighLevel web form
  ghlWebForm.init();
  
  // Additional GHL event listeners can be added here
  document.addEventListener('ghl:formSubmitted', (e) => {
    console.log('Form submitted to GoHighLevel', e.detail);
  });
}

// Utility Functions
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }, 100);
}

// Simulate API call
function simulateApiCall(data) {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Form submitted:', Object.fromEntries(data));
      resolve({ success: true });
    }, 1000);
  });
}
