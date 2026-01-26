import { GROUP_MY_PRS, GROUP_REVIEW_REQUESTS } from '../shared/constants.js';
import { normalizeUrl } from '../shared/utils.js';

export async function getOpenPRUrls() {
  const urls = new Set();

  for (const groupName of [GROUP_MY_PRS, GROUP_REVIEW_REQUESTS]) {
    const groups = await chrome.tabGroups.query({ title: groupName });
    if (groups.length === 0) continue;

    const tabs = await chrome.tabs.query({ groupId: groups[0].id });
    for (const tab of tabs) {
      if (tab.url) {
        urls.add(normalizeUrl(tab.url));
      }
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
      if (!tab.url) return false;
      return !openUrlSet.has(normalizeUrl(tab.url));
    });

    if (tabsToClose.length > 0) {
      await chrome.tabs.remove(tabsToClose.map(t => t.id));
    }
  }
}

export async function addPRsToTabGroup(prs, groupName, color) {
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
