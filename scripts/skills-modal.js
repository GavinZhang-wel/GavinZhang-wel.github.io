// scripts/skills-modal.js
// Handles opening skill pages in an accessible modal and progressive enhancement
(function () {
  const modal = document.getElementById('skill-modal');
  const overlay = modal && modal.querySelector('.modal-overlay');
  const closeBtn = modal && modal.querySelector('.modal-close');
  const content = document.getElementById('skill-modal-content');
  let lastFocused = null;
  let isOpen = false;

  // Utility: set inert/aria-hidden on main content while modal open
  function setBackgroundInert(state) {
    const main = document.querySelector('main') || document.body;
    if ('inert' in HTMLElement.prototype) {
      if (state) main.inert = true; else main.inert = false;
    } else {
      // fallback: mark aria-hidden on container children except modal
      document.querySelectorAll('body > *').forEach(el => {
        if (el === modal) return;
        if (state) el.setAttribute('aria-hidden', 'true'); else el.removeAttribute('aria-hidden');
      });
    }
  }

  // focus trap (simple): keep focus inside modal
  function trapFocus(e) {
    if (!isOpen) return;
    const focusable = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault(); closeModal(); }
  }

  async function fetchFragment(url) {
    try {
      const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      const fragment = doc.querySelector('#skill-main') || doc.querySelector('main') || doc.body;
      return { html: fragment ? fragment.innerHTML : text, title: doc.title || '' };
    } catch (err) {
      return { html: '<p>加载失败，请刷新页面或直接打开链接查看。</p>', title: '' };
    }
  }

  // expose openSkillModal so index handler can call it
  window.openSkillModal = async function (url, pushHistory = true) {
    if (!modal || isOpen) return;
    lastFocused = document.activeElement;
    // show loading state
    content.innerHTML = '<p>加载中…</p>';
    modal.setAttribute('aria-hidden', 'false');
    setBackgroundInert(true);
    isOpen = true;

    // fetch fragment
    const { html, title } = await fetchFragment(url);
    content.innerHTML = html;
    if (title) document.title = title;

    // focus management
    const focusable = modal.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])');
    const toFocus = focusable.length ? focusable[0] : content;
    toFocus.focus();

    // pushState to update URL (so sharing works)
    if (pushHistory && window.history && window.history.pushState) {
      try { window.history.pushState({ modal: true }, '', url); } catch (e) { /* ignore */ }
    }

    // listeners
    document.addEventListener('keydown', trapFocus);
  };

  function closeModal(cleanTitle = true) {
    if (!modal || !isOpen) return;
    modal.setAttribute('aria-hidden', 'true');
    setBackgroundInert(false);
    isOpen = false;
    content.innerHTML = '';
    document.removeEventListener('keydown', trapFocus);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
    // revert title (optional: reload to original title or keep)
    // if (cleanTitle) document.title = 'Gavin Zhang · 个人官网';
  }

  // click handlers
  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[data-modal="true"]');
    if (!a) return;
    e.preventDefault();
    window.openSkillModal(a.href, true);
  });

  // overlay / close button
  if (overlay) overlay.addEventListener('click', closeModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // handle back/forward to close modal when popping state
  window.addEventListener('popstate', function (e) {
    if (isOpen && !(e.state && e.state.modal)) {
      closeModal(false);
    }
  });

})();
