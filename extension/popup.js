const dotEl = document.getElementById('dot');
const statusValEl = document.getElementById('statusVal');
const countValEl = document.getElementById('countVal');
const unblockedSection = document.getElementById('unblockedSection');
const unblockedItems = document.getElementById('unblockedItems');

function updateUI() {
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.sendMessage) {
    browser.runtime.sendMessage({ type: 'GET_FOCUS_STATE' }, (res) => {
      if (res && res.state) {
        const st = res.state;
        const activeSites = Object.keys(st.activeSiteStopwatches || {});
        const blockedCount = st.blockedDomains?.length || 0;

        countValEl.textContent = `${blockedCount} site${blockedCount === 1 ? '' : 's'}`;

        if (!st.blockingEnabled) {
          dotEl.style.background = '#777777';
          statusValEl.textContent = 'Disabled';
          statusValEl.style.color = '#777777';
          unblockedSection.style.display = 'none';
        } else if (activeSites.length > 0) {
          dotEl.style.background = '#58cc02';
          statusValEl.textContent = `Unblocked (${activeSites.length})`;
          statusValEl.style.color = '#58cc02';

          unblockedSection.style.display = 'flex';
          unblockedItems.innerHTML = activeSites
            .map((site) => `<div class="unblocked-item"><span>●</span> ${site}</div>`)
            .join('');
        } else {
          dotEl.style.background = '#58cc02';
          statusValEl.textContent = 'Locked (Active)';
          statusValEl.style.color = '#ff4b4b';
          unblockedSection.style.display = 'none';
        }
      }
    });
  }
}

updateUI();
setInterval(updateUI, 1000);

