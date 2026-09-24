/* Brief first-view reveals. Content is visible by default, including without JS. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const running = new Set();
  let keyboard = false;
  const stop = () => { running.forEach(animation => animation.cancel()); running.clear(); };
  document.addEventListener('keydown', () => {
    keyboard = true;
    document.body.classList.add('keyboard-input');
    stop();
  });
  document.addEventListener('pointerdown', () => {
    keyboard = false;
    document.body.classList.remove('keyboard-input');
  }, { passive:true });
  motion.addEventListener('change', stop);
  if (!('IntersectionObserver' in window) || motion.matches) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      // Never delay anchor navigation, keyboard use, or reduced-motion users.
      if (keyboard || motion.matches || location.hash) return;
      const animation = entry.target.animate([
        { opacity:0.65, transform:'translateY(6px)' },
        { opacity:1, transform:'translateY(0)' }
      ], { duration:260, easing:'cubic-bezier(.23,1,.32,1)' });
      running.add(animation);
      animation.onfinish = animation.oncancel = () => running.delete(animation);
    });
  }, { threshold:0.12 });
  document.querySelectorAll('.hero-content,.intro-copy,.featured-products-grid,.commitment-list,.cta-section,.products-header,.contact-card,.post-header').forEach(el => observer.observe(el));
})();
