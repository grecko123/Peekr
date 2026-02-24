import { DEFAULT_EXTENSIONS } from './constants.js';

// Get browser API (works with webextension-polyfill or native)
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Load settings or use defaults
export async function getSettings() {
  const result = await browserAPI.storage.sync.get({
    enabled: true,
    extensions: DEFAULT_EXTENSIONS
  });
  return result;
}

// Save settings
export async function saveSettings(settings) {
  await browserAPI.storage.sync.set(settings);
  return { success: true };
}

export { DEFAULT_EXTENSIONS };
