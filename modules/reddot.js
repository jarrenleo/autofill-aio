function generateRandomName() {
  return window.names[Math.floor(Math.random() * window.names.length)];
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

function findInputByLabel(textContent) {
  const selectedLabel = findLabel("label.bigtix-formitem__label", textContent);
  if (!selectedLabel) return;

  const formDiv = selectedLabel.parentElement.querySelector(
    ".bigtix-formitem__field"
  );
  const inputField = formDiv.querySelector("input");

  return inputField;
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

  waitForElement(".mx-name-input_card_number", (selector) => {
    const inputElement = selector.querySelector("input");
    inputElement.focus();
    fillInput(inputElement, details.cardNumber);
  });

  waitForElement(".mx-name-input_expiration_date", (selector) => {
    const inputElement = selector.querySelector("input");
    inputElement.focus();
    fillInput(
      inputElement,
      `${details.cardExpiryMonth}/${details.cardExpiryYear}`
    );
  });

  waitForElement(".mx-name-input_cvv_cvc", (selector) => {
    const inputElement = selector.querySelector("input");
    inputElement.focus();
    fillInput(inputElement, details.cardCvv);
  });

  waitForElement(".mx-name-input_name_on_card", (selector) => {
    const inputElement = selector.querySelector("input");
    inputElement.focus();
    fillInput(inputElement, fullName);
  });

  waitForElement(".mx-name-input_email", (selector) => {
    const inputElement = selector.querySelector("input");
    inputElement.focus();
    fillInput(inputElement, email);
  });

  chrome.storage.sync.get("toPayEnabled", (result) => {
    const toPayEnabled =
      result.toPayEnabled !== undefined ? result.toPayEnabled : true;

    if (toPayEnabled)
      waitForElement(".mx-name-btn_pay_card", (selector) => selector.click());
  });
}

runAutofill();
