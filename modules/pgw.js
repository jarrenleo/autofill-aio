function formatCardNumber(cardNumber) {
  // Remove any existing dashes or spaces
  const cleanNumber = cardNumber.replace(/[-\s]/g, "");
  // Add dash every 4 digits
  return cleanNumber.match(/.{1,4}/g)?.join("-") || cleanNumber;
}

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
  const email = customToggleOn
    ? details.email
    : `${fullName.split(" ").join(".").toLowerCase()}.${generateRandomLetters(
        5,
      )}${generateRandomNumbers(5)}@sagimail.com`;

  waitForElement("input[id='tel-cardNumber']", (selector) => {
    selector.focus();
    fillInput(selector, formatCardNumber(details.cardNumber));
  });

  waitForElement("input[id='expyear']", (selector) => {
    selector.focus();
    fillInput(selector, `${details.cardExpiryMonth}/${details.cardExpiryYear}`);
  });

  waitForElement("input[id='tel-cvv']", (selector) => {
    selector.focus();
    fillInput(selector, details.cardCvv);
  });

  waitForElement("input[id='name']", (selector) => {
    selector.focus();
    fillInput(selector, fullName);
  });

  waitForElement("input[id='email-email']", (selector) => {
    selector.focus();
    fillInput(selector, email);
  });

  chrome.storage.sync.get("toPayEnabled", (result) => {
    const toPayEnabled =
      result.toPayEnabled !== undefined ? result.toPayEnabled : true;

    if (toPayEnabled)
      waitForElement("button[type='submit']", (selector) => selector.click());
  });
}

runAutofill();
