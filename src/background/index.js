import {
  ALARM_NAME,
  POLL_INTERVAL_MINUTES,
  GROUP_MY_PRS,
  GROUP_REVIEW_REQUESTS,
  GROUP_COLORS,
  BADGE_COLORS
} from '../shared/constants.js';
import { getSettings, saveCurrentPRs } from './storage.js';
import { fetchAllPRs } from './github-api.js';
import { getOpenPRUrls, addPRsToTabGroup, closeMergedPRTabs } from './tab-manager.js';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: POLL_INTERVAL_MINUTES });
  checkForPRs();
});

chrome.runtime.onStartup.addListener(() => {
  checkForPRs();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    checkForPRs();
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkNow') {
    checkForPRs().then(() => sendResponse({ success: true }));
    return true;
  }
});

async function checkForPRs() {
  const { githubToken, maxAgeDays, showOthersDrafts } = await getSettings();

  if (!githubToken) {
    updateBadge('!', BADGE_COLORS.ERROR);
    return;
  }

  try {
    const { myPRs, reviewRequests } = await fetchAllPRs(githubToken, showOthersDrafts);
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    const filteredMyPRs = myPRs.filter(pr => new Date(pr.created_at).getTime() > cutoff);
    const filteredReviews = reviewRequests.filter(pr => new Date(pr.created_at).getTime() > cutoff);

    const allOpenPRUrls = [...filteredMyPRs, ...filteredReviews].map(pr => pr.html_url);
    await closeMergedPRTabs(allOpenPRUrls);

    const openUrls = await getOpenPRUrls();

    const newMyPRs = filteredMyPRs.filter(pr => !openUrls.has(pr.html_url));
    const newReviews = filteredReviews.filter(pr => !openUrls.has(pr.html_url));

    if (newMyPRs.length > 0) {
      await addPRsToTabGroup(newMyPRs, GROUP_MY_PRS, GROUP_COLORS[GROUP_MY_PRS]);
    }
    if (newReviews.length > 0) {
      await addPRsToTabGroup(newReviews, GROUP_REVIEW_REQUESTS, GROUP_COLORS[GROUP_REVIEW_REQUESTS]);
    }

    const allPRs = [...filteredMyPRs, ...filteredReviews];
    await saveCurrentPRs(allPRs);
    updateBadge(allPRs.length > 0 ? String(allPRs.length) : '', BADGE_COLORS.SUCCESS);
  } catch (error) {
    console.error('Error checking PRs:', error);
    updateBadge('!', BADGE_COLORS.ERROR);
  }
}

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
}
