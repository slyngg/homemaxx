// Resume Offer Functionality
class OfferResume {
  constructor() {
    this.storageKey = 'homemaxx_offer_progress';
    this.progress = this.getSavedProgress();
    this.init();
  }

  init() {
    this.setupResumeButton();
    this.checkForSavedProgress();
  }

  setupResumeButton() {
    // Find and setup the "Finish your offer today" button
    const resumeButton = document.querySelector('[data-resume-offer]');
    if (resumeButton) {
      resumeButton.addEventListener('click', (e) => {
        e.preventDefault();
        this.resumeOffer();
      });
    }

    // Also setup any buttons with specific text
    const buttons = document.querySelectorAll('button, a');
    buttons.forEach(btn => {
      const text = btn.textContent.toLowerCase();
      if (text.includes('finish your offer') || text.includes('resume') || text.includes('continue your deal')) {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.resumeOffer();
        });
        btn.style.cursor = 'pointer';
      }
    });
  }

  checkForSavedProgress() {
    if (this.progress && this.progress.address) {
      this.showResumeOption(this.progress);
    }
  }

  saveProgress(data) {
    try {
      const progressData = {
        ...data,
        timestamp: Date.now(),
        lastStep: data.currentStep || 0,
        address: data.address || data.propertyAddress // Ensure address is always saved
      };
      
      // If this is a new address, overwrite any existing progress
      const existingProgress = this.getSavedProgress();
      if (existingProgress && existingProgress.address && 
          progressData.address && 
          existingProgress.address !== progressData.address) {
        console.log('New address detected, overwriting previous progress');
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(progressData));
      console.log('Progress saved:', progressData);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }

  getSavedProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        // Check if progress is less than 24 hours old
        const hoursSinceLastSave = (Date.now() - data.timestamp) / (1000 * 60 * 60);
        if (hoursSinceLastSave < 24) {
          return data;
        } else {
          // Clear old progress
          this.clearProgress();
        }
      }
    } catch (error) {
      console.error('Failed to retrieve saved progress:', error);
    }
    return null;
  }

  clearProgress() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }

  showResumeOption(savedProgress) {
    // Create resume banner if it doesn't exist
    let resumeBanner = document.getElementById('resume-offer-banner');
    if (!resumeBanner) {
      resumeBanner = this.createBanner();
      
      // Insert at top of main content
      const main = document.querySelector('main') || document.body;
      main.insertBefore(resumeBanner, main.firstChild);
    }

    // Add styles
    this.addResumeStyles();
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.className = 'offer-banner';
    banner.innerHTML = `
      <div class="offer-banner-content">
        <span class="offer-banner-text">
          Finish your offer today
        </span>
        <span class="offer-banner-address">${this.progress.address}</span>
        <div class="cash-offer-indicator">
          ${this.progress.cashOfferClaimed ? 
            `<span class="cash-badge">💰 $${this.progress.cashAmount || 7500} INSTANT CASH</span>
             <span class="spots-text">7 spots left</span>` : 
            `<span class="cash-badge">💰 $7,500 INSTANT CASH</span>
             <span class="spots-text">7 spots left</span>`
          }
        </div>
      </div>
    `;

    // Enhanced click handler with proper navigation
    banner.addEventListener('click', () => {
      this.resumeOffer();
    });

    return banner;
  }

  addResumeStyles() {
    if (document.getElementById('resume-offer-styles')) return;

    const style = document.createElement('style');
    style.id = 'resume-offer-styles';
    style.textContent = `
      .offer-banner {
        background: linear-gradient(135deg, var(--primary-light), rgba(26, 86, 255, 0.1));
        border: 2px solid var(--primary);
        border-radius: 12px;
        margin: 1rem 0;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(26, 86, 255, 0.15);
        animation: slideInFromTop 0.5s ease-out;
      }

      .offer-banner-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .offer-banner-text {
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
      }

      .offer-banner-address {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .cash-offer-indicator {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .cash-badge {
        background: var(--primary);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }

      .spots-text {
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      @keyframes slideInFromTop {
        from {
          transform: translateY(-20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .offer-banner-content {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  resumeOffer() {
    const currentPage = window.location.pathname;
    const targetUrl = '/Users/moretticayden/Desktop/homemaxx/website/pages/get-offer.html';
    
    // Build URL with proper parameters
    const params = new URLSearchParams();
    
    if (this.progress.address) {
      params.set('address', this.progress.address);
    }
    
    if (this.progress.currentStep !== undefined) {
      params.set('step', this.progress.currentStep.toString());
    }
    
    if (this.progress.cashOfferClaimed) {
      params.set('cashOffer', 'true');
      params.set('amount', (this.progress.cashAmount || 7500).toString());
    }
    
    // Add resume flag
    params.set('resume', 'true');
    
    const fullUrl = `${targetUrl}?${params.toString()}`;
    
    // Navigate to funnel with proper parameters
    if (currentPage.includes('get-offer.html')) {
      // Already on funnel page, just update state
      window.location.search = params.toString();
    } else {
      // Navigate from homepage or other page
      window.location.href = fullUrl.replace('/Users/moretticayden/Desktop/homemaxx/website/', '');
    }
  }

  dismissResume() {
    const banner = document.getElementById('resume-offer-banner');
    if (banner) {
      banner.style.animation = 'slideOutToTop 0.3s ease-in forwards';
      setTimeout(() => {
        banner.remove();
      }, 300);
    }
    this.clearProgress();
  }

  // Method to be called from funnel to save progress
  updateProgress(step, data) {
    this.saveProgress({
      currentStep: step,
      ...data
    });
  }
}

// Add slide out animation
const slideOutStyle = document.createElement('style');
slideOutStyle.textContent = `
  @keyframes slideOutToTop {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(-20px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(slideOutStyle);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.offerResume = new OfferResume();
});

// Export for use in other scripts
window.OfferResume = OfferResume;
