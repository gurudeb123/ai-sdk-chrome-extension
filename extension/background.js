/**
 * Background Service Worker
 * Handles extension icon clicks and manages tab injection state
 */

const BLOCKED_DOMAINS = [
  'github.com',
  'google.com',
  'youtube.com',
  'twitter.com',
  'x.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'reddit.com',
  'gmail.com',
  'outlook.com',
  'netflix.com',
  'spotify.com',
  'amazon.com',
  'ebay.com'
];

const TOGGLE_EVENT = 'page-summarizer-toggle';

// Track injection state per tab
const injectedTabs = new Set();

/**
 * Check if a domain is blocked
 */
function isDomainBlocked(hostname) {
  const domain = hostname.replace('www.', '');
  return BLOCKED_DOMAINS.some(blockedDomain => domain.includes(blockedDomain));
}

/**
 * Check if URL protocol is supported
 */
function isProtocolSupported(url) {
  return url.protocol.startsWith('http');
}

/**
 * Inject required files into tab
 */
async function injectFiles(tabId) {
  await chrome.scripting.insertCSS({
    target: { tabId },
    files: ['styles.css']
  });

  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['content.js']
  });

  injectedTabs.add(tabId);
}

/**
 * Toggle extension visibility in tab
 */
async function toggleExtension(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (eventName) => {
      window.dispatchEvent(new CustomEvent(eventName));
    },
    args: [TOGGLE_EVENT]
  });
}

/**
 * Handle extension icon click
 */
chrome.action.onClicked.addListener(async (tab) => {
  try {
    const url = new URL(tab.url);

    // Validate domain
    if (isDomainBlocked(url.hostname)) {
      console.log(`Page Summarizer: Disabled on ${url.hostname}`);
      return;
    }

    // Validate protocol
    if (!isProtocolSupported(url)) {
      console.log(`Page Summarizer: Cannot run on ${url.protocol} pages`);
      return;
    }

    // Inject or toggle
    if (!injectedTabs.has(tab.id)) {
      await injectFiles(tab.id);
    } else {
      await toggleExtension(tab.id);
    }

  } catch (error) {
    console.error('Failed to activate extension:', error);
  }
});

/**
 * Clean up when tabs are closed
 */
chrome.tabs.onRemoved.addListener((tabId) => {
  injectedTabs.delete(tabId);
});

/**
 * Clean up when tabs navigate
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    injectedTabs.delete(tabId);
  }
});