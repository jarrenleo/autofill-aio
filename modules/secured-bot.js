(function () {
  if (window.__securedBotAutofillLoaded) return;
  window.__securedBotAutofillLoaded = true;

async function runAutofill() {
  const result = await chrome.storage.sync.get([
    "autofillProfiles",
    "activeProfileName",
  ]);
  const profiles = result.autofillProfiles;
  const activeProfileName = result.activeProfileName;

  if (!profiles || !activeProfileName || !profiles[activeProfileName]) return;

  const details = profiles[activeProfileName];

  waitForElement("label[for='card']", async (selector) => {
    selector.click();

    waitForElement("input[id='card-number']", (selector) => {
      selector.focus();
      fillInput(selector, details.cardNumber);
    });

    waitForElement("input[id='card-exp-data']", (selector) => {
      selector.focus();
      fillInput(selector, `${details.cardExpiryMonth}/${details.cardExpiryYear}`);
    });

    waitForElement("input[id='card-cvv']", (selector) => {
      selector.focus();
      fillInput(selector, details.cardCvv);
    });

    chrome.storage.sync.get("toPayEnabled", (result) => {
      const toPayEnabled =
        result.toPayEnabled !== undefined ? result.toPayEnabled : true;
  
      if (toPayEnabled)
        waitForElement("button[id='pay-button']", async (selector) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          selector.click();
        });
    });
  });
}

runAutofill();

})();