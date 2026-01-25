export async function fetchAllPRs(token, showOthersDrafts) {
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
