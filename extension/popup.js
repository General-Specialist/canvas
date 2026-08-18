const dotEl = document.getElementById('dot');
const tagPillEl = document.getElementById('tagPill');
const timerValEl = document.getElementById('timerVal');
const modeValEl = document.getElementById('modeVal');
const countValEl = document.getElementById('countVal');
const btn5m = document.getElementById('btn5m');
const btn15m = document.getElementById('btn15m');
const btnToggle = document.getElementById('btnToggle');

function updateUI() {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
    browser.runtime.sendMessage({ type: 'GET_FOCUS_STATE' }, (res) => {
      if (res && res.state) {
        const st = res.state;
        const isRunning = st.isRunning && !st.isPaused;
        const activeSites = Object.keys(st.activeSiteStopwatches || {});

        tagPillEl.textContent = '#' + (st.selectedTagName || 'Focus');
        tagPillEl.style.backgroundColor = st.selectedTagColor || '#58cc02';

        if (activeSites.length > 0) {
          timerValEl.textContent = `Unblocked (${activeSites.length})`;
          timerValEl.style.color = '#58cc02';
        } else {
          timerValEl.textContent = isRunning ? `Active (${st.elapsedSeconds}s)` : 'Stopped';
          timerValEl.style.color = isRunning ? '#58cc02' : '#f3f4f6';
        }

        modeValEl.textContent = st.blockingMode === 'unlock_on_timer' ? 'Unlock on Timer' : 'Lock on Timer';
        countValEl.textContent = `${st.blockedDomains?.length || 0} sites`;

        if (!st.blockingEnabled) {
          dotEl.style.background = '#777777';
          btnToggle.textContent = 'Enable Blocker';
          btnToggle.style.color = '#58cc02';
        } else if (activeSites.length > 0 || isRunning) {
          dotEl.style.background = '#58cc02';
          btnToggle.textContent = 'Disable Blocker';
          btnToggle.style.color = '#ff4b4b';
        } else {
          dotEl.style.background = '#ff4b4b';
          btnToggle.textContent = 'Disable Blocker';
          btnToggle.style.color = '#ff4b4b';
        }
      }
    });
  }
}

btn5m.addEventListener('click', () => {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
    browser.runtime.sendMessage({ type: 'TEMP_UNLOCK', minutes: 5 }, () => {
      window.close();
    });
  }
});

btn15m.addEventListener('click', () => {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
    browser.runtime.sendMessage({ type: 'TEMP_UNLOCK', minutes: 15 }, () => {
      window.close();
    });
  }
});

btnToggle.addEventListener('click', () => {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
    browser.runtime.sendMessage({ type: 'TOGGLE_ENABLED' }, () => {
      updateUI();
    });
  }
});

updateUI();
setInterval(updateUI, 1000);
