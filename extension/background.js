// Jarvis Focus Blocker - Background Service
const API_BASE = 'http://127.0.0.1:43210';
const WS_URL = 'ws://127.0.0.1:43210/ws';

let focusState = {
  isRunning: false,
  isPaused: false,
  selectedTagId: 'tag-coding',
  selectedTagName: 'Coding',
  selectedTagColor: '#58CC02',
  elapsedSeconds: 0,
  mode: 'stopwatch',
  blockingEnabled: true,
  blockingMode: 'unlock_on_timer', // 'unlock_on_timer' | 'block_on_timer'
  blockedDomains: [
    'youtube.com',
    'twitter.com',
    'x.com',
    'reddit.com',
    'instagram.com',
    'facebook.com',
    'tiktok.com',
    'twitch.tv',
    'netflix.com',
  ],
  unlockedUntil: null,
  lastUpdated: Date.now(),
};

let ws = null;
let isConnected = false;
let reconnectTimer = null;
let pollTimer = null;

// Load persisted state if available
if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
  browser.storage.local.get('focusState').then((res) => {
    if (res && res.focusState) {
      focusState = { ...focusState, ...res.focusState };
    }
  }).catch(() => {});
}

function updateState(newState) {
  if (!newState) return;
  const prevRunning = focusState.isRunning && !focusState.isPaused;
  focusState = { ...focusState, ...newState };

  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    browser.storage.local.set({ focusState });
  }

  // Update extension badge
  updateBadge();

  // If timer just became active and mode is 'unlock_on_timer', reload blocked tabs
  const nowRunning = focusState.isRunning && !focusState.isPaused;
  if (!prevRunning && nowRunning && focusState.blockingMode === 'unlock_on_timer') {
    reloadBlockedTabs();
  }
}

function updateBadge() {
  if (typeof browser === 'undefined' || !browser.browserAction) return;

  if (!focusState.blockingEnabled) {
    browser.browserAction.setBadgeText({ text: 'OFF' });
    browser.browserAction.setBadgeBackgroundColor({ color: '#777777' });
    return;
  }

  const isTempUnlocked = focusState.unlockedUntil && focusState.unlockedUntil > Date.now();
  if (isTempUnlocked) {
    browser.browserAction.setBadgeText({ text: 'PASS' });
    browser.browserAction.setBadgeBackgroundColor({ color: '#1CB0F6' });
    return;
  }

  const isTimerActive = focusState.isRunning && !focusState.isPaused;
  if (focusState.blockingMode === 'unlock_on_timer') {
    if (isTimerActive) {
      browser.browserAction.setBadgeText({ text: 'ON' });
      browser.browserAction.setBadgeBackgroundColor({ color: '#58CC02' });
    } else {
      browser.browserAction.setBadgeText({ text: 'LOCK' });
      browser.browserAction.setBadgeBackgroundColor({ color: '#FF4B4B' });
    }
  } else {
    // block_on_timer mode
    if (isTimerActive) {
      browser.browserAction.setBadgeText({ text: 'LOCK' });
      browser.browserAction.setBadgeBackgroundColor({ color: '#FF4B4B' });
    } else {
      browser.browserAction.setBadgeText({ text: 'FREE' });
      browser.browserAction.setBadgeBackgroundColor({ color: '#58CC02' });
    }
  }
}

// WebSocket Connection Management
function connectWebSocket() {
  if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN)) {
    return;
  }

  try {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      isConnected = true;
      console.log('[Jarvis Blocker] WebSocket Connected to Jarvis Bridge');
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        updateState(data);
      } catch (err) {
        console.error('[Jarvis Blocker] Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      isConnected = false;
      scheduleReconnect();
    };

    ws.onerror = () => {
      isConnected = false;
      if (ws) ws.close();
    };
  } catch (err) {
    isConnected = false;
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) return;
  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectWebSocket();
  }, 2500);
}

// Fallback Polling in case WebSocket drops
async function pollStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    if (res.ok) {
      const data = await res.json();
      updateState(data);
    }
  } catch {
    // Server is probably offline
  }
}

// Check domain match against list
function matchDomain(hostname, fullUrl) {
  if (!hostname || !focusState.blockedDomains || !Array.isArray(focusState.blockedDomains)) return null;
  const host = hostname.toLowerCase();
  const urlLower = (fullUrl || '').toLowerCase();

  // YouTube Music exemption: keep music.youtube.com working unless explicitly added
  if (
    host === 'music.youtube.com' ||
    host.endsWith('.music.youtube.com') ||
    urlLower.includes('music.youtube.com')
  ) {
    const hasExplicitMusicBlock = focusState.blockedDomains.some(
      (item) => item.toLowerCase().trim() === 'music.youtube.com'
    );
    if (!hasExplicitMusicBlock) {
      return null; // Allowed!
    }
  }

  for (const item of focusState.blockedDomains) {
    const pattern = item.toLowerCase().trim();
    if (!pattern) continue;
    if (
      host === pattern ||
      host === 'www.' + pattern ||
      host === 'm.' + pattern ||
      host.endsWith('.' + pattern)
    ) {
      return pattern;
    }
  }
  return null;
}

// Determine whether a domain should be blocked
function isDomainBlocked(urlStr) {
  if (!focusState.blockingEnabled) return false;

  // Check temporary pass
  if (focusState.unlockedUntil && focusState.unlockedUntil > Date.now()) {
    return false;
  }

  try {
    const url = new URL(urlStr);
    // Ignore internal or localhost requests
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') return false;

    const matched = matchDomain(url.hostname, urlStr);
    if (!matched) return false;

    // Check if this website has an active running stopwatch in Jarvis!
    const stopwatches = focusState.activeSiteStopwatches || {};
    const isStopwatchRunning = Boolean(
      stopwatches[matched] || stopwatches[url.hostname.toLowerCase()]
    );

    if (isStopwatchRunning) {
      return false; // Stopwatch is active -> Unlocked!
    }

    // Also check global timer if in unlock_on_timer mode
    const isTimerActive = focusState.isRunning && !focusState.isPaused;
    if (focusState.blockingMode === 'unlock_on_timer') {
      return !isTimerActive;
    } else {
      return isTimerActive;
    }

  } catch {
    return false;
  }
}



// Intercept Web Requests
browser.webRequest.onBeforeRequest.addListener(
  (details) => {
    // Only intercept top-level page navigations
    if (details.type !== 'main_frame') return {};

    const url = details.url;
    // Don't intercept the blocker page itself
    const blockerUrl = browser.runtime.getURL('blocked.html');
    if (url.startsWith(blockerUrl)) return {};

    if (isDomainBlocked(url)) {
      let hostname = '';
      try {
        hostname = new URL(url).hostname;
      } catch {}

      const redirectUrl = `${blockerUrl}?target=${encodeURIComponent(url)}&domain=${encodeURIComponent(hostname)}&mode=${encodeURIComponent(focusState.blockingMode)}&tag=${encodeURIComponent(focusState.selectedTagName || 'Focus')}&color=${encodeURIComponent(focusState.selectedTagColor || '#58CC02')}`;
      return { redirectUrl };
    }

    return {};
  },
  { urls: ['<all_urls>'], types: ['main_frame'] },
  ['blocking']
);

// If blocked tabs are open when timer starts, refresh them to load original page
async function reloadBlockedTabs() {
  try {
    const blockerUrl = browser.runtime.getURL('blocked.html');
    const tabs = await browser.tabs.query({});
    for (const tab of tabs) {
      if (tab.url && tab.url.startsWith(blockerUrl)) {
        const parsed = new URL(tab.url);
        const target = parsed.searchParams.get('target');
        if (target && !isDomainBlocked(target)) {
          browser.tabs.update(tab.id, { url: target });
        }
      }
    }
  } catch (err) {
    console.error('[Jarvis Blocker] Error refreshing tabs:', err);
  }
}


// Runtime message listener for popup & blocked page
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_FOCUS_STATE') {
    sendResponse({ state: focusState, isConnected });
    return true;
  }

  if (message.type === 'TEMP_UNLOCK') {
    const minutes = message.minutes || 5;
    focusState.unlockedUntil = Date.now() + minutes * 60 * 1000;
    updateBadge();
    reloadBlockedTabs();
    sendResponse({ success: true, unlockedUntil: focusState.unlockedUntil });
    return true;
  }

  if (message.type === 'TOGGLE_ENABLED') {
    focusState.blockingEnabled = !focusState.blockingEnabled;
    updateBadge();
    sendResponse({ success: true, enabled: focusState.blockingEnabled });
    return true;
  }
});

// Initialize
connectWebSocket();
pollTimer = setInterval(pollStatus, 3000);
updateBadge();
