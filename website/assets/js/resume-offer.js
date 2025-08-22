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
    console.log('Checking saved progress:', this.progress);
    
    // Clear any existing banner first
    const existingBanner = document.getElementById('resume-offer-banner');
    if (existingBanner) {
      existingBanner.remove();
    }
    
    // Only show banner if there's REAL survey progress beyond just address entry
    const hasRealProgress = this.progress && 
        this.progress.address && 
        (this.progress.currentStep > 1 || 
         this.progress.lastStep > 1 || 
         this.progress.propertyDetails ||
         this.progress.contactInfo ||
         this.progress.timeline);
         
    if (hasRealProgress) {
      console.log('Showing resume banner for real progress:', this.progress);
      this.showResumeOption(this.progress);
    } else {
      console.log('No real survey progress found, not showing banner');
      // Auto-clear minimal data that shouldn't trigger banner
      if (this.progress && this.progress.address && (!this.progress.currentStep || this.progress.currentStep <= 1)) {
        console.log('Auto-clearing minimal progress data');
        this.clearProgress();
      }
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
      this.progress = null;
    } catch (error) {
      console.error('Failed to clear progress:', error);
    }
  }

  showResumeOption(savedProgress) {
    // Create resume banner if it doesn't exist
    let resumeBanner = document.getElementById('resume-offer-banner');
    if (!resumeBanner) {
      resumeBanner = this.createBanner();
      
      // Insert below header, not at top of main content
      const header = document.querySelector('.site-header');
      const main = document.querySelector('main') || document.body;
      
      if (header && header.nextSibling) {
        // Insert after header
        header.parentNode.insertBefore(resumeBanner, header.nextSibling);
      } else {
        // Fallback: insert at top of main content with proper margin
        main.insertBefore(resumeBanner, main.firstChild);
      }
    }

    // Add styles
    this.addResumeStyles();
  }

  createBanner() {
    const banner = document.createElement('div');
    banner.id = 'resume-offer-banner';
    banner.className = 'resume-banner';
    banner.innerHTML = `
      <div class="resume-content">
        <span class="resume-text">Finish your offer today</span>
        <span class="resume-address">${this.progress.address}</span>
        <svg class="resume-arrow" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
        </svg>
      </div>
    `;

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
      .resume-banner {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin: 1rem auto;
        padding: 1rem 1.5rem;
        cursor: pointer;
        transition: all 0.2s ease;
        max-width: 1200px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .resume-banner:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
      }

      .resume-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .resume-text {
        font-size: 1rem;
        font-weight: 500;
        color: #111827;
      }

      .resume-address {
        font-size: 0.875rem;
        color: #6b7280;
        flex: 1;
        text-align: center;
      }

      .resume-arrow {
        color: #9ca3af;
        flex-shrink: 0;
      }

      @media (max-width: 768px) {
        .resume-banner {
          margin: 1rem;
        }
        
        .resume-content {
          flex-direction: column;
          text-align: center;
          gap: 0.5rem;
        }
        
        .resume-address {
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }

  resumeOffer() {
    const currentPage = window.location.pathname;
    const targetUrl = 'pages/get-offer.html';
    
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
      window.location.href = fullUrl;
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Auto-clear any existing minimal data on page load BEFORE initializing
  const existingData = localStorage.getItem('homemaxx_offer_progress');
  if (existingData) {
    try {
      const parsed = JSON.parse(existingData);
      console.log('Found existing data:', parsed);
      // If it's just address data without real survey progress, clear it
      if (parsed.address && (!parsed.currentStep || parsed.currentStep <= 1) && !parsed.propertyDetails) {
        console.log('Auto-clearing minimal data on page load');
        localStorage.removeItem('homemaxx_offer_progress');
      }
    } catch (e) {
      console.log('Clearing corrupted data');
      localStorage.removeItem('homemaxx_offer_progress');
    }
  }
  
  // Initialize after cleanup
  window.offerResume = new OfferResume();
  
  // Debug method for manual cleanup
  window.debugCleanup = function() {
    window.offerResume.clearProgress();
    const banner = document.getElementById('resume-offer-banner');
    if (banner) banner.remove();
    console.log('All progress data cleared');
  };
});

// Export for use in other scripts
window.OfferResume = OfferResume;
