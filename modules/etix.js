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
    const email = customToggleOn
      ? details.email
      : `${fullName.split(" ").join(".").toLowerCase()}.${generateRandomLetters(
          5,
        )}${generateRandomNumbers(5)}@sagimail.com`;
    const phoneNumber = customToggleOn
      ? details.phoneNumber
      : `${generateRandomAreaCodeNumber()}${generateRandomNumbers(7)}`;
    const ic = customToggleOn ? details.ic : "0000";
    const quantity = details.quantity || 1;

    waitForElement("path[fill='#F27F4A']", (selector) => {
      for (let i = 0; i < quantity; i++) {
        selector.parentElement.parentElement.click();
      }

      waitForElement(
        "button[style='background: rgb(242, 127, 74);']",
        (selector) => {
          selector.click();
        },
      );
    });

    waitForElement("input[name='givenName']", (selector) => {
      selector.focus();
      fillInput(selector, fullName);
    });

    waitForElement("input[name='emailAddress']", (selector) => {
      selector.focus();
      fillInput(selector, email);
    });

    waitForElement("input[name='phoneNumber']", (selector) => {
      selector.focus();
      fillInput(selector, phoneNumber);
    });

    waitForElement("input[id='attending']", async (selector) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      selector.click();
    });

    waitForElement("input[name='customerDocumentNumber']", (selector) => {
      selector.focus();
      fillInput(selector, ic);
    });

    waitForElement("input[id='agree1']", async (selector) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      selector.click();
    });

    waitForElement("input[id='agree2']", async (selector) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      selector.click();
    });

    waitForElement("label[aria-label='Non-refundable Booking']", (selector) => {
      selector.click();

      waitForCustomElement(
        "p.ml-3.w-full.flex-shrink.text-left.text-base.font-semibold",
        "Credit / DebitCard",
        (selector) => selector.click(),
      );
    });
  }

  runAutofill();
})();
