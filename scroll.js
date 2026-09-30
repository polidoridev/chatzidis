(() => {
  const elements = [...document.querySelectorAll('.reveal')];
  if (!elements.length || !('IntersectionObserver' in window)) return;

  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const root = document.documentElement;
  let observer;
  let enabled = false;

  function reveal(element, immediate = false) {
    if (immediate) element.classList.add('reveal-instant');
    element.classList.add('in');
    element.classList.remove('reveal-pending');
    observer?.unobserve(element);
  }

  function configure() {
    observer?.disconnect();
    enabled = !preference.matches && document.body.classList.contains('motion-enabled');
    root.classList.toggle('scroll-motion-enabled', enabled);
    if (!enabled) {
      elements.forEach(element => element.classList.remove('reveal-pending'));
      return;
    }

    observer = new IntersectionObserver(entries => {
      // Stagger only neighbours entering together on the same visual row.
      const entering = entries.filter(entry => entry.isIntersecting);
      entering.forEach(({ target, boundingClientRect }) => {
        const column = entering.filter(entry =>
          entry.target.parentElement === target.parentElement &&
          Math.abs(entry.boundingClientRect.top - boundingClientRect.top) < 12 &&
          entry.boundingClientRect.left < boundingClientRect.left
        ).length;
        target.style.setProperty('--reveal-delay', `${Math.min(column * 90, 270)}ms`);
        reveal(target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(element => {
      if (element.classList.contains('in')) return;
      // Do not hide content already on screen, including restored scroll positions.
      if (element.getBoundingClientRect().top < innerHeight - 40) {
        reveal(element, true);
      } else {
        observer.observe(element);
        element.classList.add('reveal-pending');
      }
    });
  }

  // Keyboard focus must never land on an invisible link or control.
  document.addEventListener('focusin', event => {
    const element = event.target.closest('.reveal');
    if (element) reveal(element, true);
  });
  document.addEventListener('site:motionchange', configure);
  preference.addEventListener('change', configure);
  window.addEventListener('pageshow', configure);
  configure();
})();
