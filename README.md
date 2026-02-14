# GitHub PR Review Tracker

A Chrome extension that tracks GitHub pull requests awaiting your review and organizes them in tab groups.

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=googlechrome&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-green)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- **Automatic PR Detection** - Polls GitHub every 3 minutes for PRs requiring your review
- **Smart Tab Groups** - Automatically creates and organizes tabs into "My PRs" and "Review Requests" groups
- **Badge Counter** - Shows the total number of active PRs at a glance
- **Configurable Age Filter** - Hide old PRs beyond a configurable age (default: 30 days)
- **Draft PR Control** - Option to show or hide draft PRs from others

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory

## Configuration

1. Click the extension icon and select "Settings" (or right-click → Options)
2. Enter your GitHub Personal Access Token
3. Configure optional settings:
   - **Max PR Age** - PRs older than this will be hidden (default: 30 days)
   - **Show draft PRs from others** - Include or exclude others' draft PRs

### Creating a GitHub Token

1. Go to [GitHub Settings → Developer settings → Personal access tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "PR Review Tracker")
4. Select the `repo` scope
5. Click "Generate token" and copy it to the extension settings

## How It Works

1. The extension runs a background service worker that checks GitHub every 3 minutes
2. It queries GitHub's search API for:
   - PRs you authored (`is:pr author:@me is:open`)
   - PRs where your review is requested (`is:pr user-review-requested:@me is:open`)
3. New PRs are opened in collapsed tab groups:
   - **My PRs** (blue) - PRs you created
   - **Review Requests** (purple) - PRs awaiting your review
4. The badge shows the total count of active PRs

## Project Structure

```
github-pr-reviewer-extension/
├── src/
│   ├── background/      # Service worker modules
│   │   ├── index.js     # Event listeners, orchestration
│   │   ├── github-api.js    # GitHub API calls
│   │   ├── tab-manager.js   # Tab grouping logic
│   │   └── storage.js       # Chrome storage helpers
│   ├── popup/           # Browser action popup
│   │   ├── popup.html
│   │   ├── popup.js
│   │   └── popup.css
│   ├── options/         # Extension options page
│   │   ├── options.html
│   │   ├── options.js
│   │   └── options.css
│   └── shared/          # Shared utilities
│       ├── constants.js
│       ├── utils.js
│       └── types.js
├── icons/               # Extension icons
├── manifest.json
└── README.md
```

## Development

No build step required! The extension uses vanilla JavaScript with ES modules.

Run the regression check for PR URL normalization when touching tab dedupe logic:

```bash
node test-normalize-url.js
```

1. Make changes to files in `src/`
2. Go to `chrome://extensions`
3. Click the refresh icon on the extension card
4. Test your changes

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed contribution guidelines.

## Privacy

This extension:
- Only communicates with GitHub's API
- Stores your token locally in Chrome's extension storage
- Does not collect or transmit any personal data
- Does not track usage or analytics

## License

MIT License - see [LICENSE](LICENSE) for details.
