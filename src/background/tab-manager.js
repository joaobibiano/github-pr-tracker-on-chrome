import { GROUP_MY_PRS, GROUP_REVIEW_REQUESTS } from '../shared/constants.js';
import { normalizeUrl } from '../shared/utils.js';

export async function getOpenPRUrls() {
  const urls = new Set();

  const allTabs = await chrome.tabs.query({ url: 'https://github.com/*/*/pull/*' });
  for (const tab of allTabs) {
    if (tab.url) {
      urls.add(normalizeUrl(tab.url));
    }
  }

  return urls;
}

export async function closeMergedPRTabs(openPRUrls) {
  const openUrlSet = new Set(openPRUrls.map(url => normalizeUrl(url)));

  for (const groupName of [GROUP_MY_PRS, GROUP_REVIEW_REQUESTS]) {
    const groups = await chrome.tabGroups.query({ title: groupName });
    if (groups.length === 0) continue;

    const tabs = await chrome.tabs.query({ groupId: groups[0].id });
    const tabsToClose = tabs.filter(tab => {
      if (!tab.url || tab.active) return false;
      return !openUrlSet.has(normalizeUrl(tab.url));
    });

    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose.map(t => t.id));
    }
  }
}

async function applyGroupStyle(groupId, groupName, color) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    await chrome.tabGroups.update(groupId, { color });
    await chrome.tabGroups.update(groupId, { title: groupName });

    const group = await chrome.tabGroups.get(groupId);
    if (group.title === groupName && group.color === color) {
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

export async function addPRsToTabGroup(prs, groupName, color) {
  if (prs.length === 0) return;

  // Re-check open URLs right before creating tabs to avoid duplicates
  const alreadyOpen = await getOpenPRUrls();
  const toOpen = prs.filter(pr => !alreadyOpen.has(normalizeUrl(pr.html_url)));
  if (toOpen.length === 0) return;

  const tabs = [];
  for (const pr of toOpen) {
    const tab = await chrome.tabs.create({
      url: pr.html_url,
      active: false,
    });
    tabs.push(tab.id);
  }

  const existingGroups = await chrome.tabGroups.query({ title: groupName });

  if (existingGroups.length > 0) {
    const groupId = existingGroups[0].id;
    await chrome.tabs.group({ tabIds: tabs, groupId });
    await applyGroupStyle(groupId, groupName, color);
  } else {
    const groupId = await chrome.tabs.group({ tabIds: tabs });
    await applyGroupStyle(groupId, groupName, color);
    await chrome.tabGroups.update(groupId, { collapsed: true });
  }
}
