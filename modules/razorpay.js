(function () {
  if (window.__razorpayAutofillLoaded) return;
  window.__razorpayAutofillLoaded = true;

  function waitForElement(selector, callback) {
    const observer = new MutationObserver((_, obs) => {
      const element = document.querySelector(selector);
      if (element) {
        obs.disconnect();
        callback(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const element = document.querySelector(selector);
    if (element) {
      observer.disconnect();
      callback(element);
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

    const { generatedPhoneNumber, generatedFullName } =
      await chrome.storage.local.get([
        "generatedPhoneNumber",
        "generatedFullName",
      ]);

    waitForElement(
      "button[data-testid='contact-sidebar-widget']",
      (selector) => {
        selector.click();

        waitForElement("input[name='contact']", (selector) => {
          selector.focus();
          fillInput(selector, "");
          fillInput(selector, generatedPhoneNumber);

          waitForElement("button[name='button']", (selector) => {
            selector.click();

            waitForElement("div[data-value='card']", async (selector) => {
              selector.click();

              waitForElement("input[name='card.number']", (selector) => {
                selector.focus();
                fillInput(selector, details.cardNumber);
              });

              waitForElement("input[name='card.expiry']", (selector) => {
                selector.focus();
                fillInput(
                  selector,
                  `${details.cardExpiryMonth}/${details.cardExpiryYear}`,
                );
              });

              waitForElement("input[name='card.cvv']", (selector) => {
                selector.focus();
                fillInput(selector, details.cardCvv);
              });

              waitForElement("input[name='card.name']", (selector) => {
                selector.focus();
                fillInput(selector, generatedFullName);
              });

              chrome.storage.sync.get("toPayEnabled", (result) => {
                const toPayEnabled =
                  result.toPayEnabled !== undefined
                    ? result.toPayEnabled
                    : true;

                if (toPayEnabled)
                  waitForElement(
                    "button[data-test-id='add-card-cta']",
                    async (selector) => {
                      await new Promise((resolve) => setTimeout(resolve, 300));
                      selector.click();
                    },
                  );
              });
            });
          });
        });
      },
    );
  }

  runAutofill();
})();
