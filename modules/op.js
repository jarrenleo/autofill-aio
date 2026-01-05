async function runAutofill() {
  const result = await chrome.storage.sync.get([
    "autofillProfiles",
    "activeProfileName",
  ]);
  const profiles = result.autofillProfiles;
  const activeProfileName = result.activeProfileName;

  if (!profiles || !activeProfileName || !profiles[activeProfileName]) return;

  const details = profiles[activeProfileName];

  waitForElement("input[id='cardnumber']", (selector) => {
    selector.focus();
    fillInput(selector, details.cardNumber);
  });

  waitForElement("input[id='cvv']", (selector) => {
    selector.focus();
    fillInput(selector, details.cardCvv);
  });

  waitForElement("input[id='monthyear']", (selector) => {
    selector.focus();
    fillInput(selector, `${details.cardExpiryMonth}/${details.cardExpiryYear}`);
  });

  waitForElement("input[id='terms']", (selector) => {
    selector.click();
  });

  chrome.storage.sync.get("toPayEnabled", (result) => {
    const toPayEnabled =
      result.toPayEnabled !== undefined ? result.toPayEnabled : true;

    if (toPayEnabled)
      waitForElement("button[id='pay']", (selector) => selector.click());
  });
}

runAutofill();
