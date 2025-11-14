document.addEventListener('DOMContentLoaded', () => {
  // Меню открытие/закрытие
  const openBtn = document.querySelector('.button-menu-open');
  const closeBtn = document.querySelector('.button-menu-close');
  const nav = document.querySelector('.header-nav');

  if (openBtn && closeBtn && nav) {
    openBtn.addEventListener('click', () => nav.classList.add('open'));
    closeBtn.addEventListener('click', () => nav.classList.remove('open'));

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => nav.classList.remove('open'));
    });
  }

  // Переключатель Спот / Фьючерс
  const spotBtn = document.getElementById("spotBtn");
  const futuresBtn = document.getElementById("futuresBtn");
  const spotForm = document.getElementById("spotForm");
  const futuresForm = document.getElementById("futuresForm");

  if (spotBtn && futuresBtn && spotForm && futuresForm) {
    spotBtn.addEventListener("click", () => {
      spotBtn.classList.add("active");
      futuresBtn.classList.remove("active");
      spotForm.classList.add("show");
      futuresForm.classList.remove("show");
    });

    futuresBtn.addEventListener("click", () => {
      futuresBtn.classList.add("active");
      spotBtn.classList.remove("active");
      futuresForm.classList.add("show");
      spotForm.classList.remove("show");
    });
  }

  // FAQ аккордеон для твоей разметки
  document.querySelectorAll('.faq-item').forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');

    if (header && content) {
      // скрываем контент по умолчанию
      content.style.maxHeight = item.classList.contains('active') ? content.scrollHeight + 'px' : '0';
      content.style.overflow = 'hidden';
      content.style.transition = 'max-height 0.3s ease';

      header.addEventListener('click', () => {
        item.classList.toggle('active');
        if (item.classList.contains('active')) {
          content.style.maxHeight = content.scrollHeight + 'px';
        } else {
          content.style.maxHeight = '0';
        }
      });
    }
  });
});
