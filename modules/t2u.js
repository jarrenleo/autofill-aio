(function () {
  if (window.__t2uAutofillLoaded) return;
  window.__t2uAutofillLoaded = true;

  function waitForCustomElement(element, textContent, callback) {
    const observer = new MutationObserver((_, observer) => {
      const targetElement = findAnchor(element, textContent);
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

  function findAnchor(element, textContent) {
    let selectedAnchor;
    const anchors = document.querySelectorAll(element);

    for (const anchor of anchors) {
      if (
        anchor.textContent.toLowerCase().includes(textContent.toLowerCase())
      ) {
        selectedAnchor = anchor;
        break;
      }
    }

    return selectedAnchor;
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
    
    // Generate fallback email (used when custom toggle is off)
    const generatedEmail = `${fullName.split(" ").join(".").toLowerCase()}.${generateRandomLetters(
      5,
    )}${generateRandomNumbers(5)}${getRandomEmail()}`;
    
    // Get the appropriate email based on profile settings
    const email = getEmailFromProfile(details, generatedEmail);
    
    const phoneNumber = customToggleOn
      ? details.phoneNumber
      : `${getRandomAreaCodeNumber()}${generateRandomNumbers(7)}`;
    const ic = customToggleOn ? details.ic : "0000";

    waitForElement("input[label='Name']", (selector) =>
      fillInput(selector, fullName),
    );

    waitForElement("input[label='Email']", (selector) =>
      fillInput(selector, email),
    );

    waitForElement("input[id='telMask_']", (selector) =>
      fillInput(selector, phoneNumber),
    );

    waitForElement("input[placeholder*='Passport' i]", (selector) => {
      fillInput(selector, ic);
    });

    waitForElement("div[id='ticket_form']", async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      chrome.runtime.sendMessage({ action: "screenshot" });

      await new Promise((resolve) => setTimeout(resolve, 500));
      const saveAndNextButton = findAnchor("a.btn", "Save And Next");
      saveAndNextButton.click();

      const agreeProceedButton = findAnchor("a.btn", "I Agree, Proceed");
      agreeProceedButton.click();

      waitForCustomElement("a.btn", "Make Payment", async (selector) => {
        selector.click();

        await new Promise((resolve) => setTimeout(resolve, 500));
        const paymentSelectionMolpay = findAnchor(
          "label[for='paymentSelectionMolpay']",
          "Credit/Debit Payment",
        );
        paymentSelectionMolpay.click();

        const proceedButton = findAnchor("button.btn", "Proceed");
        proceedButton.click();
      });
    });
  }

  runAutofill();
})();
