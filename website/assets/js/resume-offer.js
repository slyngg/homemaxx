// Resume Offer Functionality
class OfferResume {
  constructor() {
    this.storageKey = 'homemaxx_offer_progress';
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
    const savedProgress = this.getSavedProgress();
    if (savedProgress && savedProgress.address) {
      this.showResumeOption(savedProgress);
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
      resumeBanner = document.createElement('div');
      resumeBanner.id = 'resume-offer-banner';
      resumeBanner.className = 'resume-offer-banner';
      resumeBanner.innerHTML = `
        <div class="resume-content">
          <div class="resume-icon">🏠</div>
          <div class="resume-text">
            <h4>Continue your offer for ${savedProgress.address}</h4>
            <p>You were on step ${savedProgress.lastStep + 1} of 8</p>
          </div>
          <button class="btn btn-primary resume-btn" onclick="window.offerResume.resumeOffer()">
            Continue Offer
          </button>
          <button class="btn btn-outline dismiss-btn" onclick="window.offerResume.dismissResume()">
            ✕
          </button>
        </div>
      `;
      
      // Insert at top of main content
      const main = document.querySelector('main') || document.body;
      main.insertBefore(resumeBanner, main.firstChild);
    }

    // Add styles
    this.addResumeStyles();
  }

  addResumeStyles() {
    if (document.getElementById('resume-offer-styles')) return;

    const style = document.createElement('style');
    style.id = 'resume-offer-styles';
    style.textContent = `
      .resume-offer-banner {
        background: linear-gradient(135deg, var(--primary-light), rgba(26, 86, 255, 0.1));
        border: 2px solid var(--primary);
        border-radius: 12px;
        margin: 1rem 0;
        padding: 1rem;
        box-shadow: 0 4px 12px rgba(26, 86, 255, 0.15);
        animation: slideInFromTop 0.5s ease-out;
      }

      .resume-content {
        display: flex;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .resume-icon {
        font-size: 2rem;
        background: var(--primary);
        color: white;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .resume-text {
        flex: 1;
        min-width: 200px;
      }

      .resume-text h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--text);
      }

      .resume-text p {
        margin: 0;
        font-size: 0.875rem;
        color: var(--text-secondary);
      }

      .resume-btn {
        white-space: nowrap;
      }

      .dismiss-btn {
        background: none;
        border: 1px solid var(--border);
        color: var(--text-secondary);
        padding: 0.5rem;
        min-width: auto;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .dismiss-btn:hover {
        background: var(--surface);
        color: var(--text);
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
        .resume-content {
          flex-direction: column;
          text-align: center;
        }
        
        .resume-text {
          min-width: auto;
        }
      }
    `;
    document.head.appendChild(style);
  }

  resumeOffer() {
    const savedProgress = this.getSavedProgress();
    if (savedProgress && savedProgress.address) {
      // Redirect to funnel with saved address and step
      const params = new URLSearchParams({
        address: savedProgress.address,
        step: savedProgress.lastStep || 0,
        resume: 'true'
      });
      window.location.href = `pages/get-offer.html?${params.toString()}`;
    } else {
      // No saved progress, start fresh
      window.location.href = 'pages/address-entry.html';
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
