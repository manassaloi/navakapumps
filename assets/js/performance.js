// Performance optimizations for Navaka site
(function() {
  'use strict';
  
  // Optimize image loading
  function optimizeImages() {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    lazyImages.forEach(img => {
      // Add loaded class when image loads
      img.addEventListener('load', function() {
        this.classList.add('loaded');
      });
      
      // Handle image load errors gracefully
      img.addEventListener('error', function() {
        this.style.opacity = '0.5';
        this.alt = 'Image failed to load';
      });
    });
  }
  
  // Debounce scroll events for better performance
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Initialize performance optimizations
  function initPerformance() {
    optimizeImages();
    
    // Add passive event listeners for better scrolling performance
    if (window.addEventListener) {
      window.addEventListener('scroll', debounce(() => {
        // Passive scroll handler
      }, 16), { passive: true });
    }
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPerformance);
  } else {
    initPerformance();
  }
})();
