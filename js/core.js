document.addEventListener('DOMContentLoaded', () => {

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


  document.querySelectorAll('.faq-item').forEach(item => {
    const header = item.querySelector('.faq-header');
    const content = item.querySelector('.faq-content');

    if (header && content) {

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
const cardlists = document.querySelectorAll('.cardlist');
cardlists.forEach(list => {

  list.addEventListener('wheel', e => {
    e.preventDefault();
    list.scrollLeft += e.deltaY;
  });

  let isDown = false;
  let startX;
  let scrollLeft;

  list.addEventListener('mousedown', e => {
    isDown = true;
    list.classList.add('active');
    startX = e.pageX - list.offsetLeft;
    scrollLeft = list.scrollLeft;
  });
  list.addEventListener('mouseleave', () => isDown = false);
  list.addEventListener('mouseup', () => isDown = false);
  list.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - list.offsetLeft;
    const walk = (x - startX) * 2;
    list.scrollLeft = scrollLeft - walk;
  });
});
