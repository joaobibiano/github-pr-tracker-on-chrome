import { DEFAULT_MAX_AGE_DAYS } from '../shared/constants.js';

export async function getSettings() {
  const {
    githubToken,
    maxAgeDays = DEFAULT_MAX_AGE_DAYS,
    showOthersDrafts = false
  } = await chrome.storage.local.get(['githubToken', 'maxAgeDays', 'showOthersDrafts']);

  return { githubToken, maxAgeDays, showOthersDrafts };
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
