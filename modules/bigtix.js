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

function generateRandomAreaCodeNumber() {
  const areaCodes = ["012", "013", "016", "017", "019"];

  return areaCodes[Math.floor(Math.random() * areaCodes.length)];
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

// Function to wait for an element using MutationObserver
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

// Function to wait for a custom element using MutationObserver
function waitForCustomElement(textContent, callback) {
  const currentUrl = window.location.href;
  // if (
  //   !currentUrl.includes("starplanet") &&
  //   !currentUrl.includes("biztmgptix") &&
  //   !currentUrl.includes("bookmyshow")
  // )
  //   return;
  if (!currentUrl.includes("bigtix")) return;

  const observer = new MutationObserver((_, observer) => {
    const targetElement = findInputByLabel(textContent);
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

// Function to fill standard input fields and trigger events
function fillInput(selector, value) {
  const input =
    typeof selector === "string" ? document.querySelector(selector) : selector;

  if (input) {
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}

function findLabel(element, textContent) {
  let selectedLabel;
  const labels = document.querySelectorAll(element);

  for (const label of labels) {
    if (label.textContent.toLowerCase().includes(textContent.toLowerCase())) {
      selectedLabel = label;
      break;
    }
  }

  return selectedLabel;
}

// Function to find an input element by its associated label text content
function findInputByLabel(textContent) {
  const selectedLabel = findLabel("label.bigtix-formitem__label", textContent);
  if (!selectedLabel) return;

  const formDiv = selectedLabel.parentElement.querySelector(
    ".bigtix-formitem__field"
  );
  let inputField = formDiv.querySelector("input");
  if (!inputField) inputField = formDiv.querySelector("[role='checkbox']");

  return inputField;
}

// Function to wait and click next page button
async function selectNextButton(selector) {
  const checkNextButton = setInterval(() => {
    const targetElement = document.getElementById(selector);
    if (!targetElement) return;

    const hasDisabledClasses =
      targetElement.classList.contains("bigtix-button--disabled") ||
      targetElement.classList.contains("bigtix-booking-`pagenav-disabled");
    if (hasDisabledClasses) return;

    clearInterval(checkNextButton);
    targetElement.click();
  }, 500);
}

// Main function to run the autofill logic
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
        5
      )}${generateRandomNumbers(5)}@sagimail.com`;
  const phoneCountry = customToggleOn ? details.phoneCountry : "Malaysia";
  const phoneNumber = customToggleOn
    ? details.phoneNumber
    : `${generateRandomAreaCodeNumber()}${generateRandomNumbers(7)}`;
  const ic = customToggleOn ? details.ic : "0000";
  const nationality = customToggleOn ? details.nationality : "Malaysian";

  // Full Name
  waitForElement(
    "input[data-test='test-bigtix-booking--patroninfoform-fullName']",
    (selector) => fillInput(selector, fullName)
  );

  // Email
  waitForElement(
    'input[data-test="test-bigtix-booking--patroninfoform-email"]',
    (selector) => fillInput(selector, email)
  );

  // Confirm Email
  waitForElement(
    'input[data-test="test-bigtix-booking--patroninfoform-confirm_email_address"]',
    (selector) => fillInput(selector, email)
  );

  // Country
  waitForElement(
    'input[role="combobox"][aria-labelledby="bigtix-formitem__patronInfo-label--phone"]',
    (selector) => {
      const combobox = selector;
      combobox.focus();
      fillInput(combobox, phoneCountry);

      waitForElement(`div[label="${phoneCountry}"]`, (selector) => {
        selector.click();
        combobox.blur();
      });
    }
  );

  // Phone Number
  waitForElement(
    'input[data-test="test-bigtix-booking--patroninfoform-phone"]',
    (selector) => fillInput(selector, phoneNumber)
  );

  // Consent Checkbox
  waitForElement(".bigtix-checkbox__icon", (selector) => {
    if (selector.getAttribute("aria-checked") === "false") selector.click();
  });

  // Custom Fields

  // NRIC
  waitForCustomElement("Malaysian NRIC", (selector) => fillInput(selector, ic));

  // Nationality
  waitForCustomElement("Nationality", (selector) => {
    const combobox = selector;
    combobox.focus();
    fillInput(combobox, nationality);

    waitForElement(`div[label="${nationality}"]`, (selector) => {
      selector.click();
      combobox.blur();
    });
  });

  // Place of Residence
  waitForCustomElement("Place of Residence", (selector) => {
    const combobox = selector;
    combobox.focus();
    fillInput(combobox, phoneCountry);

    waitForElement(`div[label="${phoneCountry}"]`, (selector) => {
      selector.click();
      combobox.blur();
    });
  });

  // Age Range
  waitForCustomElement("Age Range", (selector) => {
    const combobox = selector;
    combobox.focus();
    fillInput(combobox, "below 21");

    waitForElement(`div[label="below 21"]`, (selector) => {
      selector.click();
      combobox.blur();
    });
  });

  // Gender
  waitForCustomElement("Gender", (selector) => {
    const combobox = selector;
    combobox.focus();
    fillInput(combobox, "Prefer not to say");

    waitForElement(`div[label="Prefer not to say"]`, (selector) => {
      selector.click();
      combobox.blur();
    });
  });

  // National Identification Card / Passport
  waitForCustomElement("National Identification Card / Passport", (selector) =>
    fillInput(selector, ic)
  );

  // Acknowledgement
  waitForCustomElement("Acknowledgement", (selector) => {
    if (selector.getAttribute("aria-checked") === "false") selector.click();
  });

  // Cart Summary
  waitForElement(".bigtix-collapse__header", async (selector) => {
    if (selector.getAttribute("aria-expanded") === "true") return;

    selector.click();

    await new Promise((resolve) => setTimeout(resolve, 1000));

    chrome.runtime.sendMessage({ action: "screenshot" });

    // To Payment Page
    selectNextButton("bigtix-booking-next-page");

    // Payment Method
    waitForElement(`div[role="tablist"]`, () => {
      const selectedLabel = findLabel(
        ".bigtix-payment-method__title",
        details.cardType
      );
      if (!selectedLabel) return;

      const paymentMethodContainer = selectedLabel.closest(
        'div[class="rc-collapse-header"]'
      );
      paymentMethodContainer.click();
    });

    // Card First Name
    waitForElement(
      'input[data-test="test-bigtix-booking--creditcardform-firstname"]',
      (selector) => fillInput(selector, firstName)
    );

    // Card Last Name
    waitForElement(
      'input[data-test="test-bigtix-booking--creditcardform-lastname"]',
      (selector) => fillInput(selector, lastName)
    );

    // Card Number
    waitForElement(
      'input[data-test="test-bigtix-booking--creditcardform-cardnumber"]',
      (selector) => fillInput(selector, details.cardNumber)
    );

    // Card Expiry Month
    waitForElement('input[name="cc-exp-month"]', (selector) =>
      fillInput(selector, details.cardExpiryMonth)
    );

    // Card Expiry Year
    waitForElement('input[name="cc-exp-year"]', (selector) =>
      fillInput(selector, details.cardExpiryYear)
    );

    // Card CVV
    waitForElement(
      'input[data-test="test-bigtix-booking--creditcardform-cvn"]',
      (selector) => fillInput(selector, details.cardCvv)
    );

    chrome.storage.sync.get("toPayEnabled", (result) => {
      const toPayEnabled =
        result.toPayEnabled !== undefined ? result.toPayEnabled : true;

      if (toPayEnabled) selectNextButton("bigtix-booking-next-page");
    });
  });
}

runAutofill();
