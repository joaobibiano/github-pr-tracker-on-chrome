document.addEventListener('DOMContentLoaded', async () => {
  const { githubToken, currentPRs = [], lastCheck } = await chrome.storage.local.get([
    'githubToken',
    'currentPRs',
    'lastCheck',
  ]);

  const content = document.getElementById('content');

  if (!githubToken) {
    content.innerHTML = `
      <div class="no-token">
        <p>No GitHub token configured</p>
        <div class="actions">
          <button class="primary" id="openOptions">Configure Token</button>
        </div>
      </div>
    `;
    document.getElementById('openOptions').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    return;
  }

  const lastCheckTime = lastCheck ? formatTimeAgo(lastCheck) : 'Never';

  content.innerHTML = `
    <div class="pr-count">
      ${currentPRs.length}
      <span>PRs awaiting review</span>
    </div>
    <div class="actions">
      <button id="refresh">Refresh</button>
      <button id="clearSeen">Re-add All</button>
      <button id="options">Settings</button>
    </div>
    <div class="last-check">Last checked: ${lastCheckTime}</div>
  `;

  document.getElementById('refresh').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'checkNow' });
    window.close();
  });

  document.getElementById('clearSeen').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'clearSeen' });
    window.close();
  });

  document.getElementById('options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});

function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
