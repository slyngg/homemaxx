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
        background: linear-gradient(135deg, #1a56ff, #0d47a1);
        border: 2px solid #1a56ff;
        border-radius: 12px;
        margin: 1rem auto;
        padding: 1.5rem;
        box-shadow: 0 8px 25px rgba(26, 86, 255, 0.3);
        cursor: pointer;
        transition: all 0.3s ease;
        max-width: 1200px;
        position: static;
        z-index: 10;
        display: block;
        width: calc(100% - 2rem);
      }

      .offer-banner:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(26, 86, 255, 0.4);
      }

      .offer-banner-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .offer-banner-text {
        font-size: 1.3rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      }

      .offer-banner-address {
        font-size: 1rem;
        color: rgba(255,255,255,0.9);
        font-weight: 500;
        background: rgba(255,255,255,0.1);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        backdrop-filter: blur(10px);
      }

      .cash-offer-indicator {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-shrink: 0;
      }

      .cash-badge {
        background: linear-gradient(135deg, #ffd700, #ffed4e);
        color: #1a56ff;
        padding: 0.75rem 1.5rem;
        border-radius: 25px;
        font-weight: 800;
        font-size: 1.1rem;
        text-shadow: none;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4);
        animation: glow 2s ease-in-out infinite alternate;
      }

      .spots-text {
        font-size: 0.9rem;
        color: rgba(255,255,255,0.8);
        font-weight: 600;
        background: rgba(220, 53, 69, 0.8);
        padding: 0.4rem 0.8rem;
        border-radius: 15px;
        animation: pulse 1.5s ease-in-out infinite;
      }

      @keyframes glow {
        from { box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4); }
        to { box-shadow: 0 6px 25px rgba(255, 215, 0, 0.7); }
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @media (max-width: 768px) {
        .offer-banner {
          margin: 1rem;
          padding: 1rem;
        }
        
        .offer-banner-content {
          flex-direction: column;
          text-align: center;
          gap: 1rem;
        }
        
        .offer-banner-text {
          font-size: 1.1rem;
        }
        
        .cash-offer-indicator {
          flex-direction: column;
          gap: 0.5rem;
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
