// Sample property data
const properties = [
  {
    id: 1,
    title: 'Modern Family Home',
    address: '123 Main St, Anytown, USA',
    price: 350000,
    beds: 4,
    baths: 3,
    sqft: 2500,
    description: 'Beautiful modern family home with open floor plan and large backyard. Recently renovated with high-end finishes throughout.',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 2,
    title: 'Downtown Loft',
    address: '456 Center Ave, Cityville, USA',
    price: 275000,
    beds: 2,
    baths: 2,
    sqft: 1800,
    description: 'Stylish downtown loft with exposed brick and high ceilings. Walking distance to restaurants and entertainment.',
    image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  },
  {
    id: 3,
    title: 'Suburban Ranch',
    address: '789 Oak Ln, Suburbia, USA',
    price: 425000,
    beds: 3,
    baths: 2.5,
    sqft: 3200,
    description: 'Spacious ranch home on a large lot. Perfect for families with a finished basement and large backyard.',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
  }
];

// DOM Elements
const propertyGrid = document.getElementById('property-grid');
const propertyModal = document.getElementById('property-modal');
const modalContent = document.querySelector('.modal-content');
const contactForm = document.getElementById('contact-form');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mainNav = document.querySelector('.main-nav');
const header = document.querySelector('.site-header');

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(amount);
};

// Render property cards
const renderProperties = () => {
  if (!propertyGrid) return;
  
  propertyGrid.innerHTML = properties.map(property => `
    <div class="property-card" data-id="${property.id}">
      <div class="property-image-container">
        <img src="${property.image}" alt="${property.title}" class="property-image">
      </div>
      <div class="property-details">
        <h3>${property.title}</h3>
        <p class="property-address">${property.address}</p>
        <div class="property-price">${formatCurrency(property.price)}</div>
        <div class="property-meta">
          <span>${property.beds} <i class="fas fa-bed"></i></span>
          <span>${property.baths} <i class="fas fa-bath"></i></span>
          <span>${property.sqft.toLocaleString()} sqft</span>
        </div>
        <button class="btn btn-outline btn-block view-details" data-id="${property.id}">View Details</button>
      </div>
    </div>
  `).join('');
};

// Show property modal
const showPropertyModal = (id) => {
  const property = properties.find(p => p.id === id);
  if (!property) return;
  
  modalContent.innerHTML = `
    <button class="close-modal" aria-label="Close modal">&times;</button>
    <div class="property-modal-grid">
      <div class="property-modal-image">
        <img src="${property.image}" alt="${property.title}">
      </div>
      <div class="property-modal-details">
        <h2>${property.title}</h2>
        <p class="property-address">${property.address}</p>
        <div class="property-price">${formatCurrency(property.price)}</div>
        <div class="property-meta">
          <span>${property.beds} <i class="fas fa-bed"></i> Beds</span>
          <span>${property.baths} <i class="fas fa-bath"></i> Baths</span>
          <span>${property.sqft.toLocaleString()} sqft</span>
        </div>
        <div class="property-description">
          <h4>Property Description</h4>
          <p>${property.description}</p>
        </div>
        <div class="property-actions">
          <button class="btn btn-primary btn-lg schedule-tour" data-id="${property.id}">Schedule a Tour</button>
          <button class="btn btn-outline btn-lg make-offer" data-id="${property.id}">Make an Offer</button>
        </div>
      </div>
    </div>
  `;
  
  propertyModal.classList.add('active');
  document.body.style.overflow = 'hidden';
};

// Close modal
const closeModal = () => {
  propertyModal.classList.remove('active');
  document.body.style.overflow = '';
};

// Show toast notification
const showToast = (message, type = 'success') => {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger reflow
  toast.offsetHeight;
  
  // Add show class
  toast.classList.add('show');
  
  // Remove toast after 5 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 5000);
};

// Handle contact form submission
const handleContactSubmit = (e) => {
  e.preventDefault();
  
  // Get form data
  const formData = new FormData(contactForm);
  const formValues = Object.fromEntries(formData.entries());
  
  // Simple validation
  if (!formValues.name || !formValues.email || !formValues.phone) {
    showToast('Please fill in all required fields', 'error');
    return;
  }
  
  // Here you would typically send the form data to your server
  console.log('Form submitted:', formValues);
  
  // Show success message
  showToast('Your message has been sent! We\'ll get back to you soon.');
  
  // Reset form
  contactForm.reset();
};

// Toggle mobile menu
const toggleMobileMenu = () => {
  mainNav.classList.toggle('active');
  document.body.classList.toggle('menu-open');
};

// Close mobile menu when clicking on a link
const closeMobileMenu = (e) => {
  if (e.target.tagName === 'A') {
    mainNav.classList.remove('active');
    document.body.classList.remove('menu-open');
  }
};

// Handle header scroll effect
const handleScroll = () => {
  if (window.scrollY > 50) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
};

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const headerOffset = header.offsetHeight;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Render properties
  renderProperties();
  
  // Property grid click event delegation
  if (propertyGrid) {
    propertyGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.property-card');
      const viewDetailsBtn = e.target.closest('.view-details');
      
      if (card && !viewDetailsBtn) {
        const id = parseInt(card.dataset.id);
        showPropertyModal(id);
      } else if (viewDetailsBtn) {
        e.preventDefault();
        const id = parseInt(viewDetailsBtn.dataset.id);
        showPropertyModal(id);
      }
    });
  }
  
  // Modal close events
  propertyModal.addEventListener('click', (e) => {
    if (e.target === propertyModal || e.target.classList.contains('close-modal')) {
      closeModal();
    }
  });
  
  // Contact form submission
  if (contactForm) {
    contactForm.addEventListener('submit', handleContactSubmit);
  }
  
  // Mobile menu toggle
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
  }
  
  // Close mobile menu when clicking on a link
  if (mainNav) {
    mainNav.addEventListener('click', closeMobileMenu);
  }
  
  // Header scroll effect
  window.addEventListener('scroll', handleScroll);
  
  // Initialize header class
  handleScroll();
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && propertyModal.classList.contains('active')) {
    closeModal();
  }
});
