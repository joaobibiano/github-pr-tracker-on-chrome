document.addEventListener('DOMContentLoaded', async () => {
  const { githubToken, maxAgeDays = 30 } = await chrome.storage.local.get(['githubToken', 'maxAgeDays']);
  if (githubToken) {
    document.getElementById('token').value = githubToken;
  }
  document.getElementById('maxAge').value = maxAgeDays;
});

document.getElementById('save').addEventListener('click', async () => {
  const token = document.getElementById('token').value.trim();
  const maxAge = parseInt(document.getElementById('maxAge').value, 10) || 30;

  if (!token) {
    showStatus('Please enter a token', 'error');
    return;
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }

    await chrome.storage.local.set({ githubToken: token, maxAgeDays: maxAge });
    chrome.runtime.sendMessage({ action: 'checkNow' });
    showStatus('Settings saved successfully!', 'success');
  } catch (error) {
    showStatus('Invalid token. Please check and try again.', 'error');
  }
});

function showStatus(message, type) {
  const status = document.getElementById('status');
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
}
