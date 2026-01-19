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
      `${details.cardExpiryMonth}/${details.cardExpiryYear}`,
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
