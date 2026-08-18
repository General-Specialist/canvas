// Blocked Page Script - Auto-redirects when website is unblocked
(function () {
  const params = new URLSearchParams(window.location.search);
  const targetUrl = params.get('target');
  const domainParam = params.get('domain');

  const btnUnblock = document.getElementById('btnUnblock');

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

    // Check with background script
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

    // Secondary direct check to local bridge server
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

        const isTimerActive = state.isRunning && !state.isPaused;
        const isModeUnlock = state.blockingMode === 'unlock_on_timer';
        const isTempUnlocked = state.unlockedUntil && state.unlockedUntil > Date.now();
        const isBlockedInList = (state.blockedDomains || []).some((item) => {
          const cleanItem = item.toLowerCase().replace(/^www\./, '').replace(/^m\./, '');
          return cleanItem === targetHost || targetHost.endsWith('.' + cleanItem);
        });

        const isBlocked =
          state.blockingEnabled &&
          isBlockedInList &&
          !isTempUnlocked &&
          !isStopwatchActive &&
          (!isModeUnlock ? isTimerActive : !isTimerActive);

        if (!isBlocked) {
          console.log('[Jarvis Focus] Target unblocked via server check, redirecting:', targetUrl);
          window.location.replace(targetUrl);
        }
      })
      .catch(() => {});
  }

  // Handle Unblock Button Click
  if (btnUnblock) {
    btnUnblock.addEventListener('click', async () => {
      btnUnblock.disabled = true;
      btnUnblock.textContent = 'Unlocking...';

      const domain = getDomain();

      // 1. Notify background script
      if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
        browser.runtime.sendMessage({
          type: 'START_SITE_STOPWATCH',
          domain,
        });
      }

      // 2. Direct call to Jarvis Bridge Server
      try {
        await fetch('http://127.0.0.1:43210/api/start-stopwatch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain }),
        });
      } catch (err) {
        console.warn('[Jarvis Blocker] Direct server call warning:', err);
      }

      // 3. Redirect immediately
      setTimeout(() => {
        if (targetUrl) {
          window.location.replace(targetUrl);
        }
      }, 200);
    });
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
  const interval = setInterval(checkAndRedirect, 600);
  window.addEventListener('beforeunload', () => clearInterval(interval));
})();
