export function initCarousel() {
  const track = document.querySelector('[data-trades-track]');
  const previous = document.querySelector('[data-scroll-trades="prev"]');
  const next = document.querySelector('[data-scroll-trades="next"]');

  if (!track || !previous || !next) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = 0;

  function updateControls() {
    const maximum = Math.max(0, track.scrollWidth - track.clientWidth);
    previous.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft >= maximum - 1;
    frame = 0;
  }

  function scheduleUpdate() {
    if (!frame) frame = window.requestAnimationFrame(updateControls);
  }

  function scroll(direction) {
    const firstCard = track.firstElementChild;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap) || 0;
    const distance = firstCard
      ? firstCard.getBoundingClientRect().width + gap
      : track.clientWidth;

    track.scrollBy({
      left: direction * distance,
      behavior: reducedMotion.matches ? 'instant' : 'smooth',
    });
  }

  previous.addEventListener('click', () => scroll(-1));
  next.addEventListener('click', () => scroll(1));
  track.addEventListener('scroll', scheduleUpdate, { passive: true });

  const observer = new ResizeObserver(scheduleUpdate);
  observer.observe(track);
  for (const card of track.children) observer.observe(card);

  updateControls();
}
