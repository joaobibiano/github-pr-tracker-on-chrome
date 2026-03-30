# GitHub PR Review Tracker

A Chrome extension that keeps your open GitHub pull requests and your review requests visible by opening them into Chrome tab groups.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- Polls GitHub every 3 minutes, on browser startup, and when you click refresh in the popup
- Tracks two PR buckets:
  - **My PRs**: open pull requests authored by you
  - **Review Requests**: open pull requests where your review is requested
- Opens newly discovered PRs into Chrome tab groups named `My PRs` and `Review Requests`
- Reuses existing groups and avoids opening duplicate tabs, including GitHub PR sub-pages such as `/files`
- Closes stale tabs from managed groups when those PRs are no longer returned by GitHub, while leaving the active tab alone
- Shows the total tracked PR count in the extension badge and popup
- Lets you configure a max PR age, include or exclude draft PRs from other authors, and exclude specific repositories from tracking

## Installation

1. Clone or download this repository.
2. Open `chrome://extensions` in Chrome.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this project directory.

## Configuration

1. Open the extension popup.
2. Click **Settings**.
3. Paste a GitHub personal access token.
4. Optionally adjust:
   - `Max PR Age (days)` to hide older pull requests
   - `Show draft PRs from others` to include or exclude draft review requests
   - Repository checkboxes to stop tracking specific repos after the extension has discovered them

The settings page validates the token before saving it and immediately triggers a fresh sync.

### Creating a GitHub Token

1. Go to [GitHub Settings -> Developer settings -> Personal access tokens](https://github.com/settings/tokens).
2. Create a classic token.
3. Give it a descriptive name such as `PR Review Tracker`.
4. Grant the `repo` scope.
5. Copy the token into the extension settings page.

## How It Works

1. The background service worker runs on install, on startup, and on a repeating Chrome alarm.
2. It queries GitHub's search API for:
   - `is:open is:pr author:@me`
   - `is:open is:pr user-review-requested:@me`
   - When `Show draft PRs from others` is off, review requests are filtered with `draft:false`
3. Results are filtered by max age and by any repositories you excluded in settings.
4. The extension stores the current PR list, last check time, and discovered repositories in `chrome.storage.local`.
5. New PRs are added to tab groups with these colors:
   - `My PRs` in blue
   - `Review Requests` in purple
   - Newly created groups are collapsed, and existing groups are reused
6. The popup shows the current tracked count and how long ago the last sync ran.
7. If no token is configured or the GitHub request fails, the badge switches to `!`.

## Project Structure

```text
github-pr-reviewer-extension/
├── src/
│   ├── background/
│   │   ├── index.js        # Alarm wiring and sync orchestration
│   │   ├── github-api.js   # GitHub search requests
│   │   ├── tab-manager.js  # Tab lookup, grouping, and cleanup
│   │   └── storage.js      # chrome.storage helpers
│   ├── options/
│   │   ├── options.html
│   │   ├── options.css
│   │   └── options.js
│   ├── popup/
│   │   ├── popup.html
│   │   ├── popup.css
│   │   └── popup.js
│   └── shared/
│       ├── constants.js
│       ├── types.js
│       └── utils.js
├── icons/
├── manifest.json
├── test-normalize-url.js   # Regression check for PR URL normalization
├── CONTRIBUTING.md
└── README.md
```

## Development

There is no build step or package install. The extension is plain JavaScript with ES modules.

For code changes:

1. Edit files under `src/`.
2. Reload the extension from `chrome://extensions`.
3. Test the relevant surface:
   - service worker changes from the extension card's service worker inspector
   - popup changes from the browser action popup
   - settings changes from the options page

Run the URL normalization regression check when touching PR tab dedupe behavior:

```bash
node test-normalize-url.js
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidance.

## Privacy

This extension:

- Only makes read requests to GitHub's API
- Stores the GitHub token and extension state locally in `chrome.storage.local`
- Does not send analytics or usage telemetry anywhere else

## License

MIT. See [LICENSE](LICENSE).
