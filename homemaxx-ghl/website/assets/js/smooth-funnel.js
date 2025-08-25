// Smooth Opendoor-Style Funnel Flow
class SmoothFunnel {
  constructor() {
    this.currentStep = 0;
    this.steps = [];
    this.propertyData = {};
    this.responses = {};
    this.init();
  }

  init() {
    this.setupSteps();
    this.setupEventListeners();
    this.loadAddressFromURL();
  }

  setupSteps() {
    this.steps = [
      {
        id: 'property-details',
        title: 'Property Details',
        component: this.renderPropertyDetails.bind(this)
      },
      {
        id: 'kitchen-condition',
        title: 'Kitchen Condition',
        component: this.renderKitchenCondition.bind(this)
      },
      {
        id: 'bathroom-condition',
        title: 'Bathroom Condition',
        component: this.renderBathroomCondition.bind(this)
      },
      {
        id: 'living-condition',
        title: 'Living Room Condition',
        component: this.renderLivingCondition.bind(this)
      },
      {
        id: 'exterior-condition',
        title: 'Exterior Condition',
        component: this.renderExteriorCondition.bind(this)
      },
      {
        id: 'hoa-status',
        title: 'HOA Information',
        component: this.renderHOAStatus.bind(this)
      },
      {
        id: 'agent-status',
        title: 'Agent Information',
        component: this.renderAgentStatus.bind(this)
      },
      {
        id: 'contact-info',
        title: 'Contact Information',
        component: this.renderContactInfo.bind(this)
      }
    ];
  }

  setupEventListeners() {
    // Progress bar and navigation
    this.progressBar = document.getElementById('go-progress');
    this.progressStatus = document.getElementById('go-progress-status');
    this.container = document.querySelector('.go-form');
    
    if (!this.container) {
      this.container = document.querySelector('.card-content');
    }
  }

  loadAddressFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('address');
    const step = parseInt(urlParams.get('step')) || 0;
    const isResume = urlParams.get('resume') === 'true';
    
    if (address) {
      this.propertyData.address = address;
      this.fetchPropertyData(address).then(() => {
        if (isResume && step > 0) {
          this.showStep(step);
        } else {
          this.showStep(0);
        }
      });
    } else {
      this.showStep(0);
    }
  }

  async fetchPropertyData(address) {
    try {
      // Simulate property data fetch (replace with actual API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      this.propertyData = {
        address: address,
        beds: '4',
        baths: '2.5',
        sqft: '2,093',
        yearBuilt: '2005',
        lotSize: '0.18 acres',
        floors: '2',
        basement: 'No',
        pool: 'No pool',
        parking: 'Garage',
        garageSpaces: '2'
      };
      
      this.showStep(0);
    } catch (error) {
      console.error('Error fetching property data:', error);
      this.showStep(0);
    }
  }

  showStep(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    this.currentStep = stepIndex;
    const step = this.steps[stepIndex];
    
    // Update progress
    const progress = ((stepIndex + 1) / this.steps.length) * 100;
    if (this.progressBar) {
      this.progressBar.style.width = `${progress}%`;
      this.progressBar.setAttribute('aria-valuenow', Math.round(progress));
    }
    
    if (this.progressStatus) {
      this.progressStatus.textContent = `Step ${stepIndex + 1} of ${this.steps.length}`;
    }
    
    // Render step with smooth transition
    this.renderStepWithTransition(step);
  }

  renderStepWithTransition(step) {
    if (!this.container) return;
    
    // Fade out current content
    this.container.style.opacity = '0';
    this.container.style.transform = 'translateX(20px)';
    
    setTimeout(() => {
      // Render new content
      this.container.innerHTML = step.component();
      
      // Fade in new content
      this.container.style.opacity = '1';
      this.container.style.transform = 'translateX(0)';
      
      // Setup step-specific event listeners
      this.setupStepEventListeners();
    }, 200);
  }

  setupStepEventListeners() {
    // Back button
    const backBtn = this.container.querySelector('.btn-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBack());
    }
    
    // Next button
    const nextBtn = this.container.querySelector('.btn-next');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.goNext());
    }
    
    // Auto-advance on selection
    const selectableOptions = this.container.querySelectorAll('[data-auto-advance]');
    selectableOptions.forEach(option => {
      option.addEventListener('click', (e) => {
        const value = e.currentTarget.dataset.value;
        const field = e.currentTarget.dataset.field;
        this.responses[field] = value;
        
        // Visual feedback
        this.container.querySelectorAll('.condition-card, .option-tile').forEach(card => {
          card.classList.remove('selected');
        });
        e.currentTarget.classList.add('selected');
        
        // Auto-advance after short delay
        setTimeout(() => this.goNext(), 600);
      });
    });
  }

  goBack() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  goNext() {
    // Save progress before moving to next step
    if (window.offerResume) {
      window.offerResume.updateProgress(this.currentStep + 1, {
        address: this.propertyData.address,
        responses: this.responses,
        propertyData: this.propertyData
      });
    }
    
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    } else {
      this.submitForm();
    }
  }

  renderPropertyDetails() {
    return `
      <div class="step-content">
        <h2 class="step-title">Let's confirm your property details</h2>
        <p class="step-subtitle">We found this information about your home. Please review and edit if needed.</p>
        
        <div class="property-details-grid">
          <div class="detail-item">
            <span class="detail-label">Address</span>
            <span class="detail-value">${this.propertyData.address || 'Not provided'}</span>
            <button class="edit-btn" onclick="editAddress()">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Bedrooms</span>
            <span class="detail-value">${this.propertyData.beds || 'Unknown'}</span>
            <button class="edit-btn" onclick="editBedrooms()">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Bathrooms</span>
            <span class="detail-value">${this.propertyData.baths || 'Unknown'}</span>
            <button class="edit-btn" onclick="editBathrooms()">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Square Feet</span>
            <span class="detail-value">${this.propertyData.sqft || 'Unknown'}</span>
            <button class="edit-btn" onclick="editSquareFeet()">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Year Built</span>
            <span class="detail-value">${this.propertyData.yearBuilt || 'Unknown'}</span>
            <button class="edit-btn" onclick="editYearBuilt()">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Lot Size</span>
            <span class="detail-value">${this.propertyData.lotSize || 'Unknown'}</span>
            <button class="edit-btn" onclick="editLotSize()">Edit</button>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn btn-primary btn-next">Continue</button>
        </div>
      </div>
    `;
  }

  renderKitchenCondition() {
    return `
      <div class="step-content">
        <h2 class="step-title">How would you describe your kitchen?</h2>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" data-field="kitchen" data-value="fixer" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer upper</h4>
              <p>Kitchen needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="kitchen" data-value="dated" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Kitchen hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="kitchen" data-value="standard" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Kitchen is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="kitchen" data-value="high-end" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderBathroomCondition() {
    return `
      <div class="step-content">
        <h2 class="step-title">How would you describe your bathroom?</h2>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" data-field="bathroom" data-value="fixer" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer upper</h4>
              <p>Bathroom needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="bathroom" data-value="dated" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Bathroom hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="bathroom" data-value="standard" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Bathroom is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="bathroom" data-value="high-end" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderLivingCondition() {
    return `
      <div class="step-content">
        <h2 class="step-title">How would you describe your living room?</h2>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" data-field="living" data-value="fixer" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer upper</h4>
              <p>Living room needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="living" data-value="dated" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Living room hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="living" data-value="standard" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Living room is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="living" data-value="high-end" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderExteriorCondition() {
    return `
      <div class="step-content">
        <h2 class="step-title">How would you describe your home exterior?</h2>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" data-field="exterior" data-value="fixer" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer upper</h4>
              <p>Exterior needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="exterior" data-value="dated" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Exterior hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="exterior" data-value="standard" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Exterior is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" data-field="exterior" data-value="high-end" data-auto-advance="true">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderHOAStatus() {
    return `
      <div class="step-content">
        <h2 class="step-title">Does your home have an HOA?</h2>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" data-field="hoa" data-value="yes" data-auto-advance="true">
            <span>Yes</span>
          </button>
          <button type="button" class="option-tile" data-field="hoa" data-value="no" data-auto-advance="true">
            <span>No</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderAgentStatus() {
    return `
      <div class="step-content">
        <h2 class="step-title">Are you working with a real estate agent?</h2>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" data-field="agent" data-value="yes" data-auto-advance="true">
            <span>Yes, I have an agent</span>
          </button>
          <button type="button" class="option-tile" data-field="agent" data-value="no" data-auto-advance="true">
            <span>No, I'm selling on my own</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  renderContactInfo() {
    return `
      <div class="step-content">
        <h2 class="step-title">Get your cash offer</h2>
        <p class="step-subtitle">We'll send your offer details to the contact information below.</p>
        
        <div class="contact-form">
          <button type="button" class="btn btn-google" onclick="signInWithGoogle()">
            <i class="fab fa-google" style="margin-right: 0.5rem;"></i>
            Continue with Google
          </button>
          
          <div class="divider">or</div>
          
          <div style="display: grid; gap: 1rem;">
            <input type="email" placeholder="Email address" class="form-control" required>
            <input type="tel" placeholder="Phone number" class="form-control" required>
          </div>
          
          <button type="button" class="btn btn-primary btn-full" onclick="submitFunnel()">
            Get My Instant Cash Offer
          </button>
          
          <div class="terms-text">
            By continuing, you agree to our <a href="pages/legal/terms-of-service.html">Terms of Service</a> and <a href="pages/legal/privacy-policy.html">Privacy Policy</a>. You consent to receive calls and texts, including automated messages.
          </div>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline btn-back">‹ Back</button>
        </div>
      </div>
    `;
  }

  submitForm() {
    console.log('Submitting form with data:', {
      propertyData: this.propertyData,
      responses: this.responses
    });
    
    // Clear saved progress on successful submission
    if (window.offerResume) {
      window.offerResume.clearProgress();
    }
    
    // Show success message or redirect
    alert('Thank you! Your cash offer request has been submitted. We\'ll contact you within 24 hours.');
  }
}

// Global functions for edit buttons
window.editAddress = function() {
  const newAddress = prompt('Enter your property address:', window.smoothFunnel.propertyData.address);
  if (newAddress) {
    window.smoothFunnel.propertyData.address = newAddress;
    window.smoothFunnel.showStep(0); // Refresh current step
  }
};

window.editBedrooms = function() {
  const newBeds = prompt('Enter number of bedrooms:', window.smoothFunnel.propertyData.beds);
  if (newBeds) {
    window.smoothFunnel.propertyData.beds = newBeds;
    window.smoothFunnel.showStep(0);
  }
};

window.editBathrooms = function() {
  const newBaths = prompt('Enter number of bathrooms:', window.smoothFunnel.propertyData.baths);
  if (newBaths) {
    window.smoothFunnel.propertyData.baths = newBaths;
    window.smoothFunnel.showStep(0);
  }
};

window.editSquareFeet = function() {
  const newSqft = prompt('Enter square footage:', window.smoothFunnel.propertyData.sqft);
  if (newSqft) {
    window.smoothFunnel.propertyData.sqft = newSqft;
    window.smoothFunnel.showStep(0);
  }
};

window.editYearBuilt = function() {
  const newYear = prompt('Enter year built:', window.smoothFunnel.propertyData.yearBuilt);
  if (newYear) {
    window.smoothFunnel.propertyData.yearBuilt = newYear;
    window.smoothFunnel.showStep(0);
  }
};

window.editLotSize = function() {
  const newLotSize = prompt('Enter lot size:', window.smoothFunnel.propertyData.lotSize);
  if (newLotSize) {
    window.smoothFunnel.propertyData.lotSize = newLotSize;
    window.smoothFunnel.showStep(0);
  }
};

window.signInWithGoogle = function() {
  alert('Google Sign-In would be implemented here');
};

window.submitFunnel = function() {
  window.smoothFunnel.submitForm();
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Add smooth transition styles
  const style = document.createElement('style');
  style.textContent = `
    .card-content, .go-form {
      transition: opacity 0.2s ease, transform 0.2s ease;
    }
    
    .step-content {
      padding: 1rem 0;
    }
    
    .step-title {
      font-size: 1.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
      color: var(--text);
    }
    
    .step-subtitle {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }
  `;
  document.head.appendChild(style);
  
  // Initialize smooth funnel
  window.smoothFunnel = new SmoothFunnel();
});
