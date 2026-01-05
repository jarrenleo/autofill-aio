(() => {
  if (window.__bmsAutofillLoaded) return;
  window.__bmsAutofillLoaded = true;

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
      if (
        element.children[0].textContent
          .toLowerCase()
          .includes(textContent.toLowerCase())
      ) {
        selectedElement = element;
        break;
      }
    }

    return selectedElement;
  }

  function isElementScrollable(element) {
    if (!element) return false;

    const style = window.getComputedStyle(element);
    const { overflow, overflowY, overflowX } = style;

    const hasScrollableOverflow = ["scroll", "auto"].some(
      (val) => overflow === val || overflowY === val || overflowX === val
    );

    const hasScrollableContent =
      element.scrollHeight > element.clientHeight ||
      element.scrollWidth > element.clientWidth;

    return hasScrollableOverflow || hasScrollableContent;
  }

  function handleScrollableElement(targetElement) {
    const interval = setInterval(() => {
      if (isElementScrollable(targetElement)) {
        targetElement.scrollTop = targetElement.scrollHeight;
        clearInterval(interval);
        return;
      }
    }, 300);
  }

  let hasClickedConfirmQuantity = false;
  let hasClickedConfirmSelection = false;
  let hasClickedCheckout = false;

  async function runAutofill() {
    const result = await chrome.storage.sync.get([
      "autofillProfiles",
      "activeProfileName",
    ]);
    const profiles = result.autofillProfiles;
    const activeProfileName = result.activeProfileName;

    if (!profiles || !activeProfileName || !profiles[activeProfileName]) return;

    const details = profiles[activeProfileName];

    waitForElement("div.bigtix-htmlparser", (selector) => {
      handleScrollableElement(selector.parentElement);

      waitForElement("button.bigtix-button--primary", async (selector) => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        selector.click();
      });
    });

    waitForElement("input.bigtix-input-number", (selector) => {
      selector.focus();
      fillInput(selector, details.quantity);
    });

    if (!hasClickedConfirmQuantity) {
      hasClickedConfirmQuantity = true;

      waitForCustomElement(
        "button[id='bigtix-booking-next-page']",
        "Confirm quantity",
        async (selector) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          selector.click();
        }
      );
    }

    if (!hasClickedConfirmSelection) {
      hasClickedConfirmSelection = true;

      const pollInterval = setInterval(async () => {
        const button = findElement(
          "button[id='bigtix-booking-next-page']",
          "Confirm selection"
        );
        if (!button) return;

        if (!button.hasAttribute("disabled")) {
          clearInterval(pollInterval);
          button.click();
        }
      }, 500);
    }

    if (!hasClickedCheckout) {
      hasClickedCheckout = true;

      waitForCustomElement(
        "button.bigtix-checkout_shopping_cart_sticky_checkout_card_next_button",
        "Checkout",
        async (selector) => {
          await new Promise((resolve) => setTimeout(resolve, 500));
          selector.click();
        }
      );
    }
  }

  runAutofill();
})();
