'use strict';

/**
 * HomeMAXX Opendoor-Style Funnel
 * Complete redesign with dynamic flows, image questions, and clean UX
 */

class OpendoorFunnel {
  constructor() {
    this.currentStep = 0;
    this.totalSteps = 0;
    this.formData = {};
    this.userType = 'owner'; // 'owner', 'agent', or 'hoa'
    this.steps = [];
    this.preconfirmedAddress = null;
    this.isQualifiedForBonus = false;
    this.appointmentBooked = false;
    this.offerData = null;
    
    this.init();
  }

  init() {
    // Check for pre-confirmed address from URL parameters or localStorage
    this.checkPreconfirmedAddress();
    this.createSteps();
    this.bindEvents();
    
    // Start from appropriate step
    const startStep = this.preconfirmedAddress ? 1 : 0; // Skip address step if pre-confirmed
    this.showStep(startStep);
  }

  checkPreconfirmedAddress() {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const addressParam = urlParams.get('address');
    
    // Check localStorage for address from landing page
    const storedAddress = localStorage.getItem('homemaxx_confirmed_address');
    
    if (addressParam) {
      this.preconfirmedAddress = decodeURIComponent(addressParam);
      this.formData.address = this.preconfirmedAddress;
    } else if (storedAddress) {
      this.preconfirmedAddress = storedAddress;
      this.formData.address = this.preconfirmedAddress;
      // Clear from localStorage after use
      localStorage.removeItem('homemaxx_confirmed_address');
    }
  }

  createSteps() {
    this.steps = [
      {
        id: 'address',
        title: 'Enter your home address',
        subtitle: '',
        render: () => this.renderAddressStep(),
        condition: () => !this.preconfirmedAddress // Only show if no pre-confirmed address
      },
      {
        id: 'property-details',
        title: "Let's confirm your property details",
        subtitle: 'We found this information about your home. Please review and edit if needed.',
        render: () => this.renderPropertyDetailsStep()
      },
      {
        id: 'owner-type',
        title: 'Are you the owner of this home?',
        subtitle: 'We have additional questions if you\'re an agent.',
        render: () => this.renderOwnerTypeStep()
      },
      {
        id: 'agent-options',
        title: 'Great! There are two ways agents can work with us.',
        subtitle: 'You can decide what makes the most sense for you and the homeowner after you receive an estimated offer from HomeMAXX.',
        render: () => this.renderAgentOptionsStep(),
        condition: () => this.userType === 'agent'
      },
      {
        id: 'timeline',
        title: this.userType === 'agent' ? 'When do you need to sell your client\'s home?' : 'When do you need to sell your home?',
        subtitle: 'This won\'t affect your offer. We\'re here to help with any timeline.',
        render: () => this.renderTimelineStep()
      },
      {
        id: 'kitchen-countertops',
        title: this.userType === 'agent' ? 'What are your client\'s kitchen countertops made of?' : 'What are your kitchen countertops made of?',
        subtitle: 'This tells us a bit about when the kitchen was last updated.',
        render: () => this.renderKitchenCountertopsStep()
      },
      {
        id: 'kitchen-quality',
        title: this.userType === 'agent' ? 'How would you describe your client\'s kitchen?' : 'How would you describe your kitchen?',
        subtitle: 'For these questions, just select the closest match.',
        render: () => this.renderKitchenQualityStep()
      },
      {
        id: 'hoa-question',
        title: this.userType === 'agent' ? 'Is your client\'s home part of a homeowners association?' : 'Is your home part of a homeowners association?',
        subtitle: 'This is often called an HOA. It\'s a group that helps maintain your community for a fee.',
        render: () => this.renderHOAStep()
      },
      {
        id: 'hoa-fees',
        title: this.userType === 'agent' ? 'What are your client\'s monthly HOA fees?' : 'What are your monthly HOA fees?',
        subtitle: '(Optional) This helps us better understand your property\'s monthly expenses.',
        render: () => this.renderHOAFeesStep(),
        condition: () => this.formData.hasHOA === 'yes'
      },
      {
        id: 'property-issues',
        title: this.userType === 'agent' ? 'Do any of these apply to your client\'s home?' : 'Do any of these apply to your home?',
        subtitle: 'Select all that apply. We keep an eye out for these things when we\'re making an offer.',
        render: () => this.renderPropertyIssuesStep()
      },
      {
        id: 'contact-info',
        title: 'Sign in to get your offer',
        subtitle: 'It\'s totally free and there\'s no commitment.',
        render: () => this.renderContactStep()
      },
      {
        id: 'qualification-result',
        title: 'Checking your qualification...',
        subtitle: 'We\'re reviewing your information to see if you qualify for our $7,500 instant cash offer.',
        render: () => this.renderQualificationStep()
      },
      {
        id: 'calendar-booking',
        title: '🎉 You qualify for our $7,500 instant cash offer!',
        subtitle: 'Schedule a quick 30-minute consultation to claim your offer and discuss next steps.',
        render: () => this.renderCalendarBookingStep(),
        condition: () => this.isQualifiedForBonus
      },
      {
        id: 'booking-confirmation',
        title: 'Appointment confirmed!',
        subtitle: 'We\'ve sent you a confirmation email with all the details.',
        render: () => this.renderBookingConfirmationStep(),
        condition: () => this.appointmentBooked
      }
    ];

    this.totalSteps = this.steps.filter(step => !step.condition || step.condition()).length;
  }

  bindEvents() {
    window.goNext = () => this.nextStep();
    window.goBack = () => this.prevStep();
    window.saveDraft = () => this.saveDraft();
    window.selectOption = (value) => this.selectOption(value);
    window.selectImageOption = (value) => this.selectImageOption(value);
    window.toggleMultiSelect = (value) => this.toggleMultiSelect(value);
    
    // CRITICAL: Bind submitForm to global scope for HTML onclick handlers
    window.submitForm = () => this.submitForm();
    
    // Bind additional functions for error handling
    window.scheduleConsultation = () => this.scheduleConsultation();
    window.requestTraditionalOffer = () => this.requestTraditionalOffer();
    
    // Listen for language changes
    window.addEventListener('languageChanged', (event) => {
      this.handleLanguageChange(event.detail.language);
    });
  }

  handleLanguageChange(language) {
    // Re-render current step with new language
    this.showStep(this.currentStep);
    
    // Update any dynamic content that needs translation
    this.updateFunnelTranslations(language);
  }
  
  updateFunnelTranslations(language) {
    // Get translations from language toggle instance
    const translations = window.languageToggle?.translations[language];
    if (!translations) return;
    
    // Update step navigation buttons
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (backBtn && backBtn.querySelector('span')) {
      backBtn.querySelector('span').textContent = translations['btn.back'] || 'Back';
    }
    
    // Update next button text based on current step
    if (nextBtn) {
      const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep]?.id;
      
      if (currentStepId === 'contact-info') {
        nextBtn.textContent = translations['contact.submit'] || 'Get My Cash Offer';
      } else if (this.currentStep === this.totalSteps - 1) {
        nextBtn.textContent = translations['btn.continue'] || 'Continue';
      } else {
        nextBtn.textContent = translations['btn.next'] || 'Next';
      }
    }
    
    // Update save button
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
      saveBtn.textContent = translations['btn.save'] || 'Save & Exit';
    }
  }

  showStep(stepIndex) {
    const availableSteps = this.steps.filter(step => !step.condition || step.condition());
    const step = availableSteps[stepIndex];
    
    if (!step) return;

    this.currentStep = stepIndex;
    
    // Update progress
    const progress = ((stepIndex + 1) / this.totalSteps) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    
    // Update navigation
    const backBtn = document.getElementById('back-btn');
    const nextBtn = document.getElementById('next-btn');
    
    backBtn.style.display = stepIndex > 0 ? 'flex' : 'none';
    
    // Render step content with data-translate attributes
    const content = document.getElementById('step-content');
    content.innerHTML = `
      <h1 class="step-title" data-translate="step-${step.id}-title">${step.title}</h1>
      ${step.subtitle ? `<p class="step-subtitle" data-translate="step-${step.id}-subtitle">${step.subtitle}</p>` : ''}
      <div class="step-body">
        ${step.render()}
      </div>
    `;

    // Update next button text
    if (stepIndex === this.totalSteps - 1) {
      nextBtn.textContent = 'Continue with email';
    } else {
      nextBtn.textContent = 'Next';
    }
    
    // Apply current language translations if language toggle is available
    if (window.languageToggle && typeof window.languageToggle.applyLanguage === 'function') {
      window.languageToggle.applyLanguage(window.languageToggle.currentLanguage);
    }
  }

  nextStep() {
    if (!this.validateCurrentStep()) return;
    
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep].id;
    
    // Trigger qualification check when moving to qualification step
    if (currentStepId === 'contact-info') {
      // Move to qualification step and start the process
      this.showStep(this.currentStep + 1);
      setTimeout(() => this.performQualificationCheck(), 500);
      return;
    }
    
    if (this.currentStep < this.totalSteps - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.submitForm();
    }
  }

  prevStep() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  validateCurrentStep() {
    return true;
  }

  selectOption(value) {
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep].id;
    this.formData[currentStepId] = value;
    
    // Update UI
    document.querySelectorAll('.option-btn').forEach(btn => {
      btn.classList.remove('selected');
    });
    event.target.classList.add('selected');
    
    // Handle special cases
    if (currentStepId === 'owner-type') {
      this.userType = value === 'agent' ? 'agent' : 'owner';
      this.updateStepTitles();
    }
    
    if (currentStepId === 'hoa-question') {
      this.formData.hasHOA = value;
    }
  }

  selectImageOption(value) {
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep].id;
    this.formData[currentStepId] = value;
    
    // Update UI
    document.querySelectorAll('.image-option').forEach(option => {
      option.classList.remove('selected');
    });
    event.target.closest('.image-option').classList.add('selected');
  }

  toggleMultiSelect(value) {
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep].id;
    
    if (!this.formData[currentStepId]) {
      this.formData[currentStepId] = [];
    }
    
    const index = this.formData[currentStepId].indexOf(value);
    if (index > -1) {
      this.formData[currentStepId].splice(index, 1);
    } else {
      this.formData[currentStepId].push(value);
    }
    
    // Update UI
    event.target.classList.toggle('selected');
  }

  updateStepTitles() {
    this.steps.forEach(step => {
      if (step.title.includes('your client') || step.title.includes('your home')) {
        if (this.userType === 'agent') {
          step.title = step.title.replace(/your home/g, "your client's home");
          step.title = step.title.replace(/your kitchen/g, "your client's kitchen");
        }
      }
    });
  }

  // Step Renderers
  renderAddressStep() {
    return `
      <div class="form-group">
        <input type="text" 
               class="form-input" 
               id="address-input" 
               placeholder="Enter your home address"
               autocomplete="street-address">
      </div>
    `;
  }

  renderPropertyDetailsStep() {
    return `
      <div class="property-details">
        <div class="detail-row">
          <span class="detail-label">Address</span>
          <span class="detail-value">5329 Jackson Valley Ct, Las Vegas, NV 89131, USA</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bedrooms</span>
          <span class="detail-value">4</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
        <div class="detail-row">
          <span class="detail-label">Bathrooms</span>
          <span class="detail-value">2.5</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
        <div class="detail-row">
          <span class="detail-label">Square Feet</span>
          <span class="detail-value">2,093</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
        <div class="detail-row">
          <span class="detail-label">Year Built</span>
          <span class="detail-value">2005</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
        <div class="detail-row">
          <span class="detail-label">Lot Size</span>
          <span class="detail-value">0.18 acres</span>
          <a href="#" class="edit-link">Edit</a>
        </div>
      </div>
    `;
  }

  renderOwnerTypeStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('owner')" data-translate="owner-type-owner">Yes, I own this home</button>
        <button class="option-btn" onclick="selectOption('agent')" data-translate="owner-type-agent">No, I'm an agent</button>
        <button class="option-btn" onclick="selectOption('agent-owner')" data-translate="owner-type-agent-owner">I'm an agent, and I own this home</button>
        <button class="option-btn" onclick="selectOption('other')" data-translate="owner-type-other">Other</button>
      </div>
    `;
  }

  renderAgentOptionsStep() {
    return `
      <div class="option-grid" style="gap: 2rem;">
        <div class="agent-option">
          <h3 data-translate="agent-options-refer">Refer to HomeMAXX</h3>
          <p style="color: #6b7280; margin: 0.5rem 0;" data-translate="agent-options-refer-description">Eligible for 1% referral commission</p>
          <ul style="color: #6b7280; font-size: 0.875rem; margin: 1rem 0; padding-left: 1rem;">
            <li data-translate="agent-options-refer-1">Ideal for when you can't (or don't want to) represent a client</li>
            <li data-translate="agent-options-refer-2">Share the homeowner's contact information with HomeMAXX</li>
            <li data-translate="agent-options-refer-3">That's all there is to it — we work with the homeowner to complete the sale</li>
          </ul>
        </div>
        
        <div class="agent-option">
          <h3 data-translate="agent-options-represent">Represent your client</h3>
          <p style="color: #6b7280; margin: 0.5rem 0;" data-translate="agent-options-represent-description">Eligible for 1% commission + seller commission</p>
          <ul style="color: #6b7280; font-size: 0.875rem; margin: 1rem 0; padding-left: 1rem;">
            <li data-translate="agent-options-represent-1">Ideal for clients that need more guidance and support</li>
            <li data-translate="agent-options-represent-2">You'll represent your client throughout the entire process</li>
            <li data-translate="agent-options-represent-3">You'll work directly with HomeMAXX and expect to have a representation agreement with your client</li>
          </ul>
        </div>
      </div>
    `;
  }

  renderTimelineStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('asap')" data-translate="timeline-asap">ASAP</button>
        <button class="option-btn" onclick="selectOption('2-4-weeks')" data-translate="timeline-2-4-weeks">2-4 weeks</button>
        <button class="option-btn" onclick="selectOption('4-6-weeks')" data-translate="timeline-4-6-weeks">4-6 weeks</button>
        <button class="option-btn" onclick="selectOption('6-weeks-plus')" data-translate="timeline-6-weeks-plus">6+ weeks</button>
        <button class="option-btn" onclick="selectOption('just-browsing')" data-translate="timeline-just-browsing">Just browsing</button>
      </div>
    `;
  }

  renderKitchenCountertopsStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('laminate')">Laminate / Formica</button>
        <button class="option-btn" onclick="selectOption('corian')">Corian</button>
        <button class="option-btn" onclick="selectOption('quartz')">Quartz</button>
        <button class="option-btn" onclick="selectOption('granite-marble')">Granite / Marble slab</button>
        <button class="option-btn" onclick="selectOption('granite-tile')">Granite tile</button>
        <button class="option-btn" onclick="selectOption('other-tile')">Other tile</button>
      </div>
    `;
  }

  renderKitchenQualityStep() {
    return `
      <div class="image-options">
        <div class="image-option" onclick="selectImageOption('fixer-upper')" data-translate="kitchen-quality-fixer-upper">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Fixer Upper Kitchen">
          <div class="image-option-content">
            <div class="image-option-title">Fixer Upper</div>
            <div class="image-option-description">Needs major work</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('dated')" data-translate="kitchen-quality-dated">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="Dated Kitchen">
          <div class="image-option-content">
            <div class="image-option-title">Dated</div>
            <div class="image-option-description">Needs updating</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('standard')" data-translate="kitchen-quality-standard">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Standard Kitchen">
          <div class="image-option-content">
            <div class="image-option-title">Standard</div>
            <div class="image-option-description">Move-in ready</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('high-end')" data-translate="kitchen-quality-high-end">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="High End Kitchen">
          <div class="image-option-content">
            <div class="image-option-title">High end</div>
            <div class="image-option-description">Recently renovated</div>
          </div>
        </div>
      </div>
      <div style="text-align: center; margin-top: 1rem;">
        <button class="btn-skip" onclick="goNext()" data-translate="kitchen-quality-skip">Skip</button>
      </div>
    `;
  }

  renderHOAStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('yes')" data-translate="hoa-yes">Yes</button>
        <button class="option-btn" onclick="selectOption('no')" data-translate="hoa-no">No</button>
      </div>
    `;
  }

  renderHOAFeesStep() {
    return `
      <div class="form-group">
        <div style="position: relative;">
          <span style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #6b7280;">$</span>
          <input type="number" 
                 class="form-input" 
                 style="padding-left: 2rem;"
                 placeholder="0"
                 id="hoa-fees-input">
        </div>
      </div>
    `;
  }

  renderPropertyIssuesStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="toggleMultiSelect('solar-panels')" data-translate="property-issues-solar-panels">
          <strong>Leased or financed solar panels</strong><br>
          <small style="color: #6b7280;">You may need to buy out the lease or remove the panels to sell to us</small>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('foundation-issues')" data-translate="property-issues-foundation-issues">
          <strong>Known foundation issues</strong><br>
          <small style="color: #6b7280;">Excessive cracking, uneven floors</small>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('fire-damage')" data-translate="property-issues-fire-damage">
          <strong>Fire damage</strong>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('well-water')" data-translate="property-issues-well-water">
          <strong>Well water</strong><br>
          <small style="color: #6b7280;">You maintain a well to supply water</small>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('septic-system')" data-translate="property-issues-septic-system">
          <strong>Septic system</strong><br>
          <small style="color: #6b7280;">Separate from municipal sewage</small>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('asbestos-siding')" data-translate="property-issues-asbestos-siding">
          <strong>Asbestos siding</strong>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('horse-property')" data-translate="property-issues-horse-property">
          <strong>Horse property</strong><br>
          <small style="color: #6b7280;">Livestock live on property</small>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('mobile-home')" data-translate="property-issues-mobile-home">
          <strong>Mobile or manufactured home</strong>
        </button>
        <button class="option-btn" onclick="toggleMultiSelect('none')" data-translate="property-issues-none">
          <strong>None of the above</strong>
        </button>
      </div>
    `;
  }

  renderContactStep() {
    return `
      <div style="text-align: center; margin-bottom: 2rem;">
        <button class="btn btn-primary" style="width: 100%; margin-bottom: 1rem;" data-translate="contact-google">Continue with Google</button>
        <p style="color: #6b7280; margin: 1rem 0;" data-translate="contact-or">or</p>
      </div>
      
      <div class="form-group">
        <label class="form-label" data-translate="contact-email">Email *</label>
        <input type="email" 
               class="form-input" 
               placeholder="Enter your email"
               id="email-input">
      </div>
      
      <button class="btn btn-primary" style="width: 100%;" onclick="submitForm()" data-translate="contact-submit">Continue with email</button>
      
      <p style="font-size: 0.75rem; color: #6b7280; text-align: center; margin-top: 1rem;" data-translate="contact-terms">
        By clicking "Continue", you agree to HomeMAXX's 
        <a href="#" style="color: #3b82f6;">terms of service</a> and 
        <a href="#" style="color: #3b82f6;">Privacy Policy</a>.
      </p>
    `;
  }

  renderQualificationStep() {
    return `
      <div class="qualification-container">
        <div class="qualification-loading" id="qualification-loading">
          <div class="loading-spinner"></div>
          <p data-translate="qualification-loading">Analyzing your property and calculating your personalized offer...</p>
          <div class="loading-steps">
            <div class="loading-step active" id="step-1" data-translate="qualification-step-1">📍 Analyzing location and market data</div>
            <div class="loading-step" id="step-2" data-translate="qualification-step-2">🏠 Evaluating property condition and features</div>
            <div class="loading-step" id="step-3" data-translate="qualification-step-3">💰 Calculating assignment fee potential</div>
            <div class="loading-step" id="step-4" data-translate="qualification-step-4">✅ Determining qualification status</div>
          </div>
        </div>
        
        <div class="qualification-results" id="qualification-results" style="display: none;">
          <!-- Results will be populated by JavaScript -->
        </div>
      </div>
    `;
  }

  async performQualificationCheck() {
    // Show loading animation
    this.showLoadingSteps();
    
    try {
      // Prepare property data from form
      const propertyData = this.preparePropertyDataForCalculation();
      
      // Call the calculate-offer Netlify function
      const response = await fetch('/.netlify/functions/calculate-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(propertyData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate offer');
      }
      
      const offerData = await response.json();
      
      // Update qualification status
      this.isQualifiedForBonus = offerData.qualificationScore >= 70;
      this.offerData = offerData;
      
      // Hide loading and show results
      document.getElementById('qualification-loading').style.display = 'none';
      document.getElementById('qualification-results').style.display = 'block';
      document.getElementById('qualification-results').innerHTML = this.renderOfferResults(offerData);
      
      // Update step navigation
      this.updateQualificationNavigation();
      
    } catch (error) {
      console.error('Qualification check failed:', error);
      this.showQualificationError();
    }
  }

  showLoadingSteps() {
    const steps = ['step-1', 'step-2', 'step-3', 'step-4'];
    let currentStep = 0;
    
    const interval = setInterval(() => {
      if (currentStep > 0) {
        document.getElementById(steps[currentStep - 1]).classList.remove('active');
        document.getElementById(steps[currentStep - 1]).classList.add('completed');
      }
      
      if (currentStep < steps.length) {
        document.getElementById(steps[currentStep]).classList.add('active');
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 1500);
  }

  preparePropertyDataForCalculation() {
    return {
      address: this.formData.address || this.preconfirmedAddress,
      bedrooms: this.extractBedroomsFromDetails(),
      bathrooms: this.extractBathroomsFromDetails(),
      squareFootage: this.extractSquareFootageFromDetails(),
      yearBuilt: this.extractYearBuiltFromDetails(),
      lotSize: this.extractLotSizeFromDetails(),
      kitchenQuality: this.formData['kitchen-quality'] || 'average',
      timeline: this.formData['timeline'] || 'flexible',
      propertyIssues: this.formData['property-issues'] || [],
      hasHOA: this.formData.hasHOA === 'yes',
      hoaFees: this.formData['hoa-fees'] || 0,
      ownerType: this.formData['owner-type'] || 'owner',
      userType: this.userType
    };
  }

  extractBedroomsFromDetails() {
    // Extract from property details or default
    return 4; // TODO: Extract from actual property details
  }

  extractBathroomsFromDetails() {
    return 2.5; // TODO: Extract from actual property details
  }

  extractSquareFootageFromDetails() {
    return 2093; // TODO: Extract from actual property details
  }

  extractYearBuiltFromDetails() {
    return 2005; // TODO: Extract from actual property details
  }

  extractLotSizeFromDetails() {
    return 0.18; // TODO: Extract from actual property details
  }

  renderOfferResults(offerData) {
    const { 
      marketValue, 
      cashOfferRange, 
      assignmentFeeProjection, 
      qualificationScore, 
      bonusEligible,
      marketInsights,
      nextSteps 
    } = offerData;

    const isQualified = qualificationScore >= 70;
    
    // Safe check for assignmentFeeProjection
    const assignmentTier = assignmentFeeProjection?.tier || 'standard';
    const assignmentAmount = assignmentFeeProjection?.projectedFee || 0;

    return `
      <div class="offer-results">
        ${isQualified ? this.renderQualifiedOffer(offerData) : this.renderUnqualifiedResult(offerData)}
      </div>
    `;
  }

  renderQualifiedOffer(offerData) {
    const { 
      marketValue, 
      cashOfferRange, 
      assignmentFeeProjection, 
      bonusEligible,
      marketInsights 
    } = offerData;

    // Safe defaults for assignmentFeeProjection
    const assignmentTier = assignmentFeeProjection?.tier || 'standard';
    const assignmentAmount = assignmentFeeProjection?.projectedFee || 0;

    return `
      <div class="qualified-offer">
        <div class="success-header">
          <div class="success-icon">🎉</div>
          <h2 data-translate="qualified-offer-congratulations">Congratulations! You qualify for our $7,500 instant cash offer!</h2>
          <p class="success-subtitle" data-translate="qualified-offer-subtitle">Plus, we've calculated your personalized property offer below</p>
        </div>

        <div class="offer-breakdown">
          <div class="offer-card primary">
            <div class="offer-label" data-translate="qualified-offer-cash-offer">Your Cash Offer Range</div>
            <div class="offer-amount">$${cashOfferRange.min.toLocaleString()} - $${cashOfferRange.max.toLocaleString()}</div>
            <div class="offer-note" data-translate="qualified-offer-note">Based on current market conditions and property analysis</div>
          </div>

          <div class="offer-details-grid">
            <div class="detail-card">
              <div class="detail-icon">🏠</div>
              <div class="detail-content">
                <div class="detail-label" data-translate="qualified-offer-market-value">Estimated Market Value</div>
                <div class="detail-value">$${marketValue.toLocaleString()}</div>
              </div>
            </div>

            <div class="detail-card assignment-fee">
              <div class="detail-icon">${assignmentTier === 'premium' ? '💎' : '💰'}</div>
              <div class="detail-content">
                <div class="detail-label" data-translate="qualified-offer-assignment-fee">Assignment Fee Potential</div>
                <div class="detail-value">$${assignmentAmount.toLocaleString()}</div>
                <div class="detail-tier ${assignmentTier}" data-translate="qualified-offer-assignment-tier">${assignmentTier.toUpperCase()} TIER</div>
              </div>
            </div>

            ${bonusEligible ? `
              <div class="detail-card bonus">
                <div class="detail-icon">⭐</div>
                <div class="detail-content">
                  <div class="detail-label" data-translate="qualified-offer-bonus">Bonus Eligible</div>
                  <div class="detail-value">Up to $15,000</div>
                  <div class="detail-note" data-translate="qualified-offer-bonus-note">Exceptional property potential</div>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="market-insights">
          <h3 data-translate="qualified-offer-market-insights">Market Insights</h3>
          <div class="insights-grid">
            ${(marketInsights || []).map(insight => `
              <div class="insight-item">
                <div class="insight-icon">${insight.icon || '📊'}</div>
                <div class="insight-content">
                  <div class="insight-title" data-translate="qualified-offer-insight-${insight.title}">${insight.title}</div>
                  <div class="insight-description" data-translate="qualified-offer-insight-${insight.description}">${insight.description}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="next-steps-preview">
          <h3 data-translate="qualified-offer-next-steps">What happens next?</h3>
          <div class="steps-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-content">
                <div class="step-title" data-translate="qualified-offer-step-1">Schedule consultation</div>
                <div class="step-description" data-translate="qualified-offer-step-1-description">30-minute call to discuss your offer and timeline</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-content">
                <div class="step-title" data-translate="qualified-offer-step-2">Property evaluation</div>
                <div class="step-description" data-translate="qualified-offer-step-2-description">Quick walkthrough to confirm condition and finalize offer</div>
              </div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-content">
                <div class="step-title" data-translate="qualified-offer-step-3">Receive $7,500 cash</div>
                <div class="step-description" data-translate="qualified-offer-step-3-description">Get your instant cash within 48 hours of agreement</div>
              </div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <button class="btn btn-primary" onclick="goNext()" data-translate="qualified-offer-cta">Schedule My Consultation</button>
          <p class="cta-note" data-translate="qualified-offer-cta-note">Secure your $7,500 instant cash offer today</p>
        </div>
      </div>
    `;
  }

  renderUnqualifiedResult(offerData) {
    const { 
      marketValue, 
      cashOfferRange, 
      qualificationScore, 
      marketInsights 
    } = offerData;

    return `
      <div class="unqualified-result">
        <div class="result-header">
          <div class="result-icon">📋</div>
          <h2 data-translate="unqualified-result-header">Thank you for your interest!</h2>
          <p class="result-subtitle" data-translate="unqualified-result-subtitle">We've analyzed your property and prepared a personalized assessment</p>
        </div>

        <div class="offer-summary">
          <div class="offer-card">
            <div class="offer-label" data-translate="unqualified-offer-label">Estimated Cash Offer Range</div>
            <div class="offer-amount">$${cashOfferRange.min.toLocaleString()} - $${cashOfferRange.max.toLocaleString()}</div>
            <div class="offer-note" data-translate="unqualified-offer-note">Based on current market analysis</div>
          </div>

          <div class="qualification-score">
            <div class="score-label" data-translate="unqualified-qualification-score">Property Assessment Score</div>
            <div class="score-value">${qualificationScore}/100</div>
            <div class="score-bar">
              <div class="score-fill" style="width: ${qualificationScore}%"></div>
            </div>
          </div>
        </div>

        <div class="alternative-options">
          <h3 data-translate="unqualified-alternative-options">How we can still help you</h3>
          <div class="options-grid">
            <div class="option-card">
              <div class="option-icon">🏠</div>
              <div class="option-title" data-translate="unqualified-option-traditional">Traditional Cash Offer</div>
              <div class="option-description" data-translate="unqualified-option-traditional-description">We can still make a competitive cash offer for your property</div>
            </div>
            <div class="option-card">
              <div class="option-icon">🤝</div>
              <div class="option-title" data-translate="unqualified-option-market-analysis">Market Analysis</div>
              <div class="option-description" data-translate="unqualified-option-market-analysis-description">Get detailed insights about your property's market potential</div>
            </div>
            <div class="option-card">
              <div class="option-icon">📞</div>
              <div class="option-title" data-translate="unqualified-option-expert-consultation">Expert Consultation</div>
              <div class="option-description" data-translate="unqualified-option-expert-consultation-description">Speak with our team about your selling options</div>
            </div>
          </div>
        </div>

        <div class="cta-section">
          <button class="btn btn-primary" onclick="scheduleConsultation()" data-translate="unqualified-cta-schedule">Schedule Free Consultation</button>
          <button class="btn btn-secondary" onclick="requestTraditionalOffer()" data-translate="unqualified-cta-traditional">Request Traditional Offer</button>
        </div>
      </div>
    `;
  }

  updateQualificationNavigation() {
    const nextBtn = document.getElementById('next-btn');
    if (this.isQualifiedForBonus) {
      nextBtn.textContent = 'Schedule Consultation';
      nextBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    } else {
      nextBtn.textContent = 'Continue';
    }
  }

  showQualificationError() {
    document.getElementById('qualification-loading').style.display = 'none';
    document.getElementById('qualification-results').style.display = 'block';
    document.getElementById('qualification-results').innerHTML = `
      <div class="error-state">
        <div class="error-icon">⚠️</div>
        <h3 data-translate="qualification-error-header">Unable to calculate offer</h3>
        <p data-translate="qualification-error-description">We're experiencing technical difficulties. Please try again or contact our team directly.</p>
        <div style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
          <button class="btn btn-primary" onclick="window.funnelInstance.performQualificationCheck()" data-translate="qualification-error-try-again">Try Again</button>
          <button class="btn btn-secondary" onclick="window.funnelInstance.sendOfferAnyway()" data-translate="qualification-error-send-offer">Send Offer Anyway</button>
          <button class="btn btn-secondary" onclick="contactSupport()" data-translate="qualification-error-contact-support">Contact Support</button>
        </div>
      </div>
    `;
  }

  // Add missing sendOfferAnyway method
  sendOfferAnyway() {
    console.log('Sending offer anyway for manual review');
    
    try {
      // Prepare fallback data for GHL webhook
      const contactData = {
        contact: {
          firstName: this.extractFirstName(),
          lastName: this.extractLastName(),
          email: this.formData.email || document.getElementById('email-input')?.value,
          phone: this.formData.phone || '',
          address: this.formData.address || this.preconfirmedAddress,
          propertyType: 'Single Family Home',
          ownerType: this.formData['owner-type'] || 'owner',
          timeline: this.formData['timeline'] || 'flexible',
          kitchenQuality: this.formData['kitchen-quality'] || 'standard',
          hasHOA: this.formData.hasHOA || 'unknown',
          propertyIssues: this.formData['property-issues'] || [],
          leadSource: 'HomeMAXX Funnel - Manual Review',
          funnelStep: 'Manual Review Required',
          submissionDate: new Date().toISOString(),
          customFields: {
            funnel_completion_date: new Date().toISOString(),
            property_address: this.formData.address || this.preconfirmedAddress,
            seller_timeline: this.formData['timeline'] || 'flexible',
            property_condition: this.formData['kitchen-quality'] || 'standard',
            lead_priority: 'Manual Review Required',
            contact_method: 'Email Provided',
            calculation_status: 'Manual Review'
          }
        }
      };

      // Submit to GHL webhook for manual review
      const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/46e87a3a-c1d7-4bea-8a70-a022cb1b80ae';
      
      fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactData)
      }).then(response => {
        if (response.ok) {
          console.log('Manual review submission successful');
        } else {
          console.error('Manual review submission failed');
        }
      }).catch(error => {
        console.error('Manual review submission error:', error);
      });

      // Show manual review confirmation
      document.getElementById('qualification-results').innerHTML = `
        <div class="manual-review-confirmation">
          <div class="success-icon">✅</div>
          <h2>Thank you for your submission!</h2>
          <p>Our team will manually review your property details and contact you within 24 hours with a personalized offer.</p>
          <div class="contact-info">
            <p><strong>Need immediate assistance?</strong></p>
            <p>Call us at <a href="tel:(725) 772-9847">(725) 772-9847</a></p>
            <p>Email: <a href="mailto:support@homemaxx.com">support@homemaxx.com</a></p>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Send offer anyway error:', error);
    }
  }

  // Add missing global function bindings
  bindEvents() {
    window.goNext = () => this.nextStep();
    window.goBack = () => this.prevStep();
    window.saveDraft = () => this.saveDraft();
    window.selectOption = (value) => this.selectOption(value);
    window.selectImageOption = (value) => this.selectImageOption(value);
    window.toggleMultiSelect = (value) => this.toggleMultiSelect(value);
    
    // CRITICAL: Bind submitForm to global scope for HTML onclick handlers
    window.submitForm = () => this.submitForm();
    
    // Bind additional functions for error handling
    window.scheduleConsultation = () => this.scheduleConsultation();
    window.requestTraditionalOffer = () => this.requestTraditionalOffer();
    
    // Listen for language changes
    window.addEventListener('languageChanged', (event) => {
      this.handleLanguageChange(event.detail.language);
    });
  }

  // Add missing methods for error handling buttons
  scheduleConsultation() {
    console.log('Scheduling consultation');
    // Redirect to booking page or show booking modal
    window.location.href = '/pages/consultation-request.html';
  }

  requestTraditionalOffer() {
    console.log('Requesting traditional offer');
    this.sendOfferAnyway(); // Use the same manual review process
  }

  renderCalendarBookingStep() {
    return `
      <div class="calendar-booking">
        <p>Schedule a quick 30-minute consultation to claim your offer and discuss next steps.</p>
        <button class="btn btn-primary" onclick="bookAppointment()">Book Appointment</button>
      </div>
    `;
  }

  renderBookingConfirmationStep() {
    return `
      <div class="booking-confirmation">
        <p>Appointment confirmed!</p>
        <p>We've sent you a confirmation email with all the details.</p>
      </div>
    `;
  }

  bookAppointment() {
    // TO DO: implement appointment booking logic
    this.appointmentBooked = true;
    this.showStep(this.currentStep + 1);
  }

  saveDraft() {
    localStorage.setItem('homemaxx_offer_progress', JSON.stringify({
      currentStep: this.currentStep,
      formData: this.formData,
      userType: this.userType,
      timestamp: Date.now()
    }));
    
    // Redirect to home page after saving
    window.location.href = '/';
  }

  async submitForm() {
    console.log('Submitting form data:', this.formData);
    
    try {
      // Get email from input field
      const emailInput = document.getElementById('email-input');
      const email = emailInput?.value || this.formData.email || '';
      
      if (!email) {
        console.error('No email provided for form submission');
        alert('Please enter your email address to continue.');
        return;
      }
      
      // Store email in formData
      this.formData.email = email;
      
      // Prepare data for GHL webhook with contact as div structure
      const contactData = {
        contact: {
          // Basic contact information
          firstName: this.extractFirstName(),
          lastName: this.extractLastName(),
          email: email,
          phone: this.formData.phone || '',
          
          // Property information
          address: this.formData.address || this.preconfirmedAddress,
          propertyType: 'Single Family Home',
          
          // Funnel responses
          ownerType: this.formData['owner-type'] || 'owner',
          timeline: this.formData['timeline'] || 'flexible',
          kitchenCountertops: this.formData['kitchen-countertops'] || 'unknown',
          kitchenQuality: this.formData['kitchen-quality'] || 'standard',
          hasHOA: this.formData.hasHOA || 'unknown',
          hoaFees: this.formData['hoa-fees'] || 0,
          propertyIssues: this.formData['property-issues'] || [],
          
          // Lead source and tracking
          leadSource: 'HomeMAXX Funnel',
          funnelStep: 'Completed',
          submissionDate: new Date().toISOString(),
          userAgent: navigator.userAgent,
          
          // Custom fields for GHL
          customFields: {
            funnel_completion_date: new Date().toISOString(),
            property_address: this.formData.address || this.preconfirmedAddress,
            seller_timeline: this.formData['timeline'] || 'flexible',
            property_condition: this.formData['kitchen-quality'] || 'standard',
            hoa_status: this.formData.hasHOA || 'unknown',
            lead_priority: 'Standard - Funnel Completion',
            contact_method: 'Email Provided',
            calculation_status: 'Pending'
          }
        }
      };

      console.log('Submitting to GHL webhook:', contactData);

      // Submit to GHL webhook
      const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/46e87a3a-c1d7-4bea-8a70-a022cb1b80ae';
      
      const response = await fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      console.log('GHL webhook response status:', response.status);
      console.log('GHL webhook response headers:', response.headers);

      if (response.ok) {
        console.log('Successfully submitted to GHL webhook');
        const responseText = await response.text();
        console.log('GHL webhook response:', responseText);
        
        // Move to qualification step
        this.showStep(this.currentStep + 1);
        setTimeout(() => this.performQualificationCheck(), 500);
        
      } else {
        console.error('GHL webhook submission failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('GHL webhook error response:', errorText);
        
        // Still proceed to qualification but log the error
        this.showStep(this.currentStep + 1);
        setTimeout(() => this.performQualificationCheck(), 500);
      }

    } catch (error) {
      console.error('Form submission error:', error);
      // Still proceed to qualification step even if webhook fails
      this.showStep(this.currentStep + 1);
      setTimeout(() => this.performQualificationCheck(), 500);
    }
  }

  extractFirstName() {
    const email = this.formData.email || document.getElementById('email-input')?.value || '';
    const emailPrefix = email.split('@')[0];
    
    // Try to extract first name from email prefix
    if (emailPrefix.includes('.')) {
      return emailPrefix.split('.')[0];
    } else if (emailPrefix.includes('_')) {
      return emailPrefix.split('_')[0];
    } else {
      return emailPrefix || 'Unknown';
    }
  }

  extractLastName() {
    const email = this.formData.email || document.getElementById('email-input')?.value || '';
    const emailPrefix = email.split('@')[0];
    
    // Try to extract last name from email prefix
    if (emailPrefix.includes('.')) {
      const parts = emailPrefix.split('.');
      return parts.length > 1 ? parts[1] : 'Unknown';
    } else if (emailPrefix.includes('_')) {
      const parts = emailPrefix.split('_');
      return parts.length > 1 ? parts[1] : 'Unknown';
    } else {
      return 'Unknown';
    }
  }
}

// Global functions for onclick handlers
function goNext() {
  if (window.funnelInstance) {
    window.funnelInstance.nextStep();
  }
}

function goBack() {
  if (window.funnelInstance) {
    window.funnelInstance.prevStep();
  }
}

function saveDraft() {
  if (window.funnelInstance) {
    window.funnelInstance.saveDraft();
  }
}

function contactSupport() {
  window.open('tel:(725) 772-9847', '_self');
}

// Make funnel instance globally available
window.addEventListener('DOMContentLoaded', function() {
  window.funnelInstance = new OpendoorFunnel();
});
