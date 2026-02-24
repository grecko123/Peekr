// Firefox MV2 Background Script
// Note: Firefox doesn't support ES modules in background scripts for MV2
// This file will be bundled by the build script

const DEFAULT_EXTENSIONS = [
  'txt', 'log', 'sh', 'bash', 'zsh',
  'py', 'js', 'ts', 'jsx', 'tsx',
  'json', 'xml', 'yaml', 'yml', 'toml',
  'md', 'markdown', 'rst',
  'css', 'scss', 'sass', 'less',
  'svg',
  'c', 'cpp', 'h', 'hpp', 'cc',
  'java', 'kt', 'scala',
  'go', 'rs', 'rb', 'php',
  'sql', 'graphql', 'gql',
  'ini', 'conf', 'cfg', 'config',
  'env', 'gitignore', 'dockerignore',
  'makefile', 'cmake',
  'csv', 'tsv'
];

const TEXT_MIME_TYPES = [
  'text/plain',
  'text/x-python',
  'text/x-sh',
  'application/json',
  'application/xml',
  'application/javascript',
  'text/javascript',
  'text/css',
  'text/csv',
  'application/x-sh'
];

// Load settings or use defaults
async function getSettings() {
  const result = await browser.storage.sync.get({
    enabled: true,
    extensions: DEFAULT_EXTENSIONS
  });
  return result;
}

// Get file extension from URL or filename
function getExtension(str) {
  if (!str) return '';
  const clean = str.split('?')[0].split('#')[0].toLowerCase();
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return '';
  return clean.substring(lastDot + 1);
}

// Check if extension should be intercepted
function shouldIntercept(url, filename, contentType, extensions) {
  const urlExt = getExtension(url);
  if (urlExt && extensions.includes(urlExt)) {
    return true;
  }

  if (filename) {
    const fileExt = getExtension(filename);
    if (fileExt && extensions.includes(fileExt)) {
      return true;
    }
  }

  if (contentType) {
    if (TEXT_MIME_TYPES.some(t => contentType.startsWith(t))) {
      return urlExt && extensions.includes(urlExt);
    }
  }

  return false;
}

// Parse Content-Disposition header for filename
function parseContentDisposition(header) {
  if (!header) return null;

  const isDownload = header.toLowerCase().includes('attachment');
  let filename = null;

  const filenameStarMatch = header.match(/filename\*\s*=\s*(?:utf-8''|UTF-8'')([^;\s]+)/i);
  if (filenameStarMatch) {
    filename = decodeURIComponent(filenameStarMatch[1]);
  }

  if (!filename) {
    const filenameMatch = header.match(/filename\s*=\s*"?([^";\n]+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1].trim();
    }
  }

  return { isDownload, filename };
}

// Build viewer URL
function buildViewerUrl(fileUrl, filename) {
  return browser.runtime.getURL('viewer/viewer.html') +
    '?url=' + encodeURIComponent(fileUrl) +
    '&filename=' + encodeURIComponent(filename);
}

// Intercept responses with Content-Disposition: attachment
browser.webRequest.onHeadersReceived.addListener(
  async function(details) {
    if (details.type !== 'main_frame') {
      return {};
    }

    const settings = await getSettings();
    if (!settings.enabled) {
      return {};
    }

    let contentDisposition = null;
    let contentType = null;

    for (const header of details.responseHeaders) {
      const name = header.name.toLowerCase();
      if (name === 'content-disposition') {
        contentDisposition = header.value;
      } else if (name === 'content-type') {
        contentType = header.value;
      }
    }

    const disposition = parseContentDisposition(contentDisposition);
    const filename = disposition?.filename || details.url.split('/').pop().split('?')[0];

    if (shouldIntercept(details.url, filename, contentType, settings.extensions)) {
      return { redirectUrl: buildViewerUrl(details.url, filename) };
    }

    return {};
  },
  { urls: ['<all_urls>'] },
  ['blocking', 'responseHeaders']
);

// Also intercept downloads
browser.downloads.onCreated.addListener(async function(downloadItem) {
  const settings = await getSettings();
  if (!settings.enabled) {
    return;
  }

  const url = downloadItem.url;
  const filename = downloadItem.filename || url.split('/').pop().split('?')[0];

  if (shouldIntercept(url, filename, downloadItem.mime, settings.extensions)) {
    browser.downloads.cancel(downloadItem.id);
    browser.downloads.erase({ id: downloadItem.id });
    browser.tabs.create({ url: buildViewerUrl(url, filename) });
  }
});

// Handle messages from popup
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    return getSettings();
  }

  if (message.type === 'saveSettings') {
    return browser.storage.sync.set(message.settings).then(() => ({ success: true }));
  }

  if (message.type === 'getDefaultExtensions') {
    return Promise.resolve(DEFAULT_EXTENSIONS);
  }
});
