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
    if (anchor.textContent.toLowerCase().includes(textContent.toLowerCase())) {
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
        5
      )}${generateRandomNumbers(5)}@sagimail.com`;
  const phoneNumber = customToggleOn
    ? details.phoneNumber
    : `${generateRandomAreaCodeNumber()}${generateRandomNumbers(7)}`;
  const ic = customToggleOn ? details.ic : "0000";

  waitForElement("input[label='Name']", (selector) => {
    fillInput(selector, fullName);
  });

  waitForElement("input[label='Email']", (selector) => {
    fillInput(selector, email);
  });

  waitForElement("input[id='telMask_']", (selector) => {
    fillInput(selector, phoneNumber);
  });

  waitForElement("input[placeholder='NRIC/Passport Number']", (selector) => {
    fillInput(selector, ic);
  });

  waitForCustomElement("a.btn", "Save And Next", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    selector.click();

    waitForCustomElement("a.btn", "I Agree, Proceed", (selector) => {
      selector.click();

      waitForCustomElement("a.btn", "Make Payment", (selector) => {
        selector.click();

        waitForElement("label[for='paymentSelectionMolpay']", (selector) => {
          selector.click();

          waitForCustomElement("button.btn", "Proceed", (selector) => {
            selector.click();
          });
        });
      });
    });
  });
}

runAutofill();
