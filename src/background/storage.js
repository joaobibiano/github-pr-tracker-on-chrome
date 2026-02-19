import { DEFAULT_MAX_AGE_DAYS } from '../shared/constants.js';

export async function getSettings() {
  const {
    githubToken,
    maxAgeDays = DEFAULT_MAX_AGE_DAYS,
    showOthersDrafts = false,
    excludedRepos = [],
    discoveredRepos = []
  } = await chrome.storage.local.get([
    'githubToken', 'maxAgeDays', 'showOthersDrafts',
    'excludedRepos', 'discoveredRepos'
  ]);

  return { githubToken, maxAgeDays, showOthersDrafts, excludedRepos, discoveredRepos };
}

export async function getCurrentPRs() {
  const { currentPRs = [], lastCheck } = await chrome.storage.local.get(['currentPRs', 'lastCheck']);
  return { currentPRs, lastCheck };
}

export async function saveCurrentPRs(prs) {
  await chrome.storage.local.set({
    currentPRs: prs,
    lastCheck: Date.now()
  });
}

export async function saveDiscoveredRepos(repos) {
  const { discoveredRepos = [] } = await chrome.storage.local.get(['discoveredRepos']);
  const merged = [...new Set([...discoveredRepos, ...repos])].sort();
  await chrome.storage.local.set({ discoveredRepos: merged });
}
