const ALARM_NAME = 'pr-check';
const POLL_INTERVAL_MINUTES = 3;
const TAB_GROUP_NAME = 'To Review';

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

async function checkForPRs() {
  const { githubToken } = await chrome.storage.local.get('githubToken');
  if (!githubToken) {
    updateBadge('!', '#F44336');
    return;
  }

  try {
    const allPRs = await fetchReviewRequests(githubToken);
    const { maxAgeDays = 30 } = await chrome.storage.local.get('maxAgeDays');
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;
    const prs = allPRs.filter(pr => new Date(pr.created_at).getTime() > cutoff);

    const { seenPRs = [] } = await chrome.storage.local.get('seenPRs');
    const seenUrls = new Set(seenPRs);

    const newPRs = prs.filter(pr => !seenUrls.has(pr.html_url));

    if (newPRs.length > 0) {
      await addPRsToTabGroup(newPRs);
      const updatedSeen = [...seenUrls, ...newPRs.map(pr => pr.html_url)];
      await chrome.storage.local.set({ seenPRs: updatedSeen });
    }

    await chrome.storage.local.set({ currentPRs: prs, lastCheck: Date.now() });
    updateBadge(prs.length > 0 ? String(prs.length) : '', '#4CAF50');
  } catch (error) {
    console.error('Error checking PRs:', error);
    updateBadge('!', '#F44336');
  }
}

async function fetchReviewRequests(token) {
  const [reviewRequests, myPRs] = await Promise.all([
    fetchGitHubSearch(token, 'is:open+is:pr+user-review-requested:@me'),
    fetchGitHubSearch(token, 'is:open+is:pr+author:@me'),
  ]);

  const seen = new Set();
  const combined = [];
  for (const pr of [...myPRs, ...reviewRequests]) {
    if (!seen.has(pr.html_url)) {
      seen.add(pr.html_url);
      combined.push(pr);
    }
  }
  return combined;
}

async function fetchGitHubSearch(token, query) {
  const response = await fetch(
    `https://api.github.com/search/issues?q=${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const data = await response.json();
  return data.items || [];
}

async function addPRsToTabGroup(prs) {
  if (prs.length === 0) return;

  const tabs = [];
  for (const pr of prs) {
    const tab = await chrome.tabs.create({
      url: pr.html_url,
      active: false,
    });
    tabs.push(tab.id);
  }

  const existingGroups = await chrome.tabGroups.query({ title: TAB_GROUP_NAME });

  if (existingGroups.length > 0) {
    await chrome.tabs.group({ tabIds: tabs, groupId: existingGroups[0].id });
  } else {
    const groupId = await chrome.tabs.group({ tabIds: tabs });
    await chrome.tabGroups.update(groupId, {
      title: TAB_GROUP_NAME,
      color: 'purple',
      collapsed: true,
    });
  }
}

function updateBadge(text, color) {
  chrome.action.setBadgeText({ text });
  chrome.action.setBadgeBackgroundColor({ color });
  chrome.action.setBadgeTextColor({ color: '#FFFFFF' });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'checkNow') {
    checkForPRs().then(() => sendResponse({ success: true }));
    return true;
  }
  if (message.action === 'clearSeen') {
    chrome.storage.local.set({ seenPRs: [] }).then(() => {
      checkForPRs().then(() => sendResponse({ success: true }));
    });
    return true;
  }
});
