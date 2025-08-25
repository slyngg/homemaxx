class CookieConsent {
  constructor() {
    this.consentKey = 'homemaxx_cookie_consent';
    this.consentData = this.getStoredConsent();
    this.init();
  }

  init() {
    // Only show banner if no consent has been given
    if (!this.consentData) {
      this.showConsentBanner();
    } else {
      this.applyConsent();
    }
  }

  getStoredConsent() {
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  }

  saveConsent(preferences) {
    const consentData = {
      timestamp: Date.now(),
      preferences: preferences,
      version: '1.0'
    };
    
    try {
      localStorage.setItem(this.consentKey, JSON.stringify(consentData));
      this.consentData = consentData;
    } catch (e) {
      console.error('Failed to save consent preferences:', e);
    }
  }

  showConsentBanner() {
    const banner = document.createElement('div');
    banner.id = 'cookie-consent-banner';
    banner.innerHTML = `
      <div class="cookie-banner">
        <div class="cookie-content">
          <div class="cookie-text">
            <h3>Your Privacy Matters</h3>
            <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage your preferences below.</p>
          </div>
          <div class="cookie-actions">
            <button id="cookie-settings" class="btn btn-secondary">Manage Preferences</button>
            <button id="cookie-accept-all" class="btn btn-primary">Accept All</button>
            <button id="cookie-reject-all" class="btn btn-outline">Reject All</button>
          </div>
        </div>
      </div>
      
      <div id="cookie-preferences-modal" class="cookie-modal" style="display: none;">
        <div class="cookie-modal-content">
          <div class="cookie-modal-header">
            <h2>Cookie Preferences</h2>
            <button id="cookie-modal-close" class="close-btn">&times;</button>
          </div>
          <div class="cookie-modal-body">
            <div class="cookie-category">
              <div class="cookie-category-header">
                <h3>Essential Cookies</h3>
                <label class="toggle-switch">
                  <input type="checkbox" id="essential-cookies" checked disabled>
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <p>Required for basic website functionality. These cannot be disabled.</p>
            </div>
            
            <div class="cookie-category">
              <div class="cookie-category-header">
                <h3>Analytics Cookies</h3>
                <label class="toggle-switch">
                  <input type="checkbox" id="analytics-cookies">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <p>Help us understand how visitors interact with our website by collecting anonymous information.</p>
            </div>
            
            <div class="cookie-category">
              <div class="cookie-category-header">
                <h3>Marketing Cookies</h3>
                <label class="toggle-switch">
                  <input type="checkbox" id="marketing-cookies">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <p>Used to deliver personalized advertisements and track advertising effectiveness.</p>
            </div>
            
            <div class="cookie-category">
              <div class="cookie-category-header">
                <h3>Functional Cookies</h3>
                <label class="toggle-switch">
                  <input type="checkbox" id="functional-cookies">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              <p>Enable enhanced functionality like language preferences and form data persistence.</p>
            </div>
          </div>
          <div class="cookie-modal-footer">
            <button id="cookie-save-preferences" class="btn btn-primary">Save Preferences</button>
            <a href="pages/legal/privacy-policy.html" target="_blank">Privacy Policy</a>
          </div>
        </div>
      </div>
    `;

    // Add styles
    const styles = document.createElement('style');
    styles.textContent = `
      .cookie-banner {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(255, 255, 255, 0.98);
        backdrop-filter: blur(10px);
        border-top: 1px solid var(--border, #e5e7eb);
        box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        padding: 1.5rem;
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from { transform: translateY(100%); }
        to { transform: translateY(0); }
      }

      .cookie-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
      }

      .cookie-text h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--text, #111827);
      }

      .cookie-text p {
        margin: 0;
        color: var(--text-secondary, #374151);
        font-size: 0.875rem;
        line-height: 1.5;
      }

      .cookie-actions {
        display: flex;
        gap: 0.75rem;
        flex-shrink: 0;
      }

      .cookie-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
      }

      .cookie-modal-content {
        background: white;
        border-radius: 12px;
        max-width: 600px;
        width: 100%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      }

      .cookie-modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem 1.5rem 0;
        border-bottom: 1px solid var(--border, #e5e7eb);
        margin-bottom: 1.5rem;
      }

      .cookie-modal-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
        color: var(--text, #111827);
      }

      .close-btn {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--text-muted, #6b7280);
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .cookie-modal-body {
        padding: 0 1.5rem;
      }

      .cookie-category {
        margin-bottom: 1.5rem;
        padding: 1rem;
        border: 1px solid var(--border-light, #f3f4f6);
        border-radius: 8px;
      }

      .cookie-category-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
      }

      .cookie-category h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--text, #111827);
      }

      .cookie-category p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary, #374151);
        line-height: 1.5;
      }

      .toggle-switch {
        position: relative;
        display: inline-block;
        width: 44px;
        height: 24px;
      }

      .toggle-switch input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 24px;
      }

      .toggle-slider:before {
        position: absolute;
        content: "";
        height: 18px;
        width: 18px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
      }

      input:checked + .toggle-slider {
        background-color: var(--primary, #1a56ff);
      }

      input:checked + .toggle-slider:before {
        transform: translateX(20px);
      }

      input:disabled + .toggle-slider {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .cookie-modal-footer {
        padding: 1.5rem;
        border-top: 1px solid var(--border, #e5e7eb);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .cookie-modal-footer a {
        color: var(--primary, #1a56ff);
        text-decoration: none;
        font-size: 0.875rem;
      }

      .cookie-modal-footer a:hover {
        text-decoration: underline;
      }

      /* Button styles */
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 6px;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        border: none;
        transition: all 0.2s ease;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }

      .btn-primary {
        background: var(--primary, #1a56ff);
        color: white;
      }

      .btn-primary:hover {
        background: var(--primary-600, #1347e6);
      }

      .btn-secondary {
        background: var(--gray-100, #f3f4f6);
        color: var(--text, #111827);
      }

      .btn-secondary:hover {
        background: var(--gray-200, #e5e7eb);
      }

      .btn-outline {
        background: transparent;
        color: var(--text-secondary, #374151);
        border: 1px solid var(--border, #e5e7eb);
      }

      .btn-outline:hover {
        background: var(--gray-50, #f9fafb);
      }

      /* Responsive design */
      @media (max-width: 768px) {
        .cookie-content {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .cookie-actions {
          width: 100%;
          flex-wrap: wrap;
        }

        .cookie-actions .btn {
          flex: 1;
          min-width: 120px;
        }

        .cookie-modal-content {
          margin: 1rem;
          max-height: calc(100vh - 2rem);
        }
      }
    `;

    document.head.appendChild(styles);
    document.body.appendChild(banner);

    this.bindEvents();
  }

  bindEvents() {
    const acceptAllBtn = document.getElementById('cookie-accept-all');
    const rejectAllBtn = document.getElementById('cookie-reject-all');
    const settingsBtn = document.getElementById('cookie-settings');
    const modal = document.getElementById('cookie-preferences-modal');
    const closeBtn = document.getElementById('cookie-modal-close');
    const saveBtn = document.getElementById('cookie-save-preferences');

    acceptAllBtn?.addEventListener('click', () => {
      this.acceptAll();
    });

    rejectAllBtn?.addEventListener('click', () => {
      this.rejectAll();
    });

    settingsBtn?.addEventListener('click', () => {
      modal.style.display = 'flex';
    });

    closeBtn?.addEventListener('click', () => {
      modal.style.display = 'none';
    });

    saveBtn?.addEventListener('click', () => {
      this.saveCustomPreferences();
    });

    // Close modal when clicking outside
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  acceptAll() {
    const preferences = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true
    };
    
    this.saveConsent(preferences);
    this.hideBanner();
    this.applyConsent();
  }

  rejectAll() {
    const preferences = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false
    };
    
    this.saveConsent(preferences);
    this.hideBanner();
    this.applyConsent();
  }

  saveCustomPreferences() {
    const preferences = {
      essential: true, // Always true
      analytics: document.getElementById('analytics-cookies')?.checked || false,
      marketing: document.getElementById('marketing-cookies')?.checked || false,
      functional: document.getElementById('functional-cookies')?.checked || false
    };
    
    this.saveConsent(preferences);
    this.hideBanner();
    document.getElementById('cookie-preferences-modal').style.display = 'none';
    this.applyConsent();
  }

  hideBanner() {
    const banner = document.getElementById('cookie-consent-banner');
    if (banner) {
      banner.style.animation = 'slideDown 0.3s ease-out forwards';
      setTimeout(() => banner.remove(), 300);
    }
  }

  applyConsent() {
    if (!this.consentData) return;

    const { preferences } = this.consentData;

    // Apply analytics consent
    if (preferences.analytics) {
      this.enableAnalytics();
    }

    // Apply marketing consent
    if (preferences.marketing) {
      this.enableMarketing();
    }

    // Apply functional consent
    if (preferences.functional) {
      this.enableFunctional();
    }
  }

  enableAnalytics() {
    // Enable Google Analytics, etc.
    console.log('Analytics enabled');
  }

  enableMarketing() {
    // Enable marketing pixels, etc.
    console.log('Marketing enabled');
  }

  enableFunctional() {
    // Enable functional cookies
    console.log('Functional cookies enabled');
  }

  // Public method to check consent
  hasConsent(category) {
    if (!this.consentData) return false;
    return this.consentData.preferences[category] || false;
  }

  // Public method to revoke consent
  revokeConsent() {
    localStorage.removeItem(this.consentKey);
    this.consentData = null;
    location.reload();
  }
}

// Add slideDown animation
const slideDownKeyframes = `
  @keyframes slideDown {
    from { transform: translateY(0); }
    to { transform: translateY(100%); }
  }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = slideDownKeyframes;
document.head.appendChild(styleSheet);

// Initialize cookie consent
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsent = new CookieConsent();
});

// Export for use in other scripts
window.CookieConsent = CookieConsent;
