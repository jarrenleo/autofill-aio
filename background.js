const allowedUrlPatterns = [
  /^https:\/\/.*\.bigtix\.io\/booking\/.*/,
  /^https:\/\/.*\.bigtix\.io\/checkout/,
  /^https:\/\/.*\.bigtix\.io\/checkout\/patron/,
  /^https:\/\/.*\.bigtix\.io\/checkout\/payment/,
  /^https:\/\/.*\.bookmyshow\.com\/booking\/.*/,
  /^https:\/\/.*\.bookmyshow\.com\/checkout/,
  /^https:\/\/.*\.bookmyshow\.com\/checkout\/patron/,
  /^https:\/\/.*\.bookmyshow\.com\/checkout\/payment/,
  /^https:\/\/.*\.reddotpayment\.com\/link\/payment\/.*/,
  /^https:\/\/pgw-ui\.2c2p\.com\/payment\/.*/,
  /^https:\/\/.*\.ticket2u\.com\.my\/cartv2\/.*/,
  /^https:\/\/.*\.onlinepayment\.com\.my\/.*/,
  /^https:\/\/.*\.sistic\.com\.sg\/sistic\/confirm\/shoppingcart/,
  /^https:\/\/checkout\.stripe\.com\/c\/pay\/.*/,
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

  switch (urlPatternIndex) {
    case 8:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/names_array.js", "utils/helper.js", "modules/reddot.js"],
      });
      break;
    case 9:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/names_array.js", "utils/helper.js", "modules/pgw.js"],
      });
      break;
    case 10:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/names_array.js", "utils/helper.js", "modules/t2u.js"],
      });
      break;
    case 11:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/names_array.js", "utils/helper.js", "modules/op.js"],
      });
      break;
    case 12:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/helper.js", "modules/sistic.js"],
      });
      break;
    case 13:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["utils/names_array.js", "utils/helper.js", "modules/stripe.js"],
      });
      break;
    default:
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [
          "utils/names_array.js",
          "utils/helper.js",
          "modules/bms.js",
          "modules/bigtix.js",
        ],
      });
  }
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
