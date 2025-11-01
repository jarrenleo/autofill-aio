function generateRandomName() {
  return window.names[Math.floor(Math.random() * window.names.length)];
}

// Function to generate a random string of letters
function generateRandomLetters(length) {
  let result = "";
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

// Function to generate a random string of numbers
function generateRandomNumbers(length) {
  let result = "";
  const numbers = "0123456789";
  const numbersLength = numbers.length;
  for (let i = 0; i < length; i++) {
    result += numbers.charAt(Math.floor(Math.random() * numbersLength));
  }

  return result;
}

function waitForElement(selector, callback) {
  const observer = new MutationObserver((_, observer) => {
    const targetElement = document.querySelector(selector);
    if (targetElement) {
      observer.disconnect();
      callback(targetElement);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function fillInput(selector, value) {
  const input =
    typeof selector === "string" ? document.querySelector(selector) : selector;

  if (input) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

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

  const firstName = details.firstName;
  const lastName = details.lastName || generateRandomName();
  const fullName = `${firstName} ${lastName}`;
  const email =
    details.email ||
    `${fullName.split(" ").join(".").toLowerCase()}.${generateRandomLetters(
      5
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
