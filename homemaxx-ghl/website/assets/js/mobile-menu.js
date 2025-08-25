document.addEventListener('DOMContentLoaded', function() {
  // Mobile menu toggle
  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mainNav = document.querySelector('.main-nav');
  const body = document.body;
  
  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', function() {
      this.classList.toggle('active');
      mainNav.classList.toggle('active');
      body.classList.toggle('menu-open');
      
      // Toggle aria-expanded for accessibility
      const isExpanded = this.getAttribute('aria-expanded') === 'true' || false;
      this.setAttribute('aria-expanded', !isExpanded);
      mainNav.setAttribute('aria-hidden', isExpanded);
    });
  }
  
  // Close mobile menu when clicking on a nav link
  const navLinks = document.querySelectorAll('.main-nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 1024) {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        body.classList.remove('menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
      }
    });
  });
  
  // Close menu when clicking outside
  document.addEventListener('click', function(e) {
    if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
      if (mainNav.classList.contains('active')) {
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        body.classList.remove('menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
      }
    }
  });
  
  // Handle window resize
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 1024) {
        // Reset mobile menu state on desktop
        mobileMenuToggle.classList.remove('active');
        mainNav.classList.remove('active');
        body.classList.remove('menu-open');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mainNav.setAttribute('aria-hidden', 'true');
      }
    }, 250);
  });
});
