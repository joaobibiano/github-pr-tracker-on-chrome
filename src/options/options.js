import { DEFAULT_MAX_AGE_DAYS } from '../shared/constants.js';

document.addEventListener('DOMContentLoaded', async () => {
  const {
    githubToken,
    maxAgeDays = DEFAULT_MAX_AGE_DAYS,
    showOthersDrafts = false,
    discoveredRepos = [],
    excludedRepos = []
  } = await chrome.storage.local.get([
    'githubToken', 'maxAgeDays', 'showOthersDrafts',
    'discoveredRepos', 'excludedRepos'
  ]);

  if (githubToken) {
    document.getElementById('token').value = githubToken;
  }
  document.getElementById('maxAge').value = maxAgeDays;
  document.getElementById('showOthersDrafts').checked = showOthersDrafts;

  renderRepoFilter(discoveredRepos, excludedRepos);
});

document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value.trim();
  const maxAge = parseInt(document.getElementById('maxAge').value, 10) || DEFAULT_MAX_AGE_DAYS;
  const showOthersDrafts = document.getElementById('showOthersDrafts').checked;

  if (!token) {
    showStatus('Please enter a token', 'error');
    return;
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    await chrome.storage.local.set({
      githubToken: token,
      maxAgeDays: maxAge,
      showOthersDrafts
    });
    chrome.runtime.sendMessage({ action: 'checkNow' });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Invalid token. Please check and try again.', 'error');
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
}

function renderRepoFilter(discoveredRepos, excludedRepos) {
  const section = document.getElementById('repoFilterSection');
  const list = document.getElementById('repoList');

  if (!discoveredRepos.length) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = '';
  const excludedSet = new Set(excludedRepos);

  for (const repo of discoveredRepos) {
    const label = document.createElement('label');
    label.className = 'repo-item';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = !excludedSet.has(repo);
    checkbox.dataset.repo = repo;
    checkbox.addEventListener('change', onRepoToggle);

    const name = document.createElement('span');
    name.className = 'repo-name';
    name.textContent = repo;

    label.appendChild(checkbox);
    label.appendChild(name);
    list.appendChild(label);
  }
}

async function onRepoToggle(event) {
  const checkboxes = document.querySelectorAll('#repoList input[type="checkbox"]');
  const excluded = [];

  for (const cb of checkboxes) {
    if (!cb.checked) {
      excluded.push(cb.dataset.repo);
    }
  }

  await chrome.storage.local.set({ excludedRepos: excluded });
  chrome.runtime.sendMessage({ action: 'checkNow' });
}
