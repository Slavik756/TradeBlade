import '../css/styles.css';
import { initMenu } from './modules/menu.js';
import { initCarousel } from './modules/carousel.js';
import { initSignup } from './modules/signup.js';

function init() {
  initMenu();
  initCarousel();
  initSignup();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
