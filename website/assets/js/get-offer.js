'use strict';
/**
 * HomeMAXX Get Offer Funnel Controller
 * Multi-step flow with validation, progress, and Places autocomplete.
 */
(function () {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('.go-step'));
  const progressEl = document.getElementById('go-progress');
  const progressStatusEl = document.getElementById('go-progress-status');
  let current = 0; // index of steps

  function track(event, params) {
    try { if (window.gtag) window.gtag('event', event, params || {}); } catch (e) {}
  }

  // Live Slots: fetch remaining and display if ribbon exists
  async function updateSlotsDisplay() {
    try {
      const res = await fetch('/.netlify/functions/slots', { headers: { 'Accept': 'application/json' }, cache: 'no-store' });
      const json = await res.json();
      if (json && typeof json.remaining === 'number') {
        const el = document.getElementById('slotsRemainingFunnel');
        if (el) el.textContent = String(json.remaining);
      }
    } catch (_) { /* no-op */ }
  }

  // Minimize distractions: collapse main nav if present
  try {
    const mainNav = document.querySelector('.main-nav ul');
    if (mainNav) mainNav.style.display = 'none';
  } catch (e) {}

  // Helper: parse query params
  function qp(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
  }

  function showStep(index) {
    steps.forEach((fs, i) => {
      const isActive = i === index;
      // Keep display none for non-active steps to avoid layout jump
      fs.classList.toggle('d-none', !isActive);
      // Add active class for slide/fade transitions
      fs.classList.toggle('is-active', isActive);
    });
    const pct = Math.round(((index + 1) / steps.length) * 100);
    if (progressEl) {
      progressEl.style.width = pct + '%';
      progressEl.setAttribute('aria-valuenow', String(pct));
    }
    if (progressStatusEl) {
      progressStatusEl.textContent = `Step ${index + 1} of ${steps.length}`;
    }
    track('funnel_step_view', { step_index: index + 1, step_total: steps.length });
  }

  function validateStep(index, opts) {
    const options = Object.assign({ focus: true }, opts);
    const fieldset = steps[index];
    if (!fieldset) return true;
    const inputs = Array.from(fieldset.querySelectorAll('input, select, textarea'));
    let valid = true;

    // helpers
    function labelFor(el) {
      const id = el.getAttribute('id');
      if (id) {
        const lab = form.querySelector(`label[for="${id}"]`);
        if (lab) return lab.textContent.trim().replace(/[*:]+$/, '').trim();
      }
      if (el.getAttribute('aria-label')) return el.getAttribute('aria-label');
      return (el.name || 'This field').replace(/[_-]/g, ' ');
    }

    const errors = [];
    const handledGroups = new Set();
    inputs.forEach(el => {
      // Reset state first
      el.classList.remove('is-invalid');

      // Phone cleanup
      if (el.id === 'phone' && el.value) {
        el.value = el.value.replace(/[^0-9+\-()\s]/g, '').trim();
      }

      // Native validity
      const isGroupRadio = el.type === 'radio';
      const isGroupCheckbox = el.type === 'checkbox' && el.hasAttribute('required') && form.querySelectorAll(`input[name="${el.name}"][type="checkbox"]`).length > 1;
      let thisValid = true;
      if (isGroupRadio) {
        if (handledGroups.has(el.name)) return; // only once per radio group
        handledGroups.add(el.name);
        const anyChecked = !!form.querySelector(`input[type="radio"][name="${el.name}"]:checked`);
        thisValid = anyChecked;
      } else if (isGroupCheckbox) {
        if (handledGroups.has(el.name)) return; // only once per checkbox group
        handledGroups.add(el.name);
        const anyChecked = !!form.querySelector(`input[type="checkbox"][name="${el.name}"]:checked`);
        thisValid = anyChecked;
      } else {
        thisValid = el.checkValidity();
      }

      if (!thisValid) {
        valid = false;
        el.classList.add('is-invalid');
        // Prefer inline invalid-feedback text if present
        let msg = '';
        const groupRoot = isGroupRadio || isGroupCheckbox ? el.closest('[role="group"], .form-group') || el.closest('.form-group') : el.closest('.form-group');
        const fb = groupRoot?.querySelector('.invalid-feedback') || el.closest('.form-group')?.querySelector('.invalid-feedback');
        if (fb && fb.textContent) msg = fb.textContent.trim();
        if (!msg) msg = `${labelFor(el)} is required or invalid.`;
        // ensure element has an id for linking
        let linkEl = el;
        if ((isGroupRadio || isGroupCheckbox)) {
          const firstInGroup = form.querySelector(`[name="${el.name}"]`);
          if (firstInGroup) linkEl = firstInGroup;
        }
        if (!linkEl.id) linkEl.id = `f_${linkEl.name || Math.random().toString(36).slice(2)}`;
        errors.push({ id: linkEl.id, message: msg });
      }
    });

    // Update step error summary
    const summary = fieldset.querySelector('.error-summary');
    if (summary) {
      if (errors.length) {
        const list = errors.map(e => `<li><a href="#${e.id}">${e.message}</a></li>`).join('');
        summary.innerHTML = `<strong>Please fix the following:</strong><ul>${list}</ul>`;
        summary.classList.remove('d-none');
        if (options.focus) {
          // Move focus to summary and first invalid control for screen readers and keyboard users
          try { summary.focus(); } catch(_) {}
          const firstInvalidId = errors[0]?.id;
          if (firstInvalidId) {
            setTimeout(() => {
              const target = document.getElementById(firstInvalidId);
              if (target) { try { target.focus(); } catch(_) {} }
            }, 0);
          }
        }
      } else {
        summary.classList.add('d-none');
        summary.innerHTML = '';
      }
    }

    return valid;
  }

  function next() {
    if (!validateStep(current, { focus: true })) {
      track('funnel_step_error', { step_index: current + 1 });
      return;
    }
    if (current < steps.length - 1) {
      current += 1;
      showStep(current);
      track('funnel_step_next', { step_index: current + 1 });
      // Smooth scroll to next step for single-flow feel
      try { steps[current].scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    }
  }

  function back() {
    if (current > 0) {
      current -= 1;
      showStep(current);
      track('funnel_step_back', { step_index: current + 1 });
      try { steps[current].scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch (e) {}
    }
  }

  // Delegate button actions
  form.addEventListener('click', function (e) {
    const target = e.target.closest('[data-action]');
    if (!target) return;
    const action = target.getAttribute('data-action');
    if (action === 'next') {
      e.preventDefault();
      next();
    } else if (action === 'back') {
      e.preventDefault();
      back();
    }
  });

  // Enter-to-continue on key fields for one-click feel
  const addressInput = document.getElementById('propertyAddress');
  if (addressInput) {
    addressInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        next();
      }
    });
  }

  // Phone input: light US mask to reduce validation friction
  (function bindPhoneMask(){
    try {
      const phone = document.getElementById('phone');
      if (!phone) return;
      function onlyDigits(v){ return (v||'').replace(/\D+/g,''); }
      function formatUS(v){
        const d = onlyDigits(v).slice(0,10);
        if (d.length < 4) return d;
        if (d.length < 7) return `(${d.slice(0,3)}) ${d.slice(3)}`;
        return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
      }
      phone.addEventListener('input', function(){
        const pos = phone.selectionStart;
        const formatted = formatUS(phone.value);
        phone.value = formatted;
        try { phone.setSelectionRange(pos, pos); } catch(_) {}
      });
      phone.addEventListener('blur', function(){ phone.value = formatUS(phone.value); });
    } catch(_) {}
  })();

  // --- Opendoor-Style Funnel Implementation ---
  let propertyData = {}; // Store property data from API
  let userPath = 'owner'; // 'owner' or 'agent'
  
  // Create dynamic steps based on Opendoor flow
  function createOpendoorFlow() {
    // After address selection, show property details confirmation
    document.addEventListener('address:confirmed', function(e) {
      propertyData = e.detail || {};
      showPropertyDetailsConfirmation();
    });
    
    // Property details confirmation screen
    function showPropertyDetailsConfirmation() {
      const step2 = steps[1];
      if (!step2) return;
      
      // Hide original content and show confirmation screen
      step2.innerHTML = `
        <legend class="h3">Confirm your home details</legend>
        <p class="text-muted">This info is available to the public. You can edit these details if you've made any updates to your home.</p>
        
        <div class="property-details-grid">
          <div class="detail-item">
            <span class="detail-label">Bedrooms</span>
            <span class="detail-value" id="confirm-beds">${propertyData.beds || '4'}</span>
            <button type="button" class="edit-btn" onclick="editDetail('beds')">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Full bathrooms</span>
            <span class="detail-value" id="confirm-baths">${propertyData.baths || '2'}</span>
            <button type="button" class="edit-btn" onclick="editDetail('baths')">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Square footage (above ground)</span>
            <span class="detail-value" id="confirm-sqft">${propertyData.sqft || '2,093'} ft²</span>
            <button type="button" class="edit-btn" onclick="editDetail('sqft')">Edit</button>
          </div>
          <div class="detail-item">
            <span class="detail-label">Year built</span>
            <span class="detail-value" id="confirm-year">${propertyData.year || '2005'}</span>
            <button type="button" class="edit-btn" onclick="editDetail('year')">Edit</button>
          </div>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" data-action="back">‹ Back</button>
          <button type="button" class="btn btn-primary" onclick="startPropertyQuestions()">Confirm</button>
        </div>
      `;
      
      updateProgress(1, 4);
    }
    
    // Start property condition questions
    window.startPropertyQuestions = function() {
      showPropertyTypeQuestion();
    };
    
    // Property type question (first micro-step)
    function showPropertyTypeQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">What best describes your home?</legend>
        <p class="text-muted">This question helps us select comps when preparing your offer.</p>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" onclick="selectPropertyType('single-family')">
            <span>Single-family home</span>
          </button>
          <button type="button" class="option-tile" onclick="selectPropertyType('townhouse')">
            <span>Townhouse or attached single-family home</span>
          </button>
          <button type="button" class="option-tile" onclick="selectPropertyType('condo')">
            <span>Apartment or condo</span>
          </button>
          <button type="button" class="option-tile" onclick="selectPropertyType('mobile')">
            <span>Mobile or manufactured home</span>
          </button>
          <button type="button" class="option-tile" onclick="selectPropertyType('multifamily')">
            <span>Multi-family<br><small>3+ units in a single structure</small></span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showPropertyDetailsConfirmation()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // Property type selection
    window.selectPropertyType = function(type) {
      propertyData.propertyType = type;
      // Auto-advance to owner question
      setTimeout(() => showOwnerQuestion(), 300);
    };
    
    // Owner vs Agent question
    function showOwnerQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">Are you the owner of this home?</legend>
        <p class="text-muted">We have additional questions if you're an agent.</p>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" onclick="selectUserType('owner')">
            <span>Yes, I own this home</span>
          </button>
          <button type="button" class="option-tile" onclick="selectUserType('agent')">
            <span>No, I'm an agent</span>
          </button>
          <button type="button" class="option-tile" onclick="selectUserType('agent-owner')">
            <span>I'm an agent, and I own this home</span>
          </button>
          <button type="button" class="option-tile" onclick="selectUserType('other')">
            <span>Other</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showPropertyTypeQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // User type selection with branching
    window.selectUserType = function(type) {
      userPath = type;
      propertyData.userType = type;
      
      if (type === 'agent') {
        // Show agent-specific flow
        setTimeout(() => showAgentFlow(), 300);
      } else {
        // Continue with owner flow
        setTimeout(() => showTimelineQuestion(), 300);
      }
    };
    
    // Agent-specific flow
    function showAgentFlow() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">Great! There are two ways agents can work with us.</legend>
        <p class="text-muted">You can decide what makes the most sense for you and the homeowner after you receive a estimated offer from Opendoor.</p>
        
        <div class="agent-options">
          <div class="agent-option">
            <h4>Refer to Opendoor</h4>
            <p class="text-muted">Eligible for 1% referral commission</p>
            <ul>
              <li>Ideal for when you can't (or don't want to) represent a client</li>
              <li>Share the homeowner's contact information with Opendoor</li>
              <li>That's all there is to it — we work with the homeowner to complete the sale</li>
            </ul>
          </div>
          
          <div class="agent-option">
            <h4>Represent your client</h4>
            <p class="text-muted">Eligible for 1% commission + seller commission</p>
            <ul>
              <li>Ideal for clients that need more guidance and support</li>
              <li>You'll represent your client throughout the entire process</li>
              <li>You'll work directly with Opendoor and expect to have a representation agreement with your client</li>
            </ul>
          </div>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showOwnerQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" onclick="showTimelineQuestion()">Next ›</button>
        </div>
      `;
    }
    
    // Timeline question
    function showTimelineQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">When do you need to sell your home?</legend>
        <p class="text-muted">This won't affect your offer. We're here to help with any timeline.</p>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" onclick="selectTimeline('asap')">
            <span>ASAP</span>
          </button>
          <button type="button" class="option-tile" onclick="selectTimeline('2-4-weeks')">
            <span>2–4 weeks</span>
          </button>
          <button type="button" class="option-tile" onclick="selectTimeline('4-6-weeks')">
            <span>4–6 weeks</span>
          </button>
          <button type="button" class="option-tile" onclick="selectTimeline('6-weeks')">
            <span>6+ weeks</span>
          </button>
          <button type="button" class="option-tile" onclick="selectTimeline('browsing')">
            <span>Just browsing</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="${userPath === 'agent' ? 'showAgentFlow()' : 'showOwnerQuestion()'}">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // Timeline selection
    window.selectTimeline = function(timeline) {
      propertyData.timeline = timeline;
      setTimeout(() => showConditionQuestions(), 300);
    };
    
    // Start condition questions with image cards
    function showConditionQuestions() {
      showKitchenQuestion();
    }
    
    // Kitchen condition question
    function showKitchenQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">How would you describe your kitchen?</legend>
        <p class="text-muted">For these questions, just select the closest match.</p>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" onclick="selectCondition('kitchen', 'fixer')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Fixer Upper</h4>
              <p>Kitchen needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('kitchen', 'dated')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Kitchen hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('kitchen', 'standard')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Kitchen is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('kitchen', 'high-end')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showTimelineQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // Condition selection handler
    window.selectCondition = function(room, condition) {
      propertyData[room + 'Condition'] = condition;
      
      // Auto-advance based on room
      if (room === 'kitchen') {
        setTimeout(() => showBathroomQuestion(), 300);
      } else if (room === 'bathroom') {
        setTimeout(() => showLivingRoomQuestion(), 300);
      } else if (room === 'living') {
        setTimeout(() => showExteriorQuestion(), 300);
      } else if (room === 'exterior') {
        setTimeout(() => showHOAQuestion(), 300);
      }
    };
    
    // Similar functions for bathroom, living room, exterior...
    function showBathroomQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">How would you describe your main bathroom?</legend>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" onclick="selectCondition('bathroom', 'fixer')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1620626011761-996317b8d101?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Fixer Upper</h4>
              <p>Bathroom needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('bathroom', 'dated')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Bathroom hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('bathroom', 'standard')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Bathroom is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('bathroom', 'high-end')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=400&auto=format&fit=crop')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showKitchenQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    function showLivingRoomQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">How would you describe your living room?</legend>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" onclick="selectCondition('living', 'fixer')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer Upper</h4>
              <p>Living room needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('living', 'dated')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Living room hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('living', 'standard')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Living room is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('living', 'high-end')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showBathroomQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    function showExteriorQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">How would you describe your home exterior?</legend>
        
        <div class="condition-cards">
          <button type="button" class="condition-card" onclick="selectCondition('exterior', 'fixer')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Fixer Upper</h4>
              <p>Exterior needs significant repairs</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('exterior', 'dated')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Dated</h4>
              <p>Exterior hasn't been updated recently</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('exterior', 'standard')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=400')"></div>
            <div class="card-content">
              <h4>Standard</h4>
              <p>Exterior is in good condition</p>
            </div>
          </button>
          <button type="button" class="condition-card" onclick="selectCondition('exterior', 'high-end')">
            <div class="card-image" style="background-image: url('https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=400')"></div>
            <div class="card-content">
              <h4>High end</h4>
              <p>Recently updated with premium finishes</p>
            </div>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showLivingRoomQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // HOA Question with branching
    function showHOAQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">Is your home part of a homeowners association?</legend>
        <p class="text-muted">This is often called an HOA. It's a group that helps maintain your community for a fee.</p>
        
        <div class="option-tiles">
          <button type="button" class="option-tile" onclick="selectHOA('yes')">
            <span>Yes</span>
          </button>
          <button type="button" class="option-tile" onclick="selectHOA('no')">
            <span>No</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showExteriorQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" id="next-btn" style="visibility: hidden;">Next ›</button>
        </div>
      `;
    }
    
    // HOA selection with branching
    window.selectHOA = function(hasHOA) {
      propertyData.hoa = hasHOA;
      
      if (hasHOA === 'yes') {
        // Show HOA details questions
        setTimeout(() => showHOADetailsQuestion(), 300);
      } else {
        // Skip HOA details and go to contact info
        setTimeout(() => showContactInfo(), 300);
      }
    };
    
    function showHOADetailsQuestion() {
      const step2 = steps[1];
      step2.innerHTML = `
        <legend class="h3">Does your home belong to any of these types of communities?</legend>
        
        <div class="option-tiles">
          <button type="button" class="option-tile checkbox-tile" onclick="toggleHOAType('age-restricted')">
            <span>Age restricted community</span>
            <div class="checkbox"></div>
          </button>
          <button type="button" class="option-tile checkbox-tile" onclick="toggleHOAType('gated')">
            <span>Gated community</span>
            <div class="checkbox"></div>
          </button>
          <button type="button" class="option-tile" onclick="selectHOAType('none')">
            <span>None of the above</span>
          </button>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showHOAQuestion()">‹ Back</button>
          <button type="button" class="btn btn-primary" onclick="showContactInfo()">Next ›</button>
        </div>
      `;
    }
    
    // Contact info screen
    function showContactInfo() {
      // Move to Step 3
      next();
      
      const step3 = steps[2];
      step3.innerHTML = `
        <legend class="h3">We're getting the details together for our team</legend>
        <p class="text-muted">Sign in or enter your email address to take the next step.</p>
        
        <div class="contact-form">
          <button type="button" class="btn btn-outline btn-google">
            <span>Continue with Google</span>
          </button>
          
          <div class="divider">or</div>
          
          <div class="form-group">
            <label for="email">Email *</label>
            <input type="email" id="email" name="email" class="form-control" required />
          </div>
          
          <button type="button" class="btn btn-primary btn-full" onclick="completeFlow()">
            Continue with email
          </button>
          
          <p class="terms-text">
            By clicking "Continue," you agree to Opendoor's <a href="#">terms of service</a> and <a href="#">Privacy Policy</a>
          </p>
        </div>
        
        <div class="form-actions space-between">
          <button type="button" class="btn btn-outline" onclick="showPreviousQuestion()">‹ Back</button>
        </div>
      `;
    }
    
    window.completeFlow = function() {
      // Submit the form or show final step
      console.log('Property data collected:', propertyData);
      alert('Funnel complete! Property data: ' + JSON.stringify(propertyData, null, 2));
    };
  }
  
  // Initialize the Opendoor flow
  createOpendoorFlow();
  
  // Hook into address selection to trigger property details confirmation
  
  if (addressInput) {
    // Trigger confirmation screen after address is filled
    addressInput.addEventListener('blur', function() {
      if (this.value && this.value.length > 10) {
        // Simulate property data from API
        const mockPropertyData = {
          beds: '4',
          baths: '2', 
          sqft: '2,093',
          year: '2005',
          lotSize: '0',
          floors: '2',
          basement: 'No',
          pool: 'No pool',
          parking: 'Garage',
          garageSpaces: '2'
        };
        
        // Dispatch event to trigger property details confirmation
        setTimeout(() => {
          document.dispatchEvent(new CustomEvent('address:confirmed', {
            detail: mockPropertyData
          }));
        }, 500);
      }
    });
  }

  // Prevent submit if last step invalid (redundant guard; ghl-integration handles submission)
  form.addEventListener('submit', function (e) {
    track('funnel_submit_attempt');
    if (!validateStep(current, { focus: true })) {
      e.preventDefault();
      track('funnel_submit_blocked');
      return false;
    }
    // If valid, show the informational modal briefly without blocking submission
    try {
      const modal = document.getElementById('offer-info-modal');
      if (modal) {
        const content = modal.querySelector('.modal-content');
        const closeBtn = modal.querySelector('.close-modal');
        const open = () => { modal.classList.add('active'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
        const close = () => { modal.classList.remove('active'); modal.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };
        // Bind one-time listeners each submit
        const onBackdrop = (evt) => { if (evt.target === modal) close(); };
        const onCloseBtn = () => close();
        const onEsc = (evt) => { if (evt.key === 'Escape') close(); };
        open();
        // Auto close after 5 seconds
        setTimeout(close, 5000);
        modal.addEventListener('click', onBackdrop, { once: true });
        if (closeBtn) closeBtn.addEventListener('click', onCloseBtn, { once: true });
        document.addEventListener('keydown', onEsc, { once: true });
      }
    } catch (_) { /* no-op */ }
  });

  // Helper: safely set a radio by value
  function setRadio(name, value) {
    if (!value) return;
    const radios = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
    radios.forEach(r => { r.checked = (r.value === String(value)); });
    if (radios.length) radios[0].dispatchEvent(new Event('change', { bubbles: true }));
  }
  // Helper: select option by exact text match
  function setSelectByText(selectEl, text) {
    if (!selectEl || !text) return;
    const t = String(text).trim();
    const opts = Array.from(selectEl.options);
    const match = opts.find(o => o.text.trim() === t);
    if (match) { selectEl.value = match.value; selectEl.dispatchEvent(new Event('change', { bubbles: true })); }
  }
  // Helper: clear a select
  function clearSelect(selectEl) {
    if (!selectEl) return;
    selectEl.value = '';
    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
  }

  // Attach Google Places Autocomplete and property lookup
  function attachPlaces() {
    try {
      const input = document.getElementById('propertyAddress');
      if (!input || !window.google || !google.maps || !google.maps.places) return;
      const ac = new google.maps.places.Autocomplete(input, {
        types: ['address'],
        fields: ['address_components', 'formatted_address', 'geometry']
      });

      async function propertyLookup(address) {
        try {
          const url = `/.netlify/functions/property-lookup?address=${encodeURIComponent(address)}`;
          const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
          const json = await res.json();
          if (!json || !json.data) return;
          const d = json.data;

          // Beds
          const bedsSel = document.getElementById('beds');
          if (bedsSel && d.beds != null) {
            const beds = Number(d.beds);
            setSelectByText(bedsSel, beds >= 5 ? '5+' : String(beds));
          }
          // Baths (map to 1, 1.5, 2, 2.5, 3+)
          const bathsSel = document.getElementById('baths');
          if (bathsSel && d.baths != null) {
            const b = Number(d.baths);
            let label = null;
            if (b >= 3) label = '3+';
            else if (b === 2.5) label = '2.5';
            else if (b === 2) label = '2';
            else if (b === 1.5) label = '1.5';
            else if (b === 1) label = '1';
            if (label) setSelectByText(bathsSel, label);
          }
          // Year built
          const yb = document.getElementById('year_built');
          if (yb && d.year_built) yb.value = String(d.year_built);
          // Sqft
          const sf = document.getElementById('sqft');
          if (sf && d.sqft) sf.value = String(Math.round(Number(d.sqft)));
          // Lot size (only set if sensible)
          const ls = document.getElementById('lot_size');
          if (ls && d.lot_size && Number(d.lot_size) > 0) ls.value = String(Math.round(Number(d.lot_size)));

          // Parking
          if (d.parking) {
            if (d.parking.garage_spaces && Number(d.parking.garage_spaces) > 0) setRadio('parking', 'garage');
            else if (d.parking.carport) setRadio('parking', 'carport');
            else if (d.parking.covered) setRadio('parking', 'garage');
            else setRadio('parking', 'street');
          }

          // Pool
          if (d.pool && d.pool.has_pool != null) {
            setRadio('has_pool_spa', d.pool.has_pool ? 'yes' : 'no');
          }

          // Optional: floors_above_ground
          const floorsSel = document.getElementById('floors_above_ground');
          if (floorsSel && d.stories != null) {
            const s = Number(d.stories);
            setSelectByText(floorsSel, s >= 3 ? '3+' : String(s));
          }

          // Optional: basement boolean
          if (d.basement !== null && d.basement !== undefined) {
            setRadio('basement', d.basement ? 'yes' : 'no');
          }

          // Optional: garage spaces
          const gs = document.getElementById('garage_spaces');
          if (gs && d.parking && d.parking.garage_spaces != null) {
            gs.value = String(d.parking.garage_spaces);
          }

          // Optional: pool type select
          const poolTypeSel = document.getElementById('pool_type');
          if (poolTypeSel && d.pool && d.pool.type) {
            const v = String(d.pool.type).toLowerCase();
            let label = '';
            if (v.includes('in') && v.includes('ground')) label = 'In-ground';
            else if (v.includes('above')) label = 'Above-ground';
            else if (v.includes('community')) label = 'Community';
            else if (v.includes('private')) label = 'Private';
            else label = 'Unknown';
            setSelectByText(poolTypeSel, label);
          }

          track('property_lookup_prefill', { provider: d.provider || 'unknown' });
        } catch (e) {
          track('property_lookup_error', { message: String(e && e.message || e) });
        }
      }

      ac.addListener('place_changed', function () {
        const place = ac.getPlace();
        if (place && place.formatted_address) {
          input.value = place.formatted_address;
          // Trigger property data lookup and autofill
          propertyLookup(place.formatted_address);
        }
      });
    } catch (e) { /* noop */ }
  }

  // Expose callback for Google Maps script (works even with async defer)
  window.initGooglePlaces = function() {
    attachPlaces();
  };

  // Also try to attach immediately in case script was already available
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachPlaces);
  } else {
    attachPlaces();
  }

  // UTM + prefill support and auto-advance to contact if address present
  (function prefillAndAdvance() {
    const utms = ['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
    utms.forEach(k => {
      const v = qp(k);
      if (v) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      }
    });
    const addr = qp('address');
    if (addr && addressInput) {
      addressInput.value = addr;
      // advance to next step automatically for fewer clicks
      next();
    }
  })();

  // Redirect to thank-you page after GHL success
  document.addEventListener('ghl:submit:success', function () {
    // Decrement slots counter but do not block redirect for long
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1200);
      fetch('/.netlify/functions/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decrement' }),
        signal: controller.signal,
      }).catch(function(){}).finally(function(){ clearTimeout(t); });
    } catch (_) {}
    // Small delay to increase chance request fires, then redirect
    setTimeout(function(){ window.location.href = 'thank-you.html'; }, 150);
  });

  // --- Step 2 dynamic UI: HOA dues + Repairs checklist ---
  (function () {
    function onReady(cb) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', cb);
      else cb();
    }

    onReady(function () {
      try {
        const hoaRadios = document.querySelectorAll('input[name="hoa"]');
        const hoaDuesWrap = document.querySelector('.hoadues-wrap');
        const hoaDuesInput = document.getElementById('hoa_dues');

        const repairsRadios = document.querySelectorAll('input[name="repairs_needed"]');
        const repairsListWrap = document.querySelector('.repairs-list');

        // New: Pool/Spa controls
        const poolSpaRadios = document.querySelectorAll('input[name="has_pool_spa"]');
        const poolSpaDetails = document.querySelector('.poolspadetails');
        const poolSpaCondition = document.getElementById('pool_spa_condition');
        const poolTypeSelect = document.getElementById('pool_type');

        // New: Solar controls
        const solarRadios = document.querySelectorAll('input[name="solar_ownership"]');
        const solarDetails = document.querySelector('.solardetails');
        const solarPayment = document.getElementById('solar_payment');

        // New: Parking -> garage spaces
        const parkingRadios = document.querySelectorAll('input[name="parking"]');
        const garageSpacesWrap = document.querySelector('.garagespaces-wrap');
        const garageSpacesInput = document.getElementById('garage_spaces');

        function toggleHoaDues() {
          if (!hoaDuesWrap) return;
          const val = document.querySelector('input[name="hoa"]:checked')?.value;
          const show = val === 'yes';
          hoaDuesWrap.classList.toggle('d-none', !show);
          if (!show && hoaDuesInput) {
            hoaDuesInput.value = '';
          }
        }

        function toggleRepairsList() {
          if (!repairsListWrap) return;
          const val = document.querySelector('input[name="repairs_needed"]:checked')?.value;
          const show = val === 'yes';
          repairsListWrap.classList.toggle('d-none', !show);
          if (!show) {
            repairsListWrap.querySelectorAll('input[type="checkbox"][name="repairs_list"]').forEach(cb => {
              cb.checked = false;
            });
          }
        }

        function togglePoolSpaDetails() {
          if (!poolSpaDetails) return;
          const val = document.querySelector('input[name="has_pool_spa"]:checked')?.value;
          const show = val === 'yes';
          poolSpaDetails.classList.toggle('d-none', !show);
          if (!show && poolSpaCondition) {
            poolSpaCondition.value = '';
          }
          if (!show && poolTypeSelect) {
            clearSelect(poolTypeSelect);
          }
        }

        function toggleSolarDetails() {
          if (!solarDetails) return;
          const val = document.querySelector('input[name="solar_ownership"]:checked')?.value;
          const show = val === 'leased' || val === 'ppa';
          solarDetails.classList.toggle('d-none', !show);
          if (!show && solarPayment) {
            solarPayment.value = '';
          }
        }

        function toggleGarageSpaces() {
          if (!garageSpacesWrap) return;
          const val = document.querySelector('input[name="parking"]:checked')?.value;
          const show = val === 'garage';
          garageSpacesWrap.classList.toggle('d-none', !show);
          if (!show && garageSpacesInput) garageSpacesInput.value = '';
        }

        hoaRadios.forEach(r => r.addEventListener('change', toggleHoaDues));
        repairsRadios.forEach(r => r.addEventListener('change', toggleRepairsList));
        poolSpaRadios.forEach(r => r.addEventListener('change', togglePoolSpaDetails));
        solarRadios.forEach(r => r.addEventListener('change', toggleSolarDetails));
        parkingRadios.forEach(r => r.addEventListener('change', toggleGarageSpaces));

        // Initialize on load (in case browser restores state)
        toggleHoaDues();
        toggleRepairsList();
        togglePoolSpaDetails();
        toggleSolarDetails();
        toggleGarageSpaces();
      } catch (_) { /* no-op */ }
    });
  })();

  // Initialize
  showStep(current);
  // Initialize live slots display if present
  updateSlotsDisplay();

  // Live validation: clear errors as user types/changes and update summary silently
  (function bindLiveValidation(){
    steps.forEach((fs, idx) => {
      fs.addEventListener('input', function(e){
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        if (t.matches('input, select, textarea')) {
          t.classList.remove('is-invalid');
          validateStep(idx, { focus: false });
        }
      }, true);
      fs.addEventListener('change', function(e){
        const t = e.target;
        if (!(t instanceof HTMLElement)) return;
        if (t.matches('input, select, textarea')) {
          t.classList.remove('is-invalid');
          validateStep(idx, { focus: false });
        }
      }, true);
      // Click on summary links focuses the field
      const summary = fs.querySelector('.error-summary');
      if (summary) {
        summary.addEventListener('click', function(e){
          const a = e.target.closest('a');
          if (a && a.getAttribute('href') && a.getAttribute('href').startsWith('#')) {
            e.preventDefault();
            const id = a.getAttribute('href').slice(1);
            const el = document.getElementById(id);
            if (el) { try { el.focus(); } catch(_) {} }
          }
        });
      }
    });
  })();
})();
