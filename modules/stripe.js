async function runAutofill() {
  const result = await chrome.storage.sync.get([
    "autofillProfiles",
    "activeProfileName",
  ]);
  const profiles = result.autofillProfiles;
  const activeProfileName = result.activeProfileName;

  if (!profiles || !activeProfileName || !profiles[activeProfileName]) return;

  const details = profiles[activeProfileName];
  const customToggleOn = details.customToggleOn || false;

  const firstName = details.firstName;
  const lastName = customToggleOn ? details.lastName : generateRandomName();
  const fullName = `${firstName} ${lastName}`;

  waitForElement("input[id='cardNumber']", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    selector.focus();
    fillInput(selector, details.cardNumber);
  });

  waitForElement("input[id='cardExpiry']", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    selector.focus();
    fillInput(selector, `${details.cardExpiryMonth}/${details.cardExpiryYear}`);
  });

  waitForElement("input[id='cardCvc']", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    selector.focus();
    fillInput(selector, details.cardCvv);
  });

  waitForElement("input[id='billingName']", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    selector.focus();
    fillInput(selector, fullName);
  });

  chrome.storage.sync.get("toPayEnabled", (result) => {
    const toPayEnabled =
      result.toPayEnabled !== undefined ? result.toPayEnabled : true;

    if (toPayEnabled)
      waitForElement(
        "button[data-testid='hosted-payment-submit-button']",
        async (selector) => {
          await new Promise((resolve) => setTimeout(resolve, 300));
          selector.click();
        },
      );
  });
}

runAutofill();
