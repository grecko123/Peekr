// Chrome MV3 Background Service Worker
import { DEFAULT_EXTENSIONS } from '../shared/constants.js';
import { getSettings, saveSettings } from '../shared/settings.js';
import { shouldIntercept, getExtension, buildViewerUrl } from '../shared/utils.js';

// Listen for download events (Chrome MV3 approach)
chrome.downloads.onDeterminingFilename.addListener(async (downloadItem, suggest) => {
  const settings = await getSettings();

  if (!settings.enabled) {
    return;
  }

  const url = downloadItem.url;
  const filename = downloadItem.filename.toLowerCase();

  // Check by URL or filename
  const urlShouldIntercept = shouldIntercept(url, null, null, settings.extensions);
  const ext = getExtension(filename);
  const fileShouldIntercept = ext && settings.extensions.includes(ext);

  // Check MIME type for text files
  const isTextMime = downloadItem.mime && (
    downloadItem.mime.startsWith('text/') ||
    downloadItem.mime === 'application/json' ||
    downloadItem.mime === 'application/xml' ||
    downloadItem.mime === 'application/javascript' ||
    downloadItem.mime === 'application/x-sh'
  );

  if (urlShouldIntercept || fileShouldIntercept || (isTextMime && ext)) {
    // Cancel the download and open in viewer
    chrome.downloads.cancel(downloadItem.id);

    // Open the file in our viewer
    const viewerUrl = buildViewerUrl(
      chrome.runtime.getURL('viewer/viewer.html'),
      url,
      downloadItem.filename
    );

    chrome.tabs.create({ url: viewerUrl });
  }
});

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getSettings') {
    getSettings().then(sendResponse);
    return true;
  }

  if (message.type === 'saveSettings') {
    saveSettings(message.settings).then(sendResponse);
    return true;
  }

  if (message.type === 'getDefaultExtensions') {
    sendResponse(DEFAULT_EXTENSIONS);
    return true;
  }
});
