export function initMenu() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.getElementById('site-nav');

  if (!toggle || !nav) return;

  const mobile = window.matchMedia('(max-width: 1000px)');
  let open = false;

  function setOpen(next, restoreFocus = false) {
    open = mobile.matches && next;
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.inert = mobile.matches && !open;

    if (restoreFocus) toggle.focus();
  }

  toggle.addEventListener('click', () => setOpen(!open));

  nav.addEventListener('click', event => {
    if (event.target.closest('a, [data-open-signup]')) setOpen(false);
  });

  document.addEventListener('click', event => {
    if (open && !nav.contains(event.target) && !toggle.contains(event.target)) {
      setOpen(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (!open) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
      return;
    }

    if (event.key !== 'Tab') return;

    const items = [
      toggle,
      ...nav.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex="0"]'
      ),
    ].filter(element => element.getClientRects().length > 0);
    const first = items[0];
    const last = items.at(-1);

    if (
      event.shiftKey &&
      (document.activeElement === first ||
        !items.includes(document.activeElement))
    ) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (document.activeElement === last ||
        !items.includes(document.activeElement))
    ) {
      event.preventDefault();
      first?.focus();
    }
  });

  mobile.addEventListener('change', () => setOpen(false));
  setOpen(false);
}
