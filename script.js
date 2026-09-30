(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  // ---- Age gate ----
  const gate = $('#ageGate');
  if (store.get('juicers-age-ok') === '1') {
    gate.classList.add('hidden');
  } else {
    document.body.classList.add('locked');
  }
  $('#ageYes').addEventListener('click', () => {
    store.set('juicers-age-ok', '1');
    gate.classList.add('hidden');
    document.body.classList.remove('locked');
  });
  $('#ageNo').addEventListener('click', () => {
    $('#ageMsg').textContent = "Sorry — come back when you're of legal drinking age.";
  });

  // ---- Nav ----
  const nav = $('#nav');
  const toggle = $('#navToggle');
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    document.body.classList.toggle('locked', open);
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('locked');
  }));

  // ---- Reveal on scroll ----
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  $$('.reveal').forEach(el => {
    // stagger siblings in grids
    const siblings = $$(':scope > .reveal', el.parentElement);
    const i = siblings.indexOf(el);
    if (i > 0) el.style.transitionDelay = `${Math.min(i, 4) * 90}ms`;
    io.observe(el);
  });

  // ---- Stat counters ----
  const countIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const start = performance.now();
      const dur = 1600;
      const tick = now => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => countIO.observe(el));

  // ---- Toast ----
  const toast = $('#toast');
  let toastTimer;
  const showToast = msg => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
  };

  // ---- Add to bag (placeholder until a store is connected) ----
  $$('[data-add]').forEach(btn => btn.addEventListener('click', () => {
    showToast(`${btn.dataset.add} added to your bag`);
  }));

  // ---- Enquiry form ----
  const form = $('#enquiryForm');
  const status = $('#formStatus');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    $$('[required]', form).forEach(input => {
      const valid = input.checkValidity();
      input.classList.toggle('invalid', !valid);
      if (!valid) ok = false;
    });
    if (!ok) {
      status.textContent = 'Please add your name and a valid email.';
      return;
    }
    const name = form.elements.name.value.trim().split(' ')[0];
    status.textContent = `Thank you, ${name}. We'll be in touch within 24 hours.`;
    form.reset();
  });

  // ---- Newsletter ----
  $('#newsletter').addEventListener('submit', e => {
    e.preventDefault();
    showToast("You're on the guest list.");
    e.target.reset();
  });

  $('#year').textContent = new Date().getFullYear();
})();
