// Privacy Center flow: jurisdiction gating and form reveal
(function () {
  function qs(sel) { return document.querySelector(sel); }
  function on(el, ev, fn) { el && el.addEventListener(ev, fn); }

  const country = qs('#country');
  const stateWrap = qs('#state-wrapper');
  const state = qs('#state');
  const startBtn = qs('#start-request');
  const msg = qs('#jurisdiction-message');
  const requestCard = qs('#request-card');

  if (!country || !startBtn || !requestCard) return;

  // States we will treat as supporting expanded privacy requests
  const SUPPORTED_STATES = new Set([
    'CA','CO','CT','DE','IA','NE','NH','NJ','OR','TN','TX','UT','VA','MT','FL'
  ]);

  function resetUI() {
    startBtn.disabled = true;
    requestCard.style.display = 'none';
    msg.textContent = '';
    msg.className = 'mt-3 text-sm';
  }

  function evaluateEligibility() {
    let eligible = false;
    resetUI();

    const c = country.value;
    if (!c) return;

    if (c === 'GLOBAL') {
      // Generic global message: route to privacy policy
      msg.innerHTML = 'Thank you for your interest. For jurisdictions without specific statutory rights, please review our <a href="pages/legal/privacy-policy.html">Privacy Policy</a>.';
      startBtn.disabled = true;
      return;
    }

    if (c === 'US') {
      stateWrap.style.display = '';
      const s = state.value;
      if (!s) return; // need a state selection

      if (SUPPORTED_STATES.has(s)) {
        eligible = true;
        msg.innerHTML = 'Your jurisdiction provides certain privacy rights. You can proceed with a request below.';
        startBtn.disabled = false;
      } else {
        // Example: Nevada (NV) not supported — show policy reference like Opendoor
        msg.innerHTML = 'Thank you for your interest. Please review our <a href="pages/legal/privacy-policy.html">Privacy Policy</a>. Some requests may not apply in your jurisdiction.';
        startBtn.disabled = true;
      }
    }
  }

  on(country, 'change', function () {
    // Toggle state field for US
    if (country.value === 'US') {
      stateWrap.style.display = '';
    } else {
      stateWrap.style.display = 'none';
      if (state) state.value = '';
    }
    evaluateEligibility();
  });

  on(state, 'change', evaluateEligibility);

  on(startBtn, 'click', function () {
    // Reveal the Netlify form card and scroll into view
    requestCard.style.display = '';
    requestCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
})();
