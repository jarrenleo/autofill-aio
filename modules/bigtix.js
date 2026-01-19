(function () {
  // Guard against double-loading
  if (window.__bigtixAutofillLoaded) return;
  window.__bigtixAutofillLoaded = true;

  // Domain check
  const ALLOWED_DOMAINS = ["bigtix", "starplanet", "biztmgptix", "bookmyshow"];
  const currentUrl = window.location.href;
  if (!ALLOWED_DOMAINS.some((domain) => currentUrl.includes(domain))) return;

  // ============================================================================
  // SELECTORS
  // ============================================================================
  const SELECTORS = {
    // Form inputs
    fullName: "input[data-test='test-bigtix-booking--patroninfoform-fullName']",
    email: 'input[data-test="test-bigtix-booking--patroninfoform-email"]',
    confirmEmail:
      'input[data-test="test-bigtix-booking--patroninfoform-confirm_email_address"]',
    phoneCountry:
      'input[role="combobox"][aria-labelledby="bigtix-formitem__patronInfo-label--phone"]',
    phoneNumber: 'input[data-test="test-bigtix-booking--patroninfoform-phone"]',
    consentCheckbox: ".bigtix-checkbox__icon",

    // Card inputs
    cardFirstName:
      'input[data-test="test-bigtix-booking--creditcardform-firstname"]',
    cardLastName:
      'input[data-test="test-bigtix-booking--creditcardform-lastname"]',
    cardNumber:
      'input[data-test="test-bigtix-booking--creditcardform-cardnumber"]',
    cardExpiryMonth: 'input[name="cc-exp-month"]',
    cardExpiryYear: 'input[name="cc-exp-year"]',
    cardCvv: 'input[data-test="test-bigtix-booking--creditcardform-cvn"]',

    // UI elements
    cartSummary: ".bigtix-collapse__header",
    paymentTabList: 'div[role="tablist"]',
    paymentMethodTitle: ".bigtix-payment-method__title",
    nextPageButton: "button[id='bigtix-booking-next-page']",

    // Custom field selectors
    formItemLabel: "label.bigtix-formitem__label",
    formItemField: ".bigtix-formitem__field",
  };

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Finds a label element containing the specified text
   */
  function findLabelByText(selector, textContent) {
    const labels = document.querySelectorAll(selector);
    return Array.from(labels).find((label) =>
      label.textContent.toLowerCase().includes(textContent.toLowerCase()),
    );
  }

  /**
   * Finds an input element by its associated label text
   */
  function findInputByLabel(textContent) {
    const label = findLabelByText(SELECTORS.formItemLabel, textContent);
    if (!label) return null;

    const formDiv = label.parentElement?.querySelector(SELECTORS.formItemField);
    if (!formDiv) return null;

    return (
      formDiv.querySelector("input") ||
      formDiv.querySelector("[role='checkbox']")
    );
  }

  /**
   * Finds a button element containing the specified text
   */
  function findButtonByText(selector, textContent) {
    const buttons = document.querySelectorAll(selector);
    return Array.from(buttons).find((btn) =>
      btn.children[0]?.textContent
        ?.toLowerCase()
        .includes(textContent.toLowerCase()),
    );
  }

  /**
   * Waits for a custom element (by label text) using MutationObserver
   */
  function waitForCustomElement(textContent, callback) {
    const observer = new MutationObserver((_, obs) => {
      const element = findInputByLabel(textContent);
      if (element) {
        obs.disconnect();
        callback(element);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /**
   * Selects an option from a combobox dropdown
   */
  function selectComboboxOption(combobox, optionText) {
    combobox.focus();
    fillInput(combobox, optionText);

    waitForElement(`div[label="${optionText}"]`, (option) => {
      option.click();
      combobox.blur();
    });
  }

  /**
   * Polls for a button and clicks it with retry limit
   */
  function pollAndClickButton(buttonText, maxAttempts = 3) {
    let attempts = 0;

    const pollInterval = setInterval(() => {
      if (attempts >= maxAttempts) {
        clearInterval(pollInterval);
        return;
      }

      const button = findButtonByText(SELECTORS.nextPageButton, buttonText);
      if (button) {
        button.click();
        attempts++;
      }
    }, 500);
  }

  // ============================================================================
  // PROFILE DATA GENERATION
  // ============================================================================

  /**
   * Generates profile data based on settings
   */
  function generateProfileData(details) {
    const customToggleOn = details.customToggleOn || false;

    const firstName = details.firstName;
    const lastName = customToggleOn ? details.lastName : generateRandomName();
    const fullName = `${firstName} ${lastName}`;

    return {
      firstName,
      lastName,
      fullName,
      email: customToggleOn
        ? details.email
        : `${fullName
            .split(" ")
            .join(".")
            .toLowerCase()}.${generateRandomLetters(5)}${generateRandomNumbers(
            5,
          )}@sagimail.com`,
      phoneCountry: customToggleOn ? details.phoneCountry : "Malaysia",
      phoneNumber: customToggleOn
        ? details.phoneNumber
        : `${generateRandomAreaCodeNumber()}${generateRandomNumbers(7)}`,
      ic: customToggleOn ? details.ic : "0000",
      nationality: customToggleOn ? details.nationality : "Malaysian",
      cardType: details.cardType,
      cardNumber: details.cardNumber,
      cardExpiryMonth: details.cardExpiryMonth,
      cardExpiryYear: details.cardExpiryYear,
      cardCvv: details.cardCvv,
    };
  }

  // ============================================================================
  // FORM FILLING FUNCTIONS
  // ============================================================================

  /**
   * Fills the patron information form
   */
  function fillPatronInfoForm(data) {
    // Full Name
    waitForElement(SELECTORS.fullName, (el) => fillInput(el, data.fullName));

    // Email
    waitForElement(SELECTORS.email, (el) => fillInput(el, data.email));

    // Confirm Email
    waitForElement(SELECTORS.confirmEmail, (el) => fillInput(el, data.email));

    // Phone Country
    waitForElement(SELECTORS.phoneCountry, (el) =>
      selectComboboxOption(el, data.phoneCountry),
    );

    // Phone Number
    waitForElement(SELECTORS.phoneNumber, (el) =>
      fillInput(el, data.phoneNumber),
    );

    // Consent Checkbox
    waitForElement(SELECTORS.consentCheckbox, (el) => {
      if (el.getAttribute("aria-checked") === "false") el.click();
    });
  }

  /**
   * Fills custom fields (NRIC, Nationality, etc.)
   */
  function fillCustomFields(data) {
    // NRIC
    waitForCustomElement("Malaysian NRIC", (el) => fillInput(el, data.ic));

    // Nationality
    waitForCustomElement("Nationality", (el) =>
      selectComboboxOption(el, data.nationality),
    );

    // Place of Residence
    waitForCustomElement("Place of Residence", (el) =>
      selectComboboxOption(el, data.phoneCountry),
    );

    // Age Range
    waitForCustomElement("Age Range", (el) =>
      selectComboboxOption(el, "below 21"),
    );

    // Gender
    waitForCustomElement("Gender", (el) =>
      selectComboboxOption(el, "Prefer not to say"),
    );

    // National ID / Passport
    waitForCustomElement("National Identification Card / Passport", (el) =>
      fillInput(el, data.ic),
    );

    // Acknowledgement
    waitForCustomElement("Acknowledgement", (el) => {
      if (el.getAttribute("aria-checked") !== "true") el.click();
    });
  }

  /**
   * Handles cart summary and confirmation
   */
  function handleCartSummary() {
    waitForElement(SELECTORS.cartSummary, async (el) => {
      if (el.getAttribute("aria-expanded") !== "true") {
        el.click();
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      chrome.runtime.sendMessage({ action: "screenshot" });
      pollAndClickButton("Confirm details");
    });
  }

  /**
   * Fills the payment card form
   */
  function fillCardForm(data) {
    // Select payment method
    waitForElement(SELECTORS.paymentTabList, () => {
      const paymentLabel = findLabelByText(
        SELECTORS.paymentMethodTitle,
        data.cardType,
      );
      if (!paymentLabel) return;

      const paymentContainer = paymentLabel.closest(
        'div[class="rc-collapse-header"]',
      );
      paymentContainer?.click();
    });

    // Card details
    waitForElement(SELECTORS.cardFirstName, (el) =>
      fillInput(el, data.firstName),
    );
    waitForElement(SELECTORS.cardLastName, (el) =>
      fillInput(el, data.lastName),
    );
    waitForElement(SELECTORS.cardNumber, (el) =>
      fillInput(el, data.cardNumber),
    );
    waitForElement(SELECTORS.cardExpiryMonth, (el) =>
      fillInput(el, data.cardExpiryMonth),
    );
    waitForElement(SELECTORS.cardExpiryYear, (el) =>
      fillInput(el, data.cardExpiryYear),
    );
    waitForElement(SELECTORS.cardCvv, (el) => fillInput(el, data.cardCvv));
  }

  /**
   * Handles the final pay button if enabled
   */
  function handlePayButton() {
    chrome.storage.sync.get("toPayEnabled", (result) => {
      const toPayEnabled =
        result.toPayEnabled !== undefined ? result.toPayEnabled : true;
      if (toPayEnabled) {
        pollAndClickButton("Pay");
      }
    });
  }

  // ============================================================================
  // MAIN AUTOFILL FUNCTION
  // ============================================================================

  async function runAutofill() {
    const result = await chrome.storage.sync.get([
      "autofillProfiles",
      "activeProfileName",
    ]);
    const { autofillProfiles: profiles, activeProfileName } = result;

    if (!profiles || !activeProfileName || !profiles[activeProfileName]) return;

    const profileData = generateProfileData(profiles[activeProfileName]);

    // Fill forms
    fillPatronInfoForm(profileData);
    fillCustomFields(profileData);
    handleCartSummary();
    fillCardForm(profileData);
    handlePayButton();
  }

  runAutofill();
})();
