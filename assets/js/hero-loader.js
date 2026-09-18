// Keep the photo out of the loading state, including while Three.js downloads.
import('./pump-viewer.js').catch(error => {
  document.querySelector('[data-pump-viewer]')?.classList.add('is-failed');
  console.warn('3D assets unavailable; showing product photo.', error);
});
