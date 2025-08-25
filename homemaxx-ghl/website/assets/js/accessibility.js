document.addEventListener('DOMContentLoaded', function() {
  // Add focus styles for keyboard navigation
  function handleFirstTab(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
      window.removeEventListener('keydown', handleFirstTab);
    }
  }
  
  window.addEventListener('keydown', handleFirstTab);
  
  // Add focus-visible polyfill for better focus management
  document.body.classList.add('js-focus-visible');
  
  // Handle focus for modal dialogs
  const modals = document.querySelectorAll('[role="dialog"]');
  
  modals.forEach(modal => {
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusableContent = modal.querySelectorAll(focusableElements);
    const firstFocusableElement = focusableContent[0];
    const lastFocusableElement = focusableContent[focusableContent.length - 1];
    
    // Trap focus inside modal when it's open
    modal.addEventListener('keydown', function(e) {
      if (e.key === 'Tab') {
        if (e.shiftKey) { // if shift key pressed for shift + tab combination
          if (document.activeElement === firstFocusableElement) {
            lastFocusableElement.focus(); // add focus to the last focusable element
            e.preventDefault();
          }
        } else { // if tab key is pressed only
          if (document.activeElement === lastFocusableElement) { // if focused has reached to last focusable element then focus first focusable element after pressing tab
            firstFocusableElement.focus(); // add focus to the first focusable element
            e.preventDefault();
          }
        }
      }
    });
  });
  
  // Add accessible dropdowns
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const button = dropdown.querySelector('button[aria-expanded]');
    const menu = dropdown.querySelector('ul');
    
    if (button && menu) {
      button.addEventListener('click', function() {
        const expanded = this.getAttribute('aria-expanded') === 'true' || false;
        this.setAttribute('aria-expanded', !expanded);
        menu.hidden = expanded;
      });
      
      // Close when clicking outside
      document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
          button.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        }
      });
      
      // Handle keyboard navigation
      const menuItems = menu.querySelectorAll('a, button');
      const firstItem = menuItems[0];
      const lastItem = menuItems[menuItems.length - 1];
      
      button.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault();
          const expanded = this.getAttribute('aria-expanded') === 'true' || false;
          
          if (!expanded) {
            this.setAttribute('aria-expanded', 'true');
            menu.hidden = false;
            
            if (e.key === 'ArrowDown') {
              firstItem.focus();
            } else if (e.key === 'ArrowUp') {
              lastItem.focus();
            }
          }
        } else if (e.key === 'Escape') {
          this.setAttribute('aria-expanded', 'false');
          menu.hidden = true;
        }
      });
      
      menuItems.forEach((item, index) => {
        item.addEventListener('keydown', function(e) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            const nextItem = menuItems.item(index + 1) || firstItem;
            nextItem.focus();
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prevItem = menuItems.item(index - 1) || lastItem;
            prevItem.focus();
          } else if (e.key === 'Escape') {
            button.focus();
            button.setAttribute('aria-expanded', 'false');
            menu.hidden = true;
          }
        });
      });
    }
  });
  
  // Add skip link functionality
  const skipLink = document.querySelector('.skip-link');
  const mainContent = document.getElementById('main-content');
  
  if (skipLink && mainContent) {
    skipLink.addEventListener('click', function(e) {
      e.preventDefault();
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      setTimeout(() => mainContent.removeAttribute('tabindex'), 1000);
    });
  }
  
  // Add focus styles for keyboard navigation
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      document.body.classList.add('user-is-tabbing');
    }
  });
  
  document.addEventListener('mousedown', function() {
    document.body.classList.remove('user-is-tabbing');
  });
});
