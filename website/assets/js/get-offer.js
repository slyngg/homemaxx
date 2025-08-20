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

  // --- Micro-steps within Step 1 (Address & Basics) ---
  (function microStepsStep1(){
    try {
      const stepIndex = 0; // Step 1 (0-based)
      const stepEl = steps[stepIndex];
      if (!stepEl) return;

      // Collect question groups within Step 1
      const groups = Array.from(stepEl.querySelectorAll('.form-group, [role="group"]'))
        .filter(g => g.offsetParent !== null || true); // keep order as in DOM
      if (!groups.length) return;
      let sub = 0;

      const backBtn = stepEl.querySelector('[data-action="back"]');
      const nextBtn = stepEl.querySelector('[data-action="next"]');

      function hideAll(){ groups.forEach(g => g.style.display = 'none'); }
      function updateProgress(){
        if (!progressEl) return;
        const total = groups.length;
        const sectionStart = (stepIndex / steps.length) * 100;
        const sectionEnd = ((stepIndex + 1) / steps.length) * 100;
        const pct = sectionStart + (sectionEnd - sectionStart) * Math.max(0, Math.min(1, (sub + 1) / total));
        progressEl.style.width = pct + '%';
        progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
      function showSub(i){
        sub = Math.max(0, Math.min(groups.length - 1, i));
        hideAll();
        const g = groups[sub];
        if (g) g.style.display = '';
        if (nextBtn) nextBtn.style.visibility = 'hidden';
        updateProgress();
      }
      function advance(){
        if (sub >= groups.length - 1) { next(); return; }
        showSub(sub + 1);
      }
      function back(){
        if (sub === 0) { prev(); return; }
        showSub(sub - 1);
      }

      if (backBtn) backBtn.addEventListener('click', function(e){ if (current === stepIndex) { e.preventDefault(); back(); } });
      if (nextBtn) nextBtn.addEventListener('click', function(e){ if (current === stepIndex) { e.preventDefault(); advance(); } });

      // Auto-advance behaviors for inputs
      groups.forEach(g => {
        const inputs = Array.from(g.querySelectorAll('input, select, textarea'));
        const isRadio = inputs.some(el => el.type === 'radio');
        const isSelect = inputs.some(el => el.tagName === 'SELECT');
        const isTextLike = inputs.some(el => el.type === 'text' || el.type === 'number' || el.tagName === 'TEXTAREA' || el.type === 'email' || el.type === 'tel');

        if (isRadio) {
          inputs.forEach(el => el.addEventListener('change', function(){
            const any = g.querySelector('input[type="radio"]:checked');
            if (any) advance();
          }));
        }
        if (isSelect) {
          inputs.forEach(el => el.addEventListener('change', function(){ if (el.value) advance(); }));
        }
        if (isTextLike) {
          inputs.forEach(el => {
            el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); if (el.checkValidity()) advance(); }});
            el.addEventListener('blur', function(){ if (el.checkValidity()) advance(); });
          });
        }
      });

      // Special handling: property address with Google Places -> advance on place selection
      const addr = stepEl.querySelector('#propertyAddress, input[name="propertyAddress"], input[name="address"], #address');
      if (addr) {
        // When Places fills or value is present on blur, advance
        addr.addEventListener('blur', function(){ if (addr.value && addr.value.trim().length > 5) advance(); });
        // If autocomplete is attached elsewhere, hook a custom event
        document.addEventListener('address:place_selected', function(){ if (current === stepIndex) advance(); });
      }

      // Hook into step transitions
      const origShow = showStep;
      showStep = function(index){
        origShow(index);
        if (index === stepIndex) { hideAll(); showSub(sub); }
      };

      if (current === stepIndex) { hideAll(); showSub(sub); }
    } catch(_) { /* no-op */ }
  })();

  // --- Micro-steps within Step 3 (Your Info) ---
  (function microStepsStep3(){
    try {
      const stepIndex = 2; // Step 3 (0-based)
      const stepEl = steps[stepIndex];
      if (!stepEl) return;

      const groups = Array.from(stepEl.querySelectorAll('.form-group, [role="group"]'));
      if (!groups.length) return;
      let sub = 0;

      const backBtn = stepEl.querySelector('[data-action="back"]');
      const nextBtn = stepEl.querySelector('[data-action="next"]');

      function hideAll(){ groups.forEach(g => g.style.display = 'none'); }
      function updateProgress(){
        if (!progressEl) return;
        const total = groups.length;
        const sectionStart = (stepIndex / steps.length) * 100;
        const sectionEnd = ((stepIndex + 1) / steps.length) * 100;
        const pct = sectionStart + (sectionEnd - sectionStart) * Math.max(0, Math.min(1, (sub + 1) / total));
        progressEl.style.width = pct + '%';
        progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
      }
      function showSub(i){
        sub = Math.max(0, Math.min(groups.length - 1, i));
        hideAll();
        const g = groups[sub];
        if (g) g.style.display = '';
        if (nextBtn) nextBtn.style.visibility = 'hidden';
        updateProgress();
      }
      function advance(){
        if (sub >= groups.length - 1) { next(); return; }
        showSub(sub + 1);
      }
      function back(){
        if (sub === 0) { prev(); return; }
        showSub(sub - 1);
      }

      if (backBtn) backBtn.addEventListener('click', function(e){ if (current === stepIndex) { e.preventDefault(); back(); } });
      if (nextBtn) nextBtn.addEventListener('click', function(e){ if (current === stepIndex) { e.preventDefault(); advance(); } });

      // Auto-advance behaviors for inputs
      groups.forEach(g => {
        const inputs = Array.from(g.querySelectorAll('input, select, textarea'));
        const isTextLike = inputs.some(el => el.type === 'text' || el.type === 'email' || el.type === 'tel' || el.type === 'number' || el.tagName === 'TEXTAREA');
        const isSelect = inputs.some(el => el.tagName === 'SELECT');
        const isRadio = inputs.some(el => el.type === 'radio');

        if (isRadio) {
          inputs.forEach(el => el.addEventListener('change', function(){
            const any = g.querySelector('input[type="radio"]:checked');
            if (any) advance();
          }));
        }
        if (isSelect) {
          inputs.forEach(el => el.addEventListener('change', function(){ if (el.value) advance(); }));
        }
        if (isTextLike) {
          inputs.forEach(el => {
            el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); if (el.checkValidity()) advance(); }});
            el.addEventListener('blur', function(){ if (el.checkValidity()) advance(); });
          });
        }
      });

      // Hook into step transitions
      const origShow = showStep;
      showStep = function(index){
        origShow(index);
        if (index === stepIndex) { hideAll(); showSub(sub); }
      };

      if (current === stepIndex) { hideAll(); showSub(sub); }
    } catch(_) { /* no-op */ }
  })();

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

  // --- Opendoor-style micro-steps within Step 2 (question-per-screen) ---
  (function microSteps() {
    try {
      const stepIndex = 1; // Step 2 (0-based)
      const stepEl = steps[stepIndex];
      if (!stepEl) return;

      // Collect question blocks in the order they appear
      // Include .form-group and [role="group"], exclude conditional detail wrappers
      const all = Array.from(stepEl.querySelectorAll('.form-group, [role="group"]'));
      const questions = all.filter(el => !(
        el.classList.contains('garagespaces-wrap') ||
        el.classList.contains('hoadues-wrap') ||
        el.classList.contains('repairs-list') ||
        el.classList.contains('poolspadetails') ||
        el.classList.contains('solardetails')
      ));
      if (!questions.length) return;

      let sub = 0; // current question index

      // Controls inside step 2
      const backBtn = stepEl.querySelector('[data-action="back"]');
      const nextBtn = stepEl.querySelector('[data-action="next"]');

      function hideAllQs() { questions.forEach(q => q.style.display = 'none'); }

      // Interpolate progress bar within this step to mimic per-question progress
      function updateInterpolatedProgress() {
        if (!progressEl) return;
        const total = questions.length;
        const sectionStart = (stepIndex / steps.length) * 100; // e.g., 25%
        const sectionEnd = ((stepIndex + 1) / steps.length) * 100; // e.g., 50%
        const frac = Math.max(0, Math.min(1, (sub + 1) / total));
        const pct = sectionStart + (sectionEnd - sectionStart) * frac;
        progressEl.style.width = pct + '%';
        progressEl.setAttribute('aria-valuenow', String(Math.round(pct)));
      }

      function isManualAdvanceQuestion(q) {
        // Some questions reveal follow-ups (e.g., HOA dues, Repairs list) -> don't auto-advance
        const name = q.querySelector('input, select, textarea')?.getAttribute('name') || '';
        return (
          name === 'hoa' ||
          name === 'repairs_needed' ||
          name === 'has_pool_spa' ||
          name === 'parking'
        );
      }

      // No generic skip in this model; branching handled per-question (e.g., HOA)

      function showSub(i) {
        sub = Math.max(0, Math.min(questions.length - 1, i));
        hideAllQs();
        const q = questions[sub];
        if (q) q.style.display = '';

        // Show/hide buttons
        if (backBtn) backBtn.style.visibility = (sub === 0 ? 'visible' : 'visible');
        if (nextBtn) nextBtn.style.visibility = isManualAdvanceQuestion(q) ? 'visible' : 'hidden';

        updateInterpolatedProgress();
      }

      function advanceSub() {
        // If last question in this step, move to next main step
        if (sub >= questions.length - 1) {
          if (nextBtn) nextBtn.style.visibility = 'hidden';
          next();
          return;
        }
        showSub(sub + 1);
      }

      function backSub() {
        if (sub === 0) { back(); return; }
        showSub(sub - 1);
      }

      // Wire step-level buttons to micro navigation when on Step 2
      if (backBtn) backBtn.addEventListener('click', function (e) {
        if (current === stepIndex) { e.preventDefault(); backSub(); }
      });
      if (nextBtn) nextBtn.addEventListener('click', function (e) {
        if (current === stepIndex) { e.preventDefault(); advanceSub(); }
      });
      // No skip handler

      // Auto-advance rules
      questions.forEach(q => {
        const inputs = Array.from(q.querySelectorAll('input, select, textarea'));
        const name = inputs[0]?.name || '';
        const isRadioGroup = inputs.some(el => el.type === 'radio');
        const isSelect = inputs.some(el => el.tagName === 'SELECT');
        const isTextLike = inputs.some(el => el.type === 'number' || el.type === 'text' || el.tagName === 'TEXTAREA');

        // Radios -> advance on change unless manual-advance question
        if (isRadioGroup && !isManualAdvanceQuestion(q)) {
          inputs.forEach(el => el.addEventListener('change', function(){
            // ensure a selection is made
            const any = q.querySelector('input[type="radio"]:checked');
            if (any) advanceSub();
          }));
        }

        // Special branching for HOA: if user selects "No", auto-advance and keep details hidden; if "Yes", require manual Next and reveal details via existing toggles.
        if (name === 'hoa' && isRadioGroup) {
          inputs.forEach(el => el.addEventListener('change', function(){
            const val = q.querySelector('input[type="radio"]:checked')?.value?.toLowerCase();
            if (!val) return;
            if (val === 'no' || val === 'false' || val === '0') {
              // Auto-advance past HOA segment
              advanceSub();
            } else {
              // Stay on this micro-question and show Next so they can add HOA details next
              if (nextBtn) nextBtn.style.visibility = 'visible';
            }
          }));
        }

        // Select -> advance on change when a value is chosen
        if (isSelect && !isManualAdvanceQuestion(q)) {
          inputs.forEach(el => el.addEventListener('change', function(){
            if (el.value !== '') advanceSub();
          }));
        }

        // Text/number -> advance on Enter or blur if valid
        if (isTextLike) {
          inputs.forEach(el => {
            el.addEventListener('keydown', function(e){ if (e.key === 'Enter') { e.preventDefault(); if (el.checkValidity()) advanceSub(); } });
            el.addEventListener('blur', function(){ if (el.checkValidity()) advanceSub(); });
          });
        }

        // Special cases where additional details appear: show Next button explicitly
        if (isManualAdvanceQuestion(q) && nextBtn) {
          // Keep Next visible when the controlling choice is interacted with
          q.addEventListener('change', function(){ nextBtn.style.visibility = 'visible'; });
        }
      });

      // Apply placeholder image cards heuristically for certain questions
      const keywordImages = [
        { k: 'kitchen', url: 'https://images.unsplash.com/photo-1505691723518-36a5ac3b2b8f?q=80&w=1200&auto=format&fit=crop' },
        { k: 'bath', url: 'https://images.unsplash.com/photo-1584622781564-1f94a2b52b8e?q=80&w=1200&auto=format&fit=crop' },
        { k: 'living', url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop' },
        { k: 'pool', url: 'https://images.unsplash.com/photo-1505852679233-d9fd70aff56d?q=80&w=1200&auto=format&fit=crop' },
        { k: 'exterior', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1200&auto=format&fit=crop' }
      ];
      function applyCardPlaceholders(q){
        const titleText = (q.querySelector('label, .label, h3, h2')?.textContent || '').toLowerCase();
        const match = keywordImages.find(m => titleText.includes(m.k));
        if (!match) return;
        q.classList.add('as-cards');
        const spans = q.querySelectorAll('.form-check span');
        spans.forEach((s, idx) => {
          const imgUrl = match.url + '&sig=' + (idx+1);
          s.style.setProperty('--card-bg', `url("${imgUrl}")`);
        });
      }
      questions.forEach(applyCardPlaceholders);

      // Initialize visibility only when we enter Step 2
      const origShowStep = showStep;
      showStep = function(index) {
        origShowStep(index);
        if (index === stepIndex) {
          hideAllQs();
          showSub(sub); // reveal current question
        }
      };

      // Start with only first question visible if we land on Step 2 initially
      if (current === stepIndex) { hideAllQs(); showSub(sub); }
    } catch (_) { /* no-op */ }
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
