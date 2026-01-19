function waitForCustomElement(element, textContent, callback) {
  const observer = new MutationObserver((_, observer) => {
    const targetElement = findElement(element, textContent);
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

function findElement(element, textContent) {
  let selectedElement;
  const elements = document.querySelectorAll(element);

  for (const element of elements) {
    if (element.textContent.toLowerCase().includes(textContent.toLowerCase())) {
      selectedElement = element;
      break;
    }
  }

  return selectedElement;
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
  const cardType = details.cardType;

  waitForCustomElement("li.select2-results__option", cardType, (option) =>
    option.dispatchEvent(
      new MouseEvent("mouseup", { bubbles: true, cancelable: true }),
    ),
  );

  waitForElement("span[id='select2-stripe-card-type-container']", (selector) =>
    selector.dispatchEvent(
      new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
    ),
  );

  waitForElement("input[id='acceptcheck']", (selector) => selector.click());

  waitForElement("button[id='cart-proceedtopay-btn']", async (selector) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    selector.click();
  });

  waitForElement("button[id='popup-button-0']", (selector) => selector.click());
}

runAutofill();
