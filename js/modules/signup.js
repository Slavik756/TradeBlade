export function initSignup() {
  const dialog = document.getElementById('signup-dialog');
  const form = document.getElementById('signup-form');
  const email = document.getElementById('signup-email');
  const context = document.getElementById('signup-context');
  const feedback = document.getElementById('signup-feedback');

  if (!dialog || !form || !email || !context || !feedback) return;

  let opener = null;

  function openDialog(trigger, initialEmail = '') {
    opener = trigger;
    const plan = trigger.dataset.plan;
    context.textContent = plan
      ? `Вы выбрали тариф ${plan}. Это демонстрационная форма: регистрация пока не подключена.`
      : 'Это демонстрационная форма: регистрация пока не подключена.';
    feedback.hidden = true;
    feedback.textContent = '';
    email.value = initialEmail;
    dialog.showModal();
    email.focus();
  }

  for (const trigger of document.querySelectorAll('[data-open-signup]')) {
    trigger.addEventListener('click', () => openDialog(trigger));
  }

  for (const entry of document.querySelectorAll('[data-signup-entry]')) {
    entry.addEventListener('submit', event => {
      event.preventDefault();
      if (!entry.reportValidity()) return;
      const entryEmail = entry.querySelector('input[type="email"]');
      openDialog(
        event.submitter || entryEmail || entry,
        entryEmail?.value.trim() || ''
      );
      if (entryEmail) entryEmail.value = '';
    });
  }

  for (const close of dialog.querySelectorAll('[data-dialog-close]')) {
    close.addEventListener('click', event => {
      event.preventDefault();
      dialog.close();
    });
  }

  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    email.value = '';
    feedback.textContent =
      'Регистрация пока недоступна: сервис ещё не подключён. Ваш e-mail никуда не отправлен.';
    feedback.hidden = false;
  });

  dialog.addEventListener('close', () => {
    form.reset();
    email.value = '';
    feedback.hidden = true;
    feedback.textContent = '';
    const target =
      opener?.isConnected &&
      !opener.closest('[inert]') &&
      opener.getClientRects().length
        ? opener
        : document.querySelector('[data-menu-toggle]');
    target?.focus();
    opener = null;
  });
}
