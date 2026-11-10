(() => {
  const track = document.getElementById('track');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsWrap = document.getElementById('dots');
  const carousel = document.querySelector('.carousel');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let pageCount = 1;
  let current = 0;
  let autoplayId = null;
  let dots = [];

  function maxScroll() {
    return Math.max(0, track.scrollWidth - track.clientWidth);
  }

  function computePageCount() {
    const ms = maxScroll();
    return ms <= 1 ? 1 : Math.round(track.scrollWidth / track.clientWidth);
  }

  function buildDots() {
    pageCount = computePageCount();
    dotsWrap.innerHTML = '';
    dots = Array.from({ length: pageCount }, (_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot';
      dot.setAttribute('aria-label', 'Show testimonials, page ' + (i + 1) + ' of ' + pageCount);
      dot.addEventListener('click', () => goToPage(i));
      dotsWrap.appendChild(dot);
      return dot;
    });
    dotsWrap.style.display = pageCount <= 1 ? 'none' : 'flex';
    setActive(Math.min(current, pageCount - 1));
  }

  function setActive(index) {
    current = index;
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  function goToPage(index) {
    const ms = maxScroll();
    const target = pageCount > 1 ? (index / (pageCount - 1)) * ms : 0;
    track.scrollTo({ left: target, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  const EDGE_TOLERANCE = 12;

  function next() {
    const ms = maxScroll();
    if (track.scrollLeft >= ms - EDGE_TOLERANCE) { track.scrollTo({ left: 0, behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    track.scrollBy({ left: track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  function prev() {
    if (track.scrollLeft <= EDGE_TOLERANCE) { track.scrollTo({ left: maxScroll(), behavior: reduceMotion ? 'auto' : 'smooth' }); return; }
    track.scrollBy({ left: -track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  let scrollTimer = null;
  track.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      const ms = maxScroll();
      const ratio = ms > 0 ? track.scrollLeft / ms : 0;
      const idx = Math.round(ratio * (pageCount - 1));
      setActive(Math.max(0, Math.min(pageCount - 1, idx)));
    }, 100);
  }, { passive: true });

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  track.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  });

  function startAutoplay() {
    if (reduceMotion || autoplayId) return;
    autoplayId = setInterval(next, 4500);
  }
  function stopAutoplay() {
    clearInterval(autoplayId);
    autoplayId = null;
  }
  carousel.addEventListener('pointerenter', stopAutoplay);
  carousel.addEventListener('pointerleave', startAutoplay);
  carousel.addEventListener('focusin', stopAutoplay);
  carousel.addEventListener('focusout', startAutoplay);

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(buildDots, 150);
  });

  buildDots();
  startAutoplay();
})();
