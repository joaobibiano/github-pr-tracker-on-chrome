# Contributing to GitHub PR Review Tracker

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. Fork and clone the repository
2. Load the extension in Chrome:
   - Navigate to `chrome://extensions`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

No build tools or dependencies required - the extension uses vanilla JavaScript.

## Code Style

- Use ES modules (`import`/`export`)
- Use `const` by default, `let` when reassignment is needed
- Use async/await for asynchronous code
- Use JSDoc comments for function documentation (see `src/shared/types.js`)
- Keep functions focused and single-purpose

## Project Architecture

```
src/
├── background/          # Service worker (runs in background)
│   ├── index.js         # Entry point, event listeners
│   ├── github-api.js    # GitHub API interactions
│   ├── tab-manager.js   # Chrome tab/group management
│   └── storage.js       # Chrome storage helpers
├── popup/               # Browser action popup (click on icon)
├── options/             # Extension settings page
└── shared/              # Code shared across contexts
    ├── constants.js     # Configuration values
    ├── utils.js         # Helper functions
    └── types.js         # JSDoc type definitions
```

### Key Concepts

- **Service Worker**: Background script that runs periodically to check PRs
- **Chrome Storage**: Used for persisting settings and PR data
- **Tab Groups**: Chrome API for organizing tabs into collapsible groups

## Making Changes

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Test manually by reloading the extension
4. Commit with a clear message describing the change
5. Push and create a Pull Request

## Testing Changes

After making changes:

1. Go to `chrome://extensions`
2. Click the refresh icon on "GitHub PR Review Tracker"
3. Test the specific functionality you changed:
   - **Background changes**: Check if PRs are fetched (look at badge)
   - **Popup changes**: Click the extension icon
   - **Options changes**: Right-click icon → Options
4. Check the console for errors:
   - Service worker: Click "service worker" link on extension card
   - Popup: Right-click popup → Inspect
   - Options: Right-click options page → Inspect

## Pull Request Guidelines

- Keep PRs focused on a single change
- Update documentation if adding new features
- Test your changes before submitting
- Describe what the PR does and why

## Reporting Issues

When reporting bugs, please include:

- Chrome version
- Steps to reproduce
- Expected vs actual behavior
- Console errors (if any)

## Questions?

Open an issue for questions or discussions about the project.
