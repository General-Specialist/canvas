// Blocked Page Script - Auto-redirects when website is unblocked in the Jarvis app
(function () {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('target');
  const domainParam = params.get('domain');

  function getDomain() {
    if (domainParam) return domainParam;
    if (targetUrl) {
      try {
        return new URL(targetUrl).hostname;
      } catch {}
    }
    return '';
  }

  function checkAndRedirect() {
    if (!targetUrl) return;

    // 1. Check with background script
    if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
      browser.runtime.sendMessage(
        { type: 'CHECK_URL_BLOCKED', url: targetUrl },
        (response) => {
          if (response && response.blocked === false) {
            console.log('[Jarvis Focus] Target unblocked via background check, redirecting:', targetUrl);
            window.location.replace(targetUrl);
          }
        }
      );
    }

    // 2. Direct check to local bridge server
    fetch('http://127.0.0.1:43210/status')
      .then((res) => res.json())
      .then((state) => {
        if (!state) return;
        const targetHost = getDomain().toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
        const stopwatches = state.activeSiteStopwatches || {};

        const isStopwatchActive = Object.keys(stopwatches).some((site) => {
          const cleanSite = site.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
          return cleanSite === targetHost || targetHost.endsWith('.' + cleanSite);
        });

        // If stopwatch is actively running in the Jarvis app, redirect to target
        if (isStopwatchActive) {
          console.log('[Jarvis Focus] Target unblocked via server check, redirecting:', targetUrl);
          window.location.replace(targetUrl);
        }
      })
      .catch(() => {});
  }

  // Check immediately on load
  checkAndRedirect();

  // Listen for state updates from background script
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.onMessage) {
    browser.runtime.onMessage.addListener((message) => {
      if (message && message.type === 'FOCUS_STATE_UPDATED') {
        checkAndRedirect();
      }
    });
  }

  // Check periodically while page is open
  const interval = setInterval(checkAndRedirect, 500);
  window.addEventListener('beforeunload', () => clearInterval(interval));
})();
