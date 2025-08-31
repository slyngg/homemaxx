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
    
    // Clear any previous data to ensure fresh start
    this.clearPreviousData();
    this.init();
  }

  clearPreviousData() {
    // Clear all HomeMAXX-related localStorage items to prevent data persistence
    const keysToRemove = [
      'homemaxx_confirmed_address',
      'homemaxx_funnel_data',
      'homemaxx_current_step',
      'homemaxx_offer_progress'
    ];
    
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Cleared previous funnel data for fresh start');
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
      <div class="checkbox-grid">
        <label class="checkbox-option">
          <input type="checkbox" value="moving-to-new-home" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-moving-to-new-home">Moving to a new home</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="job-relocation" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-job-relocation">Job relocation</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="retirement" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-retirement">Retirement</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="divorce" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-divorce">Divorce</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="financial-hardship" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-financial-hardship">Financial hardship</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="downsizing" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-downsizing">Downsizing</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="inheritance" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-inheritance">Inheritance</span>
        </label>
        <label class="checkbox-option">
          <input type="checkbox" value="unique-situation" onchange="handleMotivationChange(this)">
          <span class="checkbox-label" data-translate="motivation-unique-situation">Unique situation</span>
        </label>
      </div>
      
      <div id="unique-situation-text" style="display: none; margin-top: 1rem;">
        <label class="form-label" data-translate="motivation-unique-details">Please describe your unique situation:</label>
        <textarea class="form-input" 
                  placeholder="Tell us more about your situation..." 
                  rows="3"
                  onchange="handleUniquesituationChange(this)"
                  data-translate-placeholder="motivation-unique-placeholder"></textarea>
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

  async submitForm() {
    console.log('Submitting form data:', this.formData);
    
    // Prevent multiple submissions
    const submitButton = document.querySelector('button[onclick="submitForm()"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Submitting...';
    }
    
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

      // Basic validation
      if (!email || !fullName || !phone) {
        alert('Please fill in all required fields.');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit My Information';
        }
        return;
      }

      // Extract first and last name
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

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
          
          // NEW: Motivation fields (arrays)
          motivations: Array.isArray(this.formData.motivations) ? this.formData.motivations : [],
          unique_situation_details: this.formData['unique-situation-details'] || '',
          
          // NEW: Price expectation fields
          price_expectation_type: this.formData['price-expectation-type'] || 'not_specified',
          price_expectation: this.formData['price-expectation'] || '',
          price_expectation_range: this.formData['price-expectation-range'] || '',
          
          // Fixed: Property issues as array
          property_issues: Array.isArray(this.formData['property-issues']) ? 
            this.formData['property-issues'] : 
            (Array.isArray(this.formData.propertyIssues) ? this.formData.propertyIssues : ['none']),
          owner_type: this.formData['owner-type'] || this.formData.ownerType || 'owner',
          user_type: this.userType,
          
          // NEW: Photo upload data
          photos_uploaded: this.formData.photos ? this.formData.photos.length : 0,
          photo_metadata: this.formData.photos ? JSON.stringify(this.formData.photos.map(photo => ({
            name: photo.name,
            size: photo.size,
            type: photo.type,
            timestamp: Date.now()
          }))) : '[]',
          
          sms_consent: smsConsent ? 'yes' : 'no',
          sms_consent_timestamp: smsConsent ? new Date().toISOString() : null,
          sms_consent_ip: smsConsent ? (await this.getUserIP()) : null,
          lead_priority: 'Standard - Funnel Completion',
          contact_method: 'Email and Phone Provided',
          calculation_status: 'Completed',
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
        
        // Show success confirmation
        this.showSuccessConfirmation(firstName);
        
      } else {
        console.error('GHL webhook submission failed:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('GHL webhook error response:', errorText);
        
        // Show error message but still show some confirmation
        this.showErrorConfirmation();
      }

    } catch (error) {
      console.error('Form submission error:', error);
      this.showErrorConfirmation();
    }
  }

  showSuccessConfirmation(firstName) {
    const stepContent = document.getElementById('step-content');
    stepContent.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">🎉</div>
        <h2 style="color: #10b981; margin-bottom: 1rem;">Thank You, ${firstName}!</h2>
        <p style="color: #6b7280; font-size: 1.1rem; margin-bottom: 2rem;">
          Your information has been successfully submitted. Our team will review your property details and contact you within 24 hours with your personalized cash offer.
        </p>
        <div style="background: #f0fdf4; border: 1px solid #10b981; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="color: #10b981; margin-bottom: 0.5rem;">What happens next?</h3>
          <ul style="text-align: left; color: #374151; margin: 0; padding-left: 1.5rem;">
            <li>We'll analyze your property and market data</li>
            <li>Our team will prepare your personalized cash offer</li>
            <li>You'll receive a call within 24 hours to discuss details</li>
            <li>If you accept, we can close in as little as 7 days</li>
          </ul>
        </div>
        <p style="color: #6b7280; font-size: 0.9rem;">
          Questions? Call us at <strong>(725) 772-9847</strong> or email <strong>info@homemaxx.llc</strong>
        </p>
        <button onclick="window.location.href='/'" class="btn btn-primary" style="margin-top: 1rem;">
          Return to Homepage
        </button>
      </div>
    `;
    
    // Hide navigation buttons
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
  }

  showErrorConfirmation() {
    const stepContent = document.getElementById('step-content');
    stepContent.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <div style="font-size: 4rem; margin-bottom: 1rem;">⚠️</div>
        <h2 style="color: #ef4444; margin-bottom: 1rem;">Submission Issue</h2>
        <p style="color: #6b7280; font-size: 1.1rem; margin-bottom: 2rem;">
          We encountered a technical issue while submitting your information. Please try again or contact us directly.
        </p>
        <div style="background: #fef2f2; border: 1px solid #ef4444; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
          <h3 style="color: #ef4444; margin-bottom: 0.5rem;">Contact us directly:</h3>
          <p style="color: #374151; margin: 0.5rem 0;">
            <strong>Phone:</strong> (725) 772-9847<br>
            <strong>Email:</strong> info@homemaxx.llc
          </p>
        </div>
        <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
          <button onclick="window.location.reload()" class="btn btn-primary">
            Try Again
          </button>
          <button onclick="window.location.href='/'" class="btn btn-secondary">
            Return to Homepage
          </button>
        </div>
      </div>
    `;
    
    // Hide navigation buttons
    document.getElementById('back-btn').style.display = 'none';
    document.getElementById('next-btn').style.display = 'none';
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
