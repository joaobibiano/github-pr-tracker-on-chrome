export function formatTimeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function normalizeUrl(url) {
  const withoutQueryOrHash = url.split('?')[0].split('#')[0];

  const pullRequestMatch = withoutQueryOrHash.match(/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+/);
  if (pullRequestMatch) {
    return pullRequestMatch[0];
  }

  return withoutQueryOrHash;
}
