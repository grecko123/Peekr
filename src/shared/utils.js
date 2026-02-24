import { TEXT_MIME_TYPES } from './constants.js';

// Get file extension from URL or filename
export function getExtension(str) {
  if (!str) return '';
  const clean = str.split('?')[0].split('#')[0].toLowerCase();
  const lastDot = clean.lastIndexOf('.');
  if (lastDot === -1) return '';
  return clean.substring(lastDot + 1);
}

// Check if extension should be intercepted
export function shouldIntercept(url, filename, contentType, extensions) {
  // Check URL extension
  const urlExt = getExtension(url);
  if (urlExt && extensions.includes(urlExt)) {
    return true;
  }

  // Check filename from Content-Disposition
  if (filename) {
    const fileExt = getExtension(filename);
    if (fileExt && extensions.includes(fileExt)) {
      return true;
    }
  }

  // Check content type
  if (contentType) {
    if (TEXT_MIME_TYPES.some(t => contentType.startsWith(t))) {
      // Only if we have a matching extension
      return urlExt && extensions.includes(urlExt);
    }
  }

  return false;
}

// Parse Content-Disposition header for filename
export function parseContentDisposition(header) {
  if (!header) return null;

  const isDownload = header.toLowerCase().includes('attachment');
  let filename = null;

  // Try filename*= (RFC 5987)
  const filenameStarMatch = header.match(/filename\*\s*=\s*(?:utf-8''|UTF-8'')([^;\s]+)/i);
  if (filenameStarMatch) {
    filename = decodeURIComponent(filenameStarMatch[1]);
  }

  // Try filename=
  if (!filename) {
    const filenameMatch = header.match(/filename\s*=\s*"?([^";\n]+)"?/i);
    if (filenameMatch) {
      filename = filenameMatch[1].trim();
    }
  }

  return { isDownload, filename };
}

// Build viewer URL
export function buildViewerUrl(baseUrl, fileUrl, filename) {
  return baseUrl + '?url=' + encodeURIComponent(fileUrl) + '&filename=' + encodeURIComponent(filename);
}
