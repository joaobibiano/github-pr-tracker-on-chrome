/**
 * @typedef {Object} PullRequest
 * @property {string} html_url - The URL to the PR on GitHub
 * @property {string} title - The PR title
 * @property {string} created_at - ISO 8601 timestamp of PR creation
 * @property {string} updated_at - ISO 8601 timestamp of last update
 * @property {number} number - The PR number
 * @property {Object} user - The PR author
 * @property {string} user.login - Author's GitHub username
 * @property {boolean} draft - Whether the PR is a draft
 */

/**
 * @typedef {Object} ExtensionSettings
 * @property {string} [githubToken] - GitHub Personal Access Token
 * @property {number} [maxAgeDays] - Maximum age of PRs to show (default: 30)
 * @property {boolean} [showOthersDrafts] - Whether to show draft PRs from others
 * @property {string[]} [excludedRepos] - Repos (owner/repo) the user has excluded from tracking
 * @property {string[]} [discoveredRepos] - Repos (owner/repo) seen from fetched PRs
 */

/**
 * @typedef {Object} StoredData
 * @property {PullRequest[]} [currentPRs] - Currently tracked PRs
 * @property {number} [lastCheck] - Timestamp of last PR check
 */

/**
 * @typedef {Object} FetchedPRs
 * @property {PullRequest[]} myPRs - PRs authored by the user
 * @property {PullRequest[]} reviewRequests - PRs where user's review is requested
 */

export {};
