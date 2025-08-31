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
        id: 'motivation',
        title: "What's prompting you to think about selling your property at this time?",
        subtitle: 'This helps us understand your goals so we can provide the best options while personalizing it to you. Please choose all that apply.',
        render: () => this.renderMotivationStep()
      },
      {
        id: 'price-expectations',
        title: 'Do you have an idea of what you\'d like to receive for the property?',
        subtitle: 'No pressure here — sharing your expectations simply helps us understand what would work best for you.',
        render: () => this.renderPriceExpectationsStep()
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
        id: 'bathroom-quality',
        title: this.userType === 'agent' ? 'How would you describe your client\'s bathroom?' : 'How would you describe your bathroom?',
        subtitle: 'For these questions, just select the closest match.',
        render: () => this.renderBathroomQualityStep()
      },
      {
        id: 'living-room-quality',
        title: this.userType === 'agent' ? 'How would you describe your client\'s living room?' : 'How would you describe your living room?',
        subtitle: 'For these questions, just select the closest match.',
        render: () => this.renderLivingRoomQualityStep()
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

    // Photo upload events
    document.addEventListener('change', (e) => {
      if (e.target.id === 'photo-upload-input') {
        this.handlePhotoUpload(e);
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('#photo-upload-zone')) {
        document.getElementById('photo-upload-input')?.click();
      }
      if (e.target.classList.contains('remove-photo')) {
        this.removePhoto(e.target.dataset.index);
      }
    });

    // Drag and drop events
    document.addEventListener('dragover', (e) => {
      if (e.target.closest('#photo-upload-zone')) {
        e.preventDefault();
        e.target.closest('#photo-upload-zone').classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      if (e.target.closest('#photo-upload-zone')) {
        e.target.closest('#photo-upload-zone').classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      if (e.target.closest('#photo-upload-zone')) {
        e.preventDefault();
        e.target.closest('#photo-upload-zone').classList.remove('drag-over');
        this.handlePhotoDrop(e);
      }
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
      this.userType = value === 'agent' || value === 'agent-owner' ? 'agent' : 'owner';
      this.updateStepTitles();
      // Recreate steps to update conditions and titles
      this.createSteps();
    }
    
    if (currentStepId === 'hoa-question') {
      this.formData.hasHOA = value;
      // Recreate steps to update HOA condition
      this.createSteps();
    }
    
    // Auto-advance to next step after brief delay
    setTimeout(() => {
      this.nextStep();
    }, 800);
  }

  selectImageOption(value) {
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep].id;
    this.formData[currentStepId] = value;
    
    // Update UI
    document.querySelectorAll('.image-option').forEach(option => {
      option.classList.remove('selected');
    });
    event.target.closest('.image-option').classList.add('selected');
    
    // Auto-advance to next step after brief delay
    setTimeout(() => {
      this.nextStep();
    }, 800);
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

  renderMotivationStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('moving-to-new-home')" data-translate="motivation-moving-to-new-home">Moving to a new home</button>
        <button class="option-btn" onclick="selectOption('job-relocation')" data-translate="motivation-job-relocation">Job relocation</button>
        <button class="option-btn" onclick="selectOption('retirement')" data-translate="motivation-retirement">Retirement</button>
        <button class="option-btn" onclick="selectOption('divorce')" data-translate="motivation-divorce">Divorce</button>
        <button class="option-btn" onclick="selectOption('inheritance')" data-translate="motivation-inheritance">Inheritance</button>
        <button class="option-btn" onclick="selectOption('other')" data-translate="motivation-other">Other</button>
      </div>
    `;
  }

  renderPriceExpectationsStep() {
    return `
      <div class="option-grid">
        <button class="option-btn" onclick="selectOption('under-200k')" data-translate="price-expectations-under-200k">Under $200,000</button>
        <button class="option-btn" onclick="selectOption('200k-300k')" data-translate="price-expectations-200k-300k">$200,000 - $300,000</button>
        <button class="option-btn" onclick="selectOption('300k-400k')" data-translate="price-expectations-300k-400k">$300,000 - $400,000</button>
        <button class="option-btn" onclick="selectOption('400k-500k')" data-translate="price-expectations-400k-500k">$400,000 - $500,000</button>
        <button class="option-btn" onclick="selectOption('500k-plus')" data-translate="price-expectations-500k-plus">$500,000+</button>
        <button class="option-btn" onclick="selectOption('unsure')" data-translate="price-expectations-unsure">Unsure</button>
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
        <div class="image-option" onclick="selectImageOption('luxury')" data-translate="kitchen-quality-luxury">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Luxury Kitchen">
          <div class="image-option-content">
            <div class="image-option-title">Luxury</div>
            <div class="image-option-description">Premium finishes</div>
          </div>
        </div>
      </div>
    `;
  }

  renderBathroomQualityStep() {
    return `
      <div class="image-options">
        <div class="image-option" onclick="selectImageOption('fixer-upper')" data-translate="bathroom-quality-fixer-upper">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Fixer Upper Bathroom">
          <div class="image-option-content">
            <div class="image-option-title">Fixer Upper</div>
            <div class="image-option-description">Needs major work</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('dated')" data-translate="bathroom-quality-dated">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="Dated Bathroom">
          <div class="image-option-content">
            <div class="image-option-title">Dated</div>
            <div class="image-option-description">Needs updating</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('standard')" data-translate="bathroom-quality-standard">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Standard Bathroom">
          <div class="image-option-content">
            <div class="image-option-title">Standard</div>
            <div class="image-option-description">Move-in ready</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('high-end')" data-translate="bathroom-quality-high-end">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="High End Bathroom">
          <div class="image-option-content">
            <div class="image-option-title">High end</div>
            <div class="image-option-description">Recently renovated</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('luxury')" data-translate="bathroom-quality-luxury">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Luxury Bathroom">
          <div class="image-option-content">
            <div class="image-option-title">Luxury</div>
            <div class="image-option-description">Premium finishes</div>
          </div>
        </div>
      </div>
    `;
  }

  renderLivingRoomQualityStep() {
    return `
      <div class="image-options">
        <div class="image-option" onclick="selectImageOption('fixer-upper')" data-translate="living-room-quality-fixer-upper">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Fixer Upper Living Room">
          <div class="image-option-content">
            <div class="image-option-title">Fixer Upper</div>
            <div class="image-option-description">Needs major work</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('dated')" data-translate="living-room-quality-dated">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="Dated Living Room">
          <div class="image-option-content">
            <div class="image-option-title">Dated</div>
            <div class="image-option-description">Needs updating</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('standard')" data-translate="living-room-quality-standard">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Standard Living Room">
          <div class="image-option-content">
            <div class="image-option-title">Standard</div>
            <div class="image-option-description">Move-in ready</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('high-end')" data-translate="living-room-quality-high-end">
          <img src="https://images.unsplash.com/photo-1556909114-4f5f9e8b8c8c?w=300&h=120&fit=crop" alt="High End Living Room">
          <div class="image-option-content">
            <div class="image-option-title">High end</div>
            <div class="image-option-description">Recently renovated</div>
          </div>
        </div>
        <div class="image-option" onclick="selectImageOption('luxury')" data-translate="living-room-quality-luxury">
          <img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=120&fit=crop" alt="Luxury Living Room">
          <div class="image-option-content">
            <div class="image-option-title">Luxury</div>
            <div class="image-option-description">Premium finishes</div>
          </div>
        </div>
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
        <label class="form-label" data-translate="contact-full-name">Full Name *</label>
        <input type="text" 
               class="form-input" 
               placeholder="Enter your full name"
               id="full-name-input"
               required>
      </div>
      
      <div class="form-group">
        <label class="form-label" data-translate="contact-email">Email *</label>
        <input type="email" 
               class="form-input" 
               placeholder="Enter your email"
               id="email-input"
               required>
      </div>
      
      <div class="form-group">
        <label class="form-label" data-translate="contact-phone">Phone Number *</label>
        <input type="tel" 
               class="form-input" 
               placeholder="Enter your phone number"
               id="phone-input"
               required>
      </div>
      
      <div class="form-group" style="margin-top: 1rem;">
        <label style="display: flex; align-items: flex-start; font-size: 0.875rem; color: #374151; line-height: 1.4;">
          <input type="checkbox" id="sms-consent-checkbox" style="margin-right: 0.5rem; margin-top: 0.2rem; flex-shrink: 0;" required>
          <span>
            I consent to receive SMS messages from HomeMAXX about my property evaluation, cash offers, and related real estate services. 
            Message frequency varies (up to 5 messages per week). Message and data rates may apply. 
            Reply <strong>STOP</strong> to opt out or <strong>HELP</strong> for help. 
            Carriers are not liable for delayed or undelivered messages. 
            By providing my phone number, I agree to HomeMAXX's 
            <a href="pages/legal/terms-of-service.html" style="color: #3b82f6; text-decoration: underline;" target="_blank">Terms of Service</a> and 
            <a href="pages/legal/privacy-policy.html" style="color: #3b82f6; text-decoration: underline;" target="_blank">Privacy Policy</a>.
          </span>
        </label>
      </div>
      
      <button class="btn btn-primary" style="width: 100%;" onclick="submitForm()" data-translate="contact-submit">Get My Cash Offer</button>
      
      <p style="font-size: 0.75rem; color: #6b7280; text-align: center; margin-top: 1rem;" data-translate="contact-terms">
        By clicking "Get My Cash Offer", you agree to HomeMAXX's 
        <a href="pages/legal/terms-of-service.html" style="color: #3b82f6;">terms of service</a> and 
        <a href="pages/legal/privacy-policy.html" style="color: #3b82f6;">Privacy Policy</a>.
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
      bathroomQuality: this.formData['bathroom-quality'] || 'average',
      livingRoomQuality: this.formData['living-room-quality'] || 'average',
      timeline: this.formData['timeline'] || this.formData.timeline || 'flexible',
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
      qualificationScore, 
      bonusEligible,
      marketInsights,
      nextSteps 
    } = offerData;

    const isQualified = qualificationScore >= 70;
    
    // Safe check for assignmentFeeProjection
    const assignmentTier = offerData.assignmentFeeProjection?.tier || 'standard';
    const assignmentAmount = offerData.assignmentFeeProjection?.projectedFee || 0;

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
      qualificationScore, 
      bonusEligible,
      marketInsights 
    } = offerData;

    // Check qualification status for popup
    if (offerData.priority && offerData.priority.qualificationStatus === 'AUTO_APPROVED') {
      this.showAutoApprovedPopup();
    } else if (offerData.priority && offerData.priority.qualificationStatus === 'MANUAL_REVIEW') {
      this.showSubjectToApprovalPopup();
    }

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
      bonusEligible,
      marketInsights,
      nextSteps 
    } = offerData;

    const isQualified = qualificationScore >= 70;
    
    // Safe check for assignmentFeeProjection
    const assignmentTier = offerData.assignmentFeeProjection?.tier || 'standard';
    const assignmentAmount = offerData.assignmentFeeProjection?.projectedFee || 0;

    return `
      <div class="unqualified-result">
        ${isQualified ? this.renderQualifiedOffer(offerData) : this.renderUnqualifiedResult(offerData)}
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

  async sendOfferAnyway() {
    console.log('Sending offer anyway for manual review');
    
    try {
      // Prepare fallback data for GHL webhook
      const contactData = {
        contact: {
          // Basic contact information
          firstName: this.extractFirstName(),
          lastName: this.extractLastName(),
          email: this.formData.email || '',
          phone: this.formData.phone || '',
          
          // Property information
          address: this.formData.address || this.preconfirmedAddress || '',
          
          // Survey responses mapped to GHL custom fields - ALL collected data
          property_address: this.formData.address || this.preconfirmedAddress || '',
          seller_timeline: this.formData['timeline'] || this.formData.timeline || 'not_specified',
          property_condition: this.formData['kitchen-quality'] || this.formData.kitchenQuality || 'not_specified',
          kitchen_countertops: this.formData['kitchen-countertops'] || this.formData.kitchenCountertops || 'not_specified',
          kitchen_quality: this.formData['kitchen-quality'] || this.formData.kitchenQuality || 'not_specified',
          bathroom_quality: this.formData['bathroom-quality'] || this.formData.bathroomQuality || 'not_specified',
          living_room_quality: this.formData['living-room-quality'] || this.formData.livingRoomQuality || 'not_specified',
          hoa_status: this.formData.hasHOA || this.formData.hoaStatus || 'not_specified',
          hoa_monthly_fees: this.formData['hoa-fees'] || this.formData.hoaFees || '0',
          property_issues: Array.isArray(this.formData['property-issues']) ? 
            this.formData['property-issues'] : 
            (Array.isArray(this.formData.propertyIssues) ? this.formData.propertyIssues : ['none']),
          owner_type: this.formData['owner-type'] || this.formData.ownerType || 'owner',
          user_type: this.userType,
          sms_consent: this.formData.smsConsent ? 'yes' : 'no',
          sms_consent_timestamp: this.formData.smsConsent ? new Date().toISOString() : null,
          sms_consent_ip: this.formData.smsConsent ? (await this.getUserIP()) : null,
          lead_priority: 'Manual Review Required',
          contact_method: 'Email and Phone Provided',
          calculation_status: 'Manual Review',
          funnel_completion_date: new Date().toISOString(),
          
          // Additional collected data
          cash_offer_claimed: this.formData.cashOfferClaimed || false,
          funnel_version: '2.0',
          data_collection_complete: true,
          
          // Lead source and tracking
          leadSource: 'HomeMAXX Funnel',
          funnelStep: 'Completed',
          submissionDate: new Date().toISOString(),
          userAgent: navigator.userAgent,
          
          // Debug: Include raw form data for verification
          raw_form_data: JSON.stringify(this.formData)
        }
      };

      console.log('Submitting comprehensive data to GHL webhook:', contactData);

      // Submit to GHL webhook
      const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/54168c84-2392-4dd4-b6ce-a4eb171801f9';
      
      const response = await fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      console.log('GHL webhook response status:', response.status);

      if (response.ok) {
        console.log('Successfully submitted comprehensive data to GHL webhook');
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
      console.error('Send offer anyway error:', error);
      // Still proceed to qualification step even if webhook fails
      this.showStep(this.currentStep + 1);
      setTimeout(() => this.performQualificationCheck(), 500);
    }
  }

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

  async bookAppointment() {
    try {
      // Show loading state
      const bookingButton = document.querySelector('.btn-primary');
      if (bookingButton) {
        bookingButton.textContent = 'Loading Calendar...';
        bookingButton.disabled = true;
      }

      // Get available slots
      const slotsResponse = await fetch('/.netlify/functions/get-available-slots', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!slotsResponse.ok) {
        throw new Error('Failed to fetch available slots');
      }

      const slotsData = await slotsResponse.json();
      
      // Show calendar modal with available slots
      this.showCalendarModal(slotsData.slots);
      
    } catch (error) {
      console.error('Appointment booking error:', error);
      alert('Unable to load calendar. Please call (725) 772-9847 to schedule your appointment.');
    } finally {
      // Reset button state
      const bookingButton = document.querySelector('.btn-primary');
      if (bookingButton) {
        bookingButton.textContent = 'Book Appointment';
        bookingButton.disabled = false;
      }
    }
  }

  showCalendarModal(availableSlots) {
    const modalHTML = `
      <div id="calendar-modal" class="modal-overlay" style="
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: rgba(0,0,0,0.5); z-index: 10000; display: flex; 
        align-items: center; justify-content: center;">
        <div class="modal-content" style="
          background: white; border-radius: 12px; padding: 30px; 
          max-width: 500px; width: 90%; max-height: 80vh; overflow-y: auto;">
          <h3 style="margin-top: 0; color: #1f2937;">Select Your Appointment Time</h3>
          <p style="color: #6b7280; margin-bottom: 20px;">Choose a convenient time for your $7,500 cash offer consultation</p>
          
          <div id="slots-container">
            ${this.renderAvailableSlots(availableSlots)}
          </div>
          
          <div style="margin-top: 20px; text-align: center;">
            <button onclick="window.funnelInstance.closeCalendarModal()" 
              style="background: #6b7280; color: white; border: none; padding: 10px 20px; 
              border-radius: 6px; cursor: pointer; margin-right: 10px;">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
  }

  renderAvailableSlots(slots) {
    if (!slots || slots.length === 0) {
      return '<p style="text-align: center; color: #6b7280;">No available slots. Please call (725) 772-9847.</p>';
    }

    return slots.map(dayGroup => `
      <div style="margin-bottom: 20px;">
        <h4 style="color: #374151; margin-bottom: 10px;">${dayGroup.date}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px;">
          ${dayGroup.slots.map(slot => `
            <button onclick="window.funnelInstance.selectTimeSlot('${slot.startTime}', '${slot.endTime}', '${slot.displayTime}')"
              style="background: #3b82f6; color: white; border: none; padding: 8px 12px; 
              border-radius: 6px; cursor: pointer; font-size: 14px; transition: background 0.2s;"
              onmouseover="this.style.background='#2563eb'"
              onmouseout="this.style.background='#3b82f6'">
              ${slot.displayTime}
            </button>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  async selectTimeSlot(startTime, endTime, displayTime) {
    try {
      // Show booking confirmation
      const confirmed = confirm(`Confirm appointment for ${displayTime}?`);
      if (!confirmed) return;

      // Prepare lead data for booking
      const leadData = {
        firstName: this.extractFirstName(),
        lastName: this.extractLastName(),
        email: this.formData.email || '',
        phone: this.formData.phone || '',
        address: {
          full: this.formData.address || this.preconfirmedAddress || '',
          state: this.extractStateFromAddress(this.formData.address || this.preconfirmedAddress || '')
        },
        timeline: this.formData.timeline || this.formData['seller-timeline'] || '',
        propertyType: this.formData.propertyType || this.formData['property-type'] || '',
        propertyCondition: this.formData.propertyCondition || this.formData['property-condition'] || '',
        propertyDetails: {
          estimatedValue: this.offerData?.marketValue?.estimated || 0
        }
      };

      const selectedSlot = { startTime, endTime };

      // Book appointment via Netlify function
      const response = await fetch('/.netlify/functions/book-appointment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          leadData,
          selectedSlot
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Booking failed');
      }

      const result = await response.json();
      
      // Close modal and show success
      this.closeCalendarModal();
      this.appointmentBooked = true;
      this.showBookingConfirmation(displayTime, result.appointmentId);
      
    } catch (error) {
      console.error('Slot selection error:', error);
      alert('Booking failed. Please try again or call (725) 772-9847.');
    }
  }

  extractStateFromAddress(address) {
    if (!address) return '';
    const stateMatch = address.match(/\b([A-Z]{2})\b/);
    return stateMatch ? stateMatch[1] : '';
  }

  closeCalendarModal() {
    const modal = document.getElementById('calendar-modal');
    if (modal) {
      modal.remove();
    }
  }

  showBookingConfirmation(displayTime, appointmentId) {
    const confirmationHTML = `
      <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
        <h3 style="margin: 0 0 10px 0;">🎉 Appointment Confirmed!</h3>
        <p style="margin: 0;">Your consultation is scheduled for ${displayTime}</p>
        <p style="margin: 10px 0 0 0; font-size: 14px;">Confirmation #${appointmentId}</p>
      </div>
    `;
    
    // Replace the booking button area with confirmation
    const bookingContainer = document.querySelector('.calendar-booking');
    if (bookingContainer) {
      bookingContainer.innerHTML = confirmationHTML;
    }
    
    // Move to next step after a short delay
    setTimeout(() => {
      this.showStep(this.currentStep + 1);
    }, 3000);
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
      // Get form inputs
      const fullNameInput = document.getElementById('full-name-input');
      const emailInput = document.getElementById('email-input');
      const phoneInput = document.getElementById('phone-input');
      const smsConsentCheckbox = document.getElementById('sms-consent-checkbox');
      
      // Extract required and optional data
      const email = emailInput?.value?.trim() || '';
      const fullName = fullNameInput?.value?.trim() || '';
      const phone = phoneInput?.value?.trim() || '';
      const smsConsent = smsConsentCheckbox?.checked || false;
      
      // Validate required fields
      if (!email) {
        alert('Please enter your email address.');
        return;
      }
      
      if (!fullName) {
        alert('Please enter your full name.');
        return;
      }
      
      if (!phone) {
        alert('Please enter your phone number.');
        return;
      }
      
      if (!smsConsent) {
        alert('Please agree to receive SMS messages to continue.');
        return;
      }
      
      // Split full name into first and last name
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Store in form data
      this.formData.email = email;
      this.formData.fullName = fullName;
      this.formData.firstName = firstName;
      this.formData.lastName = lastName;
      this.formData.phone = phone;
      this.formData.smsConsent = smsConsent;
      
      // Prepare comprehensive data for GHL webhook
      const contactData = {
        contact: {
          // Basic contact information
          firstName: firstName,
          lastName: lastName,
          email: email,
          phone: phone,
          
          // Property information
          address: this.formData.address || this.preconfirmedAddress || '',
          
          // Survey responses mapped to GHL custom fields - ALL collected data
          property_address: this.formData.address || this.preconfirmedAddress || '',
          seller_timeline: this.formData['timeline'] || this.formData.timeline || 'not_specified',
          property_condition: this.formData['kitchen-quality'] || this.formData.kitchenQuality || 'not_specified',
          kitchen_countertops: this.formData['kitchen-countertops'] || this.formData.kitchenCountertops || 'not_specified',
          kitchen_quality: this.formData['kitchen-quality'] || this.formData.kitchenQuality || 'not_specified',
          bathroom_quality: this.formData['bathroom-quality'] || this.formData.bathroomQuality || 'not_specified',
          living_room_quality: this.formData['living-room-quality'] || this.formData.livingRoomQuality || 'not_specified',
          hoa_status: this.formData.hasHOA || this.formData.hoaStatus || 'not_specified',
          hoa_monthly_fees: this.formData['hoa-fees'] || this.formData.hoaFees || '0',
          property_issues: Array.isArray(this.formData['property-issues']) ? 
            this.formData['property-issues'] : 
            (Array.isArray(this.formData.propertyIssues) ? this.formData.propertyIssues : ['none']),
          owner_type: this.formData['owner-type'] || this.formData.ownerType || 'owner',
          user_type: this.userType,
          
          // NEW: Motivation fields
          motivations: Array.isArray(this.formData.motivations) ? 
            this.formData.motivations.join(', ') : 'not_specified',
          unique_situation_details: this.formData['unique-situation-details'] || '',
          
          // NEW: Price expectations fields
          price_expectation_type: this.formData['price-expectation-type'] || 'not_specified',
          price_expectation: this.formData['price-expectation'] || '',
          price_expectation_range: this.formData['price-expectation-range'] || '',
          
          // NEW: Photo upload data
          photos_uploaded: this.formData.photos ? this.formData.photos.length : 0,
          photo_metadata: this.formData.photos ? JSON.stringify(this.formData.photos.map(photo => ({
            name: photo.name,
            size: photo.originalSize,
            type: photo.type,
            timestamp: photo.timestamp
          }))) : '[]',
          property_photos: this.formData.photos ? this.formData.photos.map(photo => ({
            name: photo.name,
            data: photo.dataUrl,
            type: photo.type
          })) : [],
          
          sms_consent: smsConsent ? 'yes' : 'no',
          sms_consent_timestamp: smsConsent ? new Date().toISOString() : null,
          sms_consent_ip: smsConsent ? (await this.getUserIP()) : null,
          lead_priority: 'Standard - Funnel Completion',
          contact_method: 'Email and Phone Provided',
          calculation_status: 'Pending Qualification',
          funnel_completion_date: new Date().toISOString(),
          
          // Additional collected data
          cash_offer_claimed: this.formData.cashOfferClaimed || false,
          funnel_version: '2.0',
          data_collection_complete: true,
          
          // Lead source and tracking
          leadSource: 'HomeMAXX Funnel',
          funnelStep: 'Completed',
          submissionDate: new Date().toISOString(),
          userAgent: navigator.userAgent,
          
          // Debug: Include raw form data for verification
          raw_form_data: JSON.stringify(this.formData)
        }
      };

      console.log('Submitting comprehensive data to GHL webhook:', contactData);

      // Submit to GHL webhook
      const GHL_WEBHOOK_URL = 'https://services.leadconnectorhq.com/hooks/MyNhX7NAs8SVM9vQMbqZ/webhook-trigger/54168c84-2392-4dd4-b6ce-a4eb171801f9';
      
      const response = await fetch(GHL_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(contactData)
      });

      console.log('GHL webhook response status:', response.status);

      if (response.ok) {
        console.log('Successfully submitted comprehensive data to GHL webhook');
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

  async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Failed to get user IP:', error);
      return null;
    }
  }

  showAutoApprovedPopup() {
    const popup = document.getElementById('auto-approved-popup');
    popup.style.display = 'block';
  }

  showSubjectToApprovalPopup() {
    const popup = document.getElementById('subject-to-approval-popup');
    popup.style.display = 'block';
  }

  async handlePhotoUpload(event) {
    const files = Array.from(event.target.files);
    await this.processPhotoFiles(files);
  }

  async handlePhotoDrop(event) {
    const files = Array.from(event.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    await this.processPhotoFiles(files);
  }

  async processPhotoFiles(files) {
    if (!this.formData.photos) {
      this.formData.photos = [];
    }

    const maxPhotos = 24;
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/heic', 'image/heif'];

    for (const file of files) {
      if (this.formData.photos.length >= maxPhotos) {
        alert(`Maximum of ${maxPhotos} photos allowed.`);
        break;
      }

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert(`${file.name} is not a supported image format. Please use JPG, PNG, or HEIC.`);
        continue;
      }

      if (file.size > maxFileSize) {
        alert(`${file.name} is too large. Please use images under 10MB.`);
        continue;
      }

      try {
        const photoData = await this.processPhoto(file);
        this.formData.photos.push(photoData);
      } catch (error) {
        console.error('Error processing photo:', error);
        alert(`Error processing ${file.name}. Please try again.`);
      }
    }

    this.updatePhotoPreview();
    this.updateNavigationState();
  }

  async processPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          const maxWidth = 1200;
          const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          resolve({
            name: file.name,
            size: file.size,
            type: file.type,
            dataUrl: compressedDataUrl,
            originalSize: file.size,
            compressedSize: compressedDataUrl.length,
            timestamp: Date.now()
          });
        };
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  updatePhotoPreview() {
    const previewGrid = document.getElementById('photo-preview-grid');
    const photoCount = document.getElementById('photo-count-text');
    
    if (!previewGrid || !this.formData.photos) return;

    previewGrid.innerHTML = this.formData.photos.map((photo, index) => `
      <div class="photo-preview-item">
        <img src="${photo.dataUrl}" alt="${photo.name}" />
        <div class="photo-overlay">
          <button type="button" class="remove-photo" data-index="${index}">×</button>
        </div>
        <div class="photo-info">
          <span class="photo-name">${photo.name}</span>
        </div>
      </div>
    `).join('');

    if (photoCount) {
      const count = this.formData.photos.length;
      photoCount.textContent = `${count} photo${count !== 1 ? 's' : ''} uploaded`;
    }
  }

  removePhoto(index) {
    if (this.formData.photos && this.formData.photos[index]) {
      this.formData.photos.splice(index, 1);
      this.updatePhotoPreview();
      this.updateNavigationState();
    }
  }

  updateNavigationState() {
    const currentStepId = this.steps.filter(step => !step.condition || step.condition())[this.currentStep]?.id;
    const nextBtn = document.getElementById('next-btn');
    
    if (!nextBtn) return;
    
    let canProceed = false;
    
    switch (currentStepId) {
      case 'motivation':
        canProceed = this.formData.motivations && this.formData.motivations.length > 0;
        break;
        
      case 'price-expectations':
        const hasNumberType = this.formData['price-expectation-type'] === 'has-number';
        const noNumberType = this.formData['price-expectation-type'] === 'no-number';
        
        if (hasNumberType) {
          canProceed = this.formData['price-expectation'] && this.formData['price-expectation'].trim().length > 0;
        } else if (noNumberType) {
          canProceed = this.formData['price-expectation'] && this.formData['price-expectation'] !== '';
        } else {
          canProceed = false;
        }
        break;
        
      case 'property-issues':
        canProceed = this.formData['property-issues'] && this.formData['property-issues'].length > 0;
        break;
        
      case 'photo-upload':
        canProceed = true;
        break;
        
      default:
        canProceed = true;
        break;
    }
    
    nextBtn.disabled = !canProceed;
    nextBtn.style.opacity = canProceed ? '1' : '0.5';
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

// Global functions for funnel navigation and form handling
window.selectOption = function(value) {
  if (window.funnelInstance) {
    window.funnelInstance.selectOption(value);
  }
};

window.selectImageOption = function(value) {
  if (window.funnelInstance) {
    window.funnelInstance.selectImageOption(value);
  }
};

window.goNext = function() {
  if (window.funnelInstance) {
    window.funnelInstance.nextStep();
  }
};

window.goBack = function() {
  if (window.funnelInstance) {
    window.funnelInstance.previousStep();
  }
};

// New handler functions for motivation and price expectations
window.handleMotivationChange = function(checkbox) {
  if (window.funnelInstance) {
    const motivations = window.funnelInstance.formData.motivations || [];
    
    if (checkbox.checked) {
      if (!motivations.includes(checkbox.value)) {
        motivations.push(checkbox.value);
      }
      
      // Show unique situation text area if selected
      if (checkbox.value === 'unique-situation') {
        document.getElementById('unique-situation-text').style.display = 'block';
      }
    } else {
      const index = motivations.indexOf(checkbox.value);
      if (index > -1) {
        motivations.splice(index, 1);
      }
      
      // Hide unique situation text area if deselected
      if (checkbox.value === 'unique-situation') {
        document.getElementById('unique-situation-text').style.display = 'none';
        window.funnelInstance.formData['unique-situation-details'] = '';
      }
    }
    
    window.funnelInstance.formData.motivations = motivations;
    window.funnelInstance.updateNavigationState();
  }
};

window.handleUniquesituationChange = function(textarea) {
  if (window.funnelInstance) {
    window.funnelInstance.formData['unique-situation-details'] = textarea.value;
  }
};

window.showPriceOption = function(option) {
  // Update button states
  document.getElementById('has-number-btn').classList.remove('active');
  document.getElementById('no-number-btn').classList.remove('active');
  
  if (option === 'has-number') {
    document.getElementById('has-number-btn').classList.add('active');
    document.getElementById('has-number-section').style.display = 'block';
    document.getElementById('no-number-section').style.display = 'none';
  } else {
    document.getElementById('no-number-btn').classList.add('active');
    document.getElementById('has-number-section').style.display = 'none';
    document.getElementById('no-number-section').style.display = 'block';
  }
  
  if (window.funnelInstance) {
    window.funnelInstance.formData['price-expectation-type'] = option;
    window.funnelInstance.updateNavigationState();
  }
};

window.handlePriceInputChange = function(input) {
  if (window.funnelInstance) {
    window.funnelInstance.formData['price-expectation'] = input.value;
    window.funnelInstance.updateNavigationState();
  }
};

window.selectPriceRange = function(range) {
  // Update button states
  document.querySelectorAll('#no-number-section .option-btn').forEach(btn => {
    btn.classList.remove('selected');
  });
  
  event.target.classList.add('selected');
  
  if (window.funnelInstance) {
    window.funnelInstance.formData['price-expectation'] = range;
    window.funnelInstance.updateNavigationState();
  }
};
