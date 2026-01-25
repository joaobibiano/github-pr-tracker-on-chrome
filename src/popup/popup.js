import { formatTimeAgo } from '../shared/utils.js';

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
      <button id="options">Settings</button>
    </div>
    <div class="last-check">Last checked: ${lastCheckTime}</div>
  `;

  document.getElementById('refresh').addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ action: 'checkNow' });
    window.close();
  });

  document.getElementById('options').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
