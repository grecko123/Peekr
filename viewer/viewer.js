// Parse URL parameters
const params = new URLSearchParams(window.location.search);
const fileUrl = params.get('url');
const filename = params.get('filename') || 'Unknown file';

let fileContent = '';

// Update filename display
document.getElementById('filename').textContent = filename;
document.title = filename + ' - File Viewer';

// Fetch and display the file
async function loadFile() {
  const contentEl = document.getElementById('content');
  const lineNumbersEl = document.getElementById('lineNumbers');

  if (!fileUrl) {
    contentEl.innerHTML = '<span class="error">No file URL provided</span>';
    return;
  }

  try {
    const response = await fetch(fileUrl);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    fileContent = await response.text();

    // Display content
    contentEl.textContent = fileContent;

    // Generate line numbers
    const lines = fileContent.split('\n');
    lineNumbersEl.innerHTML = lines
      .map((_, i) => i + 1)
      .join('\n');

  } catch (error) {
    contentEl.innerHTML = `<span class="error">Failed to load file: ${escapeHtml(error.message)}</span>`;
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Copy button
document.getElementById('copyBtn').addEventListener('click', async () => {
  const btn = document.getElementById('copyBtn');
  try {
    await navigator.clipboard.writeText(fileContent);
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  } catch {
    btn.textContent = 'Failed';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  }
});

// Download button
document.getElementById('downloadBtn').addEventListener('click', () => {
  const blob = new Blob([fileContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
});

// Wrap toggle
let wrapEnabled = true;
document.getElementById('wrapBtn').addEventListener('click', () => {
  const contentEl = document.getElementById('content');
  wrapEnabled = !wrapEnabled;
  contentEl.classList.toggle('no-wrap', !wrapEnabled);
});

// Theme toggle
let darkTheme = true;
document.getElementById('themeBtn').addEventListener('click', () => {
  darkTheme = !darkTheme;
  document.body.classList.toggle('light', !darkTheme);
  document.getElementById('themeBtn').textContent = darkTheme ? 'Light Theme' : 'Dark Theme';
});

// View raw
document.getElementById('rawBtn').addEventListener('click', () => {
  window.location.href = fileUrl;
});

// Zoom controls
let fontSize = 16;
const MIN_FONT = 10;
const MAX_FONT = 32;

function updateFontSize() {
  document.body.style.fontSize = fontSize + 'px';
}

document.getElementById('zoomInBtn').addEventListener('click', () => {
  if (fontSize < MAX_FONT) {
    fontSize += 2;
    updateFontSize();
  }
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
  if (fontSize > MIN_FONT) {
    fontSize -= 2;
    updateFontSize();
  }
});

// Load the file
loadFile();
