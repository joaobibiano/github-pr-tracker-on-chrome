const ALARM_NAME = 'pr-check';
const POLL_INTERVAL_MINUTES = 3;
const GROUP_MY_PRS = 'My PRs';
const GROUP_REVIEW_REQUESTS = 'Review Requests';

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
    const { myPRs, reviewRequests } = await fetchAllPRs(githubToken);
    const { maxAgeDays = 30 } = await chrome.storage.local.get('maxAgeDays');
    const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000;

    const filteredMyPRs = myPRs.filter(pr => new Date(pr.created_at).getTime() > cutoff);
    const filteredReviews = reviewRequests.filter(pr => new Date(pr.created_at).getTime() > cutoff);

    const openUrls = await getOpenPRUrls();

    const newMyPRs = filteredMyPRs.filter(pr => !openUrls.has(pr.html_url));
    const newReviews = filteredReviews.filter(pr => !openUrls.has(pr.html_url));

    if (newMyPRs.length > 0) {
      await addPRsToTabGroup(newMyPRs, GROUP_MY_PRS, 'blue');
    }
    if (newReviews.length > 0) {
      await addPRsToTabGroup(newReviews, GROUP_REVIEW_REQUESTS, 'purple');
    }

    const allPRs = [...filteredMyPRs, ...filteredReviews];
    await chrome.storage.local.set({ currentPRs: allPRs, lastCheck: Date.now() });
    updateBadge(allPRs.length > 0 ? String(allPRs.length) : '', '#4CAF50');
  } catch (error) {
    console.error('Error checking PRs:', error);
    updateBadge('!', '#F44336');
  }
}

async function fetchAllPRs(token) {
  const { showOthersDrafts = false } = await chrome.storage.local.get('showOthersDrafts');
  const reviewQuery = showOthersDrafts
    ? 'is:open+is:pr+user-review-requested:@me'
    : 'is:open+is:pr+user-review-requested:@me+draft:false';

  const [reviewRequests, myPRs] = await Promise.all([
    fetchGitHubSearch(token, reviewQuery),
    fetchGitHubSearch(token, 'is:open+is:pr+author:@me'),
  ]);

  const myPRUrls = new Set(myPRs.map(pr => pr.html_url));
  const filteredReviews = reviewRequests.filter(pr => !myPRUrls.has(pr.html_url));

  return { myPRs, reviewRequests: filteredReviews };
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

async function getOpenPRUrls() {
  const urls = new Set();

  for (const groupName of [GROUP_MY_PRS, GROUP_REVIEW_REQUESTS]) {
    const groups = await chrome.tabGroups.query({ title: groupName });
    if (groups.length === 0) continue;

    const tabs = await chrome.tabs.query({ groupId: groups[0].id });
    for (const tab of tabs) {
      if (tab.url) {
        const normalized = tab.url.split('?')[0].split('#')[0];
        urls.add(normalized);
      }
    }
  }
  return urls;
}

async function addPRsToTabGroup(prs, groupName, color) {
  if (prs.length === 0) return;

  const tabs = [];
  for (const pr of prs) {
    const tab = await chrome.tabs.create({
      url: pr.html_url,
      active: false,
    });
    tabs.push(tab.id);
  }

  const existingGroups = await chrome.tabGroups.query({ title: groupName });

  if (existingGroups.length > 0) {
    await chrome.tabs.group({ tabIds: tabs, groupId: existingGroups[0].id });
  } else {
    const groupId = await chrome.tabs.group({ tabIds: tabs });
    await chrome.tabGroups.update(groupId, {
      title: groupName,
      color,
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
});
