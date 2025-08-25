/**
 * $7,500 Instant Cash Offer Popup System
 * Revolutionary cash advance for distressed sellers
 */

class CashOfferPopup {
  constructor() {
    this.storageKey = 'homemaxx_cash_offer_shown';
    this.slotsKey = 'homemaxx_cash_slots_remaining';
    this.defaultSlots = 7;
    this.init();
  }

  init() {
    // Show popup after short delay on first visit
    setTimeout(() => {
      if (!this.hasSeenPopup() && this.getSlotsRemaining() > 0) {
        this.showCashOfferPopup();
      }
    }, 3000);

    // Add cash offer banner to existing offer banner
    this.enhanceOfferBanner();
  }

  hasSeenPopup() {
    const lastShown = localStorage.getItem(this.storageKey);
    if (!lastShown) return false;
    
    // Show again after 24 hours
    const hoursSince = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
    return hoursSince < 24;
  }

  getSlotsRemaining() {
    const stored = localStorage.getItem(this.slotsKey);
    return stored ? parseInt(stored) : this.defaultSlots;
  }

  decrementSlots() {
    const current = this.getSlotsRemaining();
    if (current > 0) {
      localStorage.setItem(this.slotsKey, (current - 1).toString());
    }
  }

  showCashOfferPopup() {
    const slotsRemaining = this.getSlotsRemaining();
    
    const popup = document.createElement('div');
    popup.id = 'cash-offer-popup';
    popup.className = 'cash-offer-overlay';
    popup.innerHTML = `
      <div class="cash-offer-modal">
        <div class="cash-offer-header">
          <div class="offer-badge">🎯 LIMITED TIME</div>
          <button class="cash-offer-close" aria-label="Close">&times;</button>
        </div>
        
        <div class="cash-offer-content">
          <div class="cash-offer-title">
            <h2>🚨 BEST OFFER IN ALL REAL ESTATE 🚨</h2>
            <div class="cash-amount">
              <span class="currency">$</span>
              <span class="amount">7,500</span>
            </div>
            <p class="cash-subtitle">INSTANT CASH</p>
            <p class="cash-timing">As little as 48 hours</p>
          </div>
          
          <div class="offer-details">
            <div class="urgency-banner">
              <span class="slots-remaining">${slotsRemaining} SPOTS REMAINING</span>
            </div>
            
            <div class="offer-benefits">
              <div class="benefit">
                <span class="icon">💰</span>
                <span>Get cash BEFORE you sell</span>
              </div>
              <div class="benefit">
                <span class="icon">⚡</span>
                <span>Catch up on mortgage payments</span>
              </div>
              <div class="benefit">
                <span class="icon">🏠</span>
                <span>Moving expenses covered</span>
              </div>
              <div class="benefit">
                <span class="icon">✅</span>
                <span>No upfront fees or hidden costs</span>
              </div>
            </div>
            
            <div class="qualification-note">
              <p><strong>Qualifying properties only.</strong> Subject to approval and due diligence.</p>
              <p class="bonus-text">*Some properties may qualify for up to $15,000</p>
            </div>
          </div>
          
          <div class="cash-offer-actions">
            <button class="btn btn-primary btn-large cash-offer-cta" id="claim-cash-offer">
              🔥 CLAIM YOUR SPOT NOW 🔥
            </button>
            <p class="disclaimer">By clicking, you agree to our terms. Qualification required.</p>
          </div>
        </div>
      </div>
    `;

    // Add styles
    this.addPopupStyles();
    
    // Add to page
    document.body.appendChild(popup);
    
    // Prevent closing for 5 seconds
    let canClose = false;
    const closeBtn = popup.querySelector('.cash-offer-close');
    const ctaBtn = popup.querySelector('.cash-offer-cta');
    
    closeBtn.style.opacity = '0.3';
    closeBtn.style.cursor = 'not-allowed';
    
    // Countdown timer
    let countdown = 5;
    const originalCloseText = closeBtn.innerHTML;
    
    const countdownInterval = setInterval(() => {
      closeBtn.innerHTML = countdown;
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        closeBtn.innerHTML = originalCloseText;
        closeBtn.style.opacity = '1';
        closeBtn.style.cursor = 'pointer';
        canClose = true;
      }
    }, 1000);

    // Show popup with animation
    setTimeout(() => popup.classList.add('active'), 100);

    // Handle CTA click
    ctaBtn.addEventListener('click', () => {
      this.handleCashOfferClaim();
      this.closePopup(popup);
    });

    // Handle close
    closeBtn.addEventListener('click', () => {
      if (canClose) {
        this.closePopup(popup);
      }
    });

    // Close on overlay click (only after countdown)
    popup.addEventListener('click', (e) => {
      if (e.target === popup && canClose) {
        this.closePopup(popup);
      }
    });

    // Mark as shown
    localStorage.setItem(this.storageKey, Date.now().toString());
  }

  handleCashOfferClaim() {
    // Decrement available slots
    this.decrementSlots();
    
    // Track the cash offer claim
    if (window.gtag) {
      gtag('event', 'cash_offer_claimed', {
        event_category: 'engagement',
        event_label: 'instant_cash_7500',
        value: 7500
      });
    }

    // Save to progress for later qualification
    if (window.offerResume) {
      window.offerResume.saveProgress({
        cashOfferClaimed: true,
        claimTimestamp: Date.now(),
        currentStep: 0
      });
    }

    // Redirect to funnel with cash offer flag
    const params = new URLSearchParams({ 
      cashOffer: 'true',
      amount: '7500'
    });
    window.location.href = `pages/get-offer.html?${params.toString()}`;
  }

  closePopup(popup) {
    popup.classList.remove('active');
    setTimeout(() => {
      popup.remove();
    }, 300);
  }

  enhanceOfferBanner() {
    const offerBanner = document.querySelector('.offer-banner');
    if (offerBanner) {
      // Add cash offer indicator
      const cashIndicator = document.createElement('div');
      cashIndicator.className = 'cash-offer-indicator';
      cashIndicator.innerHTML = `
        <span class="cash-badge">💰 $7,500 INSTANT CASH</span>
        <span class="spots-text">${this.getSlotsRemaining()} spots left</span>
      `;
      
      offerBanner.appendChild(cashIndicator);
      
      // Make banner more prominent
      offerBanner.style.background = 'linear-gradient(135deg, #ff6b35, #f7931e)';
      offerBanner.style.animation = 'pulse 2s infinite';
    }
  }

  addPopupStyles() {
    if (document.getElementById('cash-offer-styles')) return;

    const style = document.createElement('style');
    style.id = 'cash-offer-styles';
    style.textContent = `
      .cash-offer-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .cash-offer-overlay.active {
        opacity: 1;
        visibility: visible;
      }
      
      .cash-offer-modal {
        background: linear-gradient(135deg, #1a56ff, #0d47a1);
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        position: relative;
        transform: scale(0.8) translateY(20px);
        transition: transform 0.3s ease;
        box-shadow: 0 25px 80px rgba(0, 0, 0, 0.3);
        border: 3px solid #ffd700;
      }
      
      .cash-offer-overlay.active .cash-offer-modal {
        transform: scale(1) translateY(0);
      }
      
      .cash-offer-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 1.5rem;
        border-bottom: 2px solid rgba(255, 255, 255, 0.2);
      }
      
      .offer-badge {
        background: #ff4444;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        font-size: 0.875rem;
        animation: flash 1.5s infinite;
      }
      
      .cash-offer-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        font-size: 1.5rem;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.3s ease;
      }
      
      .cash-offer-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      .cash-offer-content {
        padding: 2rem 1.5rem;
        text-align: center;
        color: white;
      }
      
      .cash-offer-title h2 {
        margin: 0 0 1rem 0;
        font-size: 1.5rem;
        font-weight: 800;
        text-transform: uppercase;
        letter-spacing: 1px;
        animation: glow 2s ease-in-out infinite alternate;
      }
      
      .cash-amount {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 1rem 0;
      }
      
      .currency {
        font-size: 2rem;
        font-weight: bold;
        margin-right: 0.25rem;
      }
      
      .amount {
        font-size: 4rem;
        font-weight: 900;
        color: #ffd700;
        text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        animation: bounce 2s infinite;
      }
      
      .cash-subtitle {
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0.5rem 0;
        color: #ffd700;
        text-transform: uppercase;
        letter-spacing: 2px;
      }
      
      .cash-timing {
        font-size: 1.1rem;
        margin: 0 0 1.5rem 0;
        opacity: 0.9;
      }
      
      .urgency-banner {
        background: #ff4444;
        color: white;
        padding: 0.75rem;
        border-radius: 10px;
        margin: 1.5rem 0;
        font-weight: bold;
        font-size: 1.1rem;
        animation: pulse 1.5s infinite;
      }
      
      .offer-benefits {
        display: grid;
        gap: 1rem;
        margin: 1.5rem 0;
        text-align: left;
      }
      
      .benefit {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        padding: 0.75rem;
        border-radius: 8px;
        font-weight: 500;
      }
      
      .benefit .icon {
        font-size: 1.25rem;
      }
      
      .qualification-note {
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 10px;
        margin: 1.5rem 0;
        font-size: 0.875rem;
        line-height: 1.4;
      }
      
      .bonus-text {
        color: #ffd700;
        font-weight: bold;
        margin-top: 0.5rem;
      }
      
      .cash-offer-actions {
        margin-top: 2rem;
      }
      
      .cash-offer-cta {
        background: linear-gradient(135deg, #ff6b35, #f7931e);
        border: none;
        color: white;
        padding: 1rem 2rem;
        font-size: 1.25rem;
        font-weight: bold;
        border-radius: 50px;
        cursor: pointer;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
        transition: all 0.3s ease;
        animation: glow-button 2s ease-in-out infinite alternate;
      }
      
      .cash-offer-cta:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 35px rgba(255, 107, 53, 0.6);
      }
      
      .disclaimer {
        font-size: 0.75rem;
        opacity: 0.8;
        margin-top: 1rem;
        line-height: 1.3;
      }
      
      .cash-offer-indicator {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        margin-top: 0.5rem;
      }
      
      .cash-badge {
        background: #ff4444;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.75rem;
        font-weight: bold;
        animation: flash 2s infinite;
      }
      
      .spots-text {
        font-size: 0.7rem;
        color: #666;
        font-weight: 500;
      }
      
      @keyframes flash {
        0%, 50% { opacity: 1; }
        25%, 75% { opacity: 0.7; }
      }
      
      @keyframes glow {
        from { text-shadow: 0 0 10px rgba(255, 215, 0, 0.5); }
        to { text-shadow: 0 0 20px rgba(255, 215, 0, 0.8); }
      }
      
      @keyframes bounce {
        0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
        40% { transform: translateY(-10px); }
        60% { transform: translateY(-5px); }
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      
      @keyframes glow-button {
        from { box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4); }
        to { box-shadow: 0 8px 25px rgba(255, 107, 53, 0.7); }
      }
      
      @media (max-width: 768px) {
        .cash-offer-modal {
          width: 95%;
          margin: 1rem;
        }
        
        .amount {
          font-size: 3rem;
        }
        
        .cash-offer-title h2 {
          font-size: 1.25rem;
        }
        
        .offer-benefits {
          text-align: center;
        }
        
        .benefit {
          flex-direction: column;
          text-align: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.cashOfferPopup = new CashOfferPopup();
});

// Export for use in other scripts
window.CashOfferPopup = CashOfferPopup;
