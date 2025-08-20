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
  let current = 0; // index of steps

  function track(event, params) {
    try { if (window.gtag) window.gtag('event', event, params || {}); } catch (e) {}
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
    steps.forEach((fs, i) => fs.classList.toggle('d-none', i !== index));
    const pct = Math.round(((index + 1) / steps.length) * 100);
    if (progressEl) {
      progressEl.style.width = pct + '%';
      progressEl.setAttribute('aria-valuenow', String(pct));
    }
    track('funnel_step_view', { step_index: index + 1, step_total: steps.length });
  }

  function validateStep(index) {
    const fieldset = steps[index];
    if (!fieldset) return true;
    const inputs = Array.from(fieldset.querySelectorAll('input, select, textarea'));
    let valid = true;
    inputs.forEach(el => {
      // Reset state
      el.classList.remove('is-invalid');
      // Native validity check
      if (!el.checkValidity()) {
        valid = false;
        el.classList.add('is-invalid');
      }
      // Simple phone format assist
      if (el.id === 'phone' && el.value) {
        el.value = el.value.replace(/[^0-9+\-()\s]/g, '').trim();
      }
    });
    return valid;
  }

  function next() {
    if (!validateStep(current)) {
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

  // Prevent submit if last step invalid (redundant guard; ghl-integration handles submission)
  form.addEventListener('submit', function (e) {
    track('funnel_submit_attempt');
    if (!validateStep(current)) {
      e.preventDefault();
      track('funnel_submit_blocked');
      return false;
    }
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
    window.location.href = 'thank-you.html';
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
})();
