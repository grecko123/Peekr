# Peekr

Browser extension that displays text files directly in the browser instead of downloading them.

## Features

- Intercepts downloads of code and config files (.py, .js, .json, .yaml, .log, .sh, etc.)
- Opens files in a built-in syntax-highlighted viewer
- Configurable file extension list
- Supports Chrome (MV3) and Firefox (MV2)

## Installation

### Chrome Web Store / Firefox Add-ons
- **Firefox**: [Peekr on Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/peekr/)
- **Chrome**: *Coming soon*

### Manual Installation

**Chrome:**
1. Run `npm run build`
2. Go to `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/chrome` folder

**Firefox:**
1. Run `npm run build`
2. Go to `about:debugging`
3. Click "This Firefox"
4. Click "Load Temporary Add-on"
5. Select `dist/firefox/manifest.json`

## Building

```bash
# Build both extensions
npm run build

# Build and create zip files for distribution
npm run build:zip

# Clean build output
npm run clean
```

Output:
- `dist/chrome/` - Chrome extension
- `dist/firefox/` - Firefox extension
- `dist/peekr-chrome.zip` - Chrome package (with --zip)
- `dist/peekr-firefox.zip` - Firefox package (with --zip)

## Configuration

Click the Peekr icon in your browser toolbar to:
- Enable/disable the extension
- Customize which file extensions to intercept

Default extensions include: txt, log, sh, py, js, ts, json, yaml, yml, md, css, c, cpp, go, rs, rb, php, sql, csv, and more.

## How It Works

- **Chrome**: Uses the Downloads API to intercept file downloads before they complete
- **Firefox**: Uses webRequest API to redirect matching responses to the built-in viewer

## Project Structure

```
peekr/
├── src/
│   ├── shared/         # Shared constants and utilities
│   ├── chrome/         # Chrome MV3 manifest and background
│   └── firefox/        # Firefox MV2 manifest and background
├── icons/              # Extension icons
├── viewer/             # Built-in file viewer
├── popup.html/js       # Extension popup UI
├── options.html/js     # Options page (Firefox)
├── scripts/build.js    # Build script
└── dist/               # Built extensions (generated)
```

## License

MIT

## Support

- [Ko-fi](https://ko-fi.com/rom12two)
- BTC: `1N19qKsCEQW4afSbAbM6vtVUZvWZDgRWXF`
- ETH: `0x80D870e56AAF468545471f7Ac92AEbc493FBF6B1`
- XMR: `49xjr7jRLswMrJ47SnvQsR8xvKM13gv1BiWxJM8JtxQhEfhwM64hXJFin5DvsUAp2QQ3dGzZFoCoa8HYe1oiJS1BBDQPP7C`
