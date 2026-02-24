// Browser API polyfill - use browser.* if available, fall back to chrome.*
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const enabledCheckbox = document.getElementById('enabled');
const extensionsTextarea = document.getElementById('extensions');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const status = document.getElementById('status');

let defaultExtensions = [];

// Load current settings
async function loadSettings() {
  try {
    const response = await browserAPI.runtime.sendMessage({ type: 'getSettings' });
    enabledCheckbox.checked = response.enabled;
    extensionsTextarea.value = response.extensions.join('\n');

    // Get defaults
    defaultExtensions = await browserAPI.runtime.sendMessage({ type: 'getDefaultExtensions' });
  } catch (err) {
    console.error('Failed to load settings:', err);
    showStatus('Error loading settings');
  }
}

// Save settings
saveBtn.addEventListener('click', async () => {
  const extensions = extensionsTextarea.value
    .split('\n')
    .map(ext => ext.trim().toLowerCase().replace(/^\./, ''))
    .filter(ext => ext.length > 0);

  await browserAPI.runtime.sendMessage({
    type: 'saveSettings',
    settings: {
      enabled: enabledCheckbox.checked,
      extensions: extensions
    }
  });

  showStatus('Settings saved!');
});

// Reset to defaults
resetBtn.addEventListener('click', () => {
  extensionsTextarea.value = defaultExtensions.join('\n');
  showStatus('Reset to defaults. Click Save to apply.');
});

function showStatus(message) {
  status.textContent = message;
  status.classList.add('visible');
  setTimeout(() => status.classList.remove('visible'), 2000);
}

loadSettings();

// Donate buttons - copy address to clipboard
document.querySelectorAll('.donate-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    const address = btn.dataset.address;
    if (!address) return; // Ko-fi link, handled by href

    const donateStatus = document.getElementById('donateStatus');
    try {
      await navigator.clipboard.writeText(address);
      donateStatus.textContent = `${btn.textContent} address copied!`;
      setTimeout(() => donateStatus.textContent = '', 2000);
    } catch {
      donateStatus.textContent = 'Failed to copy';
    }
  });
});
