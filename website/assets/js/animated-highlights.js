// Animated Value Highlights
class AnimatedHighlights {
  constructor() {
    this.observers = [];
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupCounters();
  }

  setupIntersectionObserver() {
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateElement(entry.target);
        }
      });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.value-highlight, .percentage-counter, .stat-number').forEach(el => {
      this.observer.observe(el);
    });
  }

  setupCounters() {
    // Add counter data to elements
    const counters = [
      { selector: '.savings-percentage', target: 6, suffix: '%', duration: 2000 },
      { selector: '.commission-savings', target: 15000, prefix: '$', duration: 2500 },
      { selector: '.days-to-close', target: 7, suffix: ' days', duration: 1500 },
      { selector: '.cash-offers', target: 500, suffix: '+', duration: 2000 }
    ];

    counters.forEach(counter => {
      const elements = document.querySelectorAll(counter.selector);
      elements.forEach(el => {
        el.dataset.target = counter.target;
        el.dataset.prefix = counter.prefix || '';
        el.dataset.suffix = counter.suffix || '';
        el.dataset.duration = counter.duration;
      });
    });
  }

  animateElement(element) {
    if (element.classList.contains('animated')) return;
    
    element.classList.add('animated');

    if (element.classList.contains('value-highlight')) {
      this.animateValueHighlight(element);
    } else if (element.classList.contains('percentage-counter') || element.classList.contains('stat-number')) {
      this.animateCounter(element);
    }
  }

  animateValueHighlight(element) {
    element.classList.add('animate');
    
    // Add pulse effect
    setTimeout(() => {
      element.style.transform = 'scale(1.1)';
      setTimeout(() => {
        element.style.transform = 'scale(1)';
      }, 200);
    }, 100);
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.target) || 0;
    const duration = parseInt(element.dataset.duration) || 2000;
    const prefix = element.dataset.prefix || '';
    const suffix = element.dataset.suffix || '';
    
    let current = 0;
    const increment = target / (duration / 16); // 60fps
    const startTime = performance.now();

    const updateCounter = (timestamp) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      current = Math.floor(target * easeOutQuart);
      
      element.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
        // Add completion effect
        element.style.transform = 'scale(1.05)';
        setTimeout(() => {
          element.style.transform = 'scale(1)';
        }, 200);
      }
    };

    requestAnimationFrame(updateCounter);
  }

  // Method to manually trigger animations
  triggerAnimation(selector) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(el => {
      el.classList.remove('animated');
      this.animateElement(el);
    });
  }

  // Clean up observers
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.animatedHighlights = new AnimatedHighlights();
});

// Export for manual usage
window.AnimatedHighlights = AnimatedHighlights;
