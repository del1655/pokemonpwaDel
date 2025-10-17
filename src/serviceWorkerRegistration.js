export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
      navigator.serviceWorker.register(swUrl)
      .then(reg => {
        console.log('Service Worker registrado:', reg);
      })
      .catch(err => {
        console.error('Registro SW falló:', err);
      });
    });
  } else {
    console.log('Service Worker no soportado en este navegador.');
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.unregister();
    });
  }
}
