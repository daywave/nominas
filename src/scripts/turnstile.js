// Loaded only when a person opens the opinion form, not while browsing payrolls.
let scriptPromise;
function loadScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timer = setTimeout(() => fail(), 15000);
      const fail = () => {
        clearTimeout(timer);
        script.remove();
        scriptPromise = null;
        reject(new Error('Turnstile unavailable'));
      };
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.onload = () => {
        clearTimeout(timer);
        if (window.turnstile) resolve(window.turnstile);
        else fail();
      };
      script.onerror = fail;
      document.head.append(script);
    });
  }
  return scriptPromise;
}

export function createTurnstile(container, onChange) {
  let api, widgetId, token = '', disposed = false;
  const update = (value, message = '', retryAllowed = false) => {
    if (disposed) return;
    token = value;
    onChange(value, message, retryAllowed);
  };
  return {
    async start() {
      if (!container?.dataset.sitekey) {
        update('', 'Las opiniones no están habilitadas en este sitio.');
        return;
      }
      update('', 'Verificando que no eres un robot…');
      try {
        api = await loadScript();
        if (disposed) return;
        widgetId = api.render(container, {
          sitekey: container.dataset.sitekey,
          action: 'vote',
          language: 'es',
          size: container.clientWidth < 300 ? 'compact' : 'flexible',
          callback: value => update(value),
          'expired-callback': () => this.reset(),
          'timeout-callback': () => this.reset(),
          'error-callback': () => {
            update('', 'No se pudo verificar. Reintenta la verificación.', true);
            return true;
          },
        });
      } catch {
        update('', 'No se pudo cargar la verificación. Reintenta o revisa tu conexión.', true);
      }
    },
    takeToken() {
      const value = token;
      update('');
      return value;
    },
    reset() {
      update('', 'Verificando que no eres un robot…');
      if (disposed) return;
      if (widgetId !== undefined) api.reset(widgetId);
      else return this.start();
    },
    destroy() {
      disposed = true;
      token = '';
      if (widgetId !== undefined) api.remove(widgetId);
    },
  };
}
