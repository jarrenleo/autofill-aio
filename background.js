const allowedUrlPatterns = [
  /^https:\/\/.*\.bigtix\.io\/checkout\/patron/,
  /^https:\/\/.*\.bigtix\.io\/checkout\/payment/,
  /^https:\/\/.*\.bookmyshow\.com\/checkout\/patron/,
  /^https:\/\/.*\.bookmyshow\.com\/checkout\/payment/,
  /^https:\/\/.*\.reddotpayment\.com\/link\/payment\/.*/,
];

function findUrlPatternIndex(url) {
  if (!url) return -1;

  return allowedUrlPatterns.findIndex((pattern) => pattern.test(url));
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  const urlPatternIndex = findUrlPatternIndex(tab.url);

  if (
    changeInfo.status !== "complete" ||
    typeof tab.url !== "string" ||
    urlPatternIndex === -1
  )
    return;

  if (urlPatternIndex === 4) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["utils/names_array.js", "modules/reddot.js", "content.js"],
    });
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ["utils/names_array.js", "modules/bigtix.js", "content.js"],
  });
});

// Listener for messages from content script
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "screenshot") {
    chrome.tabs.captureVisibleTab(
      sender.tab.windowId,
      { format: "jpeg" },
      (dataUrl) => {
        chrome.downloads.download({
          url: dataUrl,
          filename: `screenshot_${Date.now()}.jpeg`,
          saveAs: false,
        });
      }
    );
  }
});
