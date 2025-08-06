// Critical resource preloading utility
export function preloadCriticalResources() {
  // Preload fonts
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
  link.as = 'style';
  link.onload = () => {
    link.rel = 'stylesheet';
  };
  document.head.appendChild(link);

  // Preload critical API endpoints
  if ('connection' in navigator && (navigator as any).connection.effectiveType !== '4g') {
    // Only preload on good connections
    return;
  }

  // Preload auth status (if user is likely logged in)
  if (document.cookie.includes('connect.sid')) {
    fetch('/api/auth/user', { 
      method: 'GET',
      credentials: 'include'
    }).catch(() => {
      // Ignore errors, this is just preloading
    });
  }
}

// Service Worker registration for caching
export function registerServiceWorker() {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(() => {
          console.log('Service Worker registered');
        })
        .catch(() => {
          console.log('Service Worker registration failed');
        });
    });
  }
}