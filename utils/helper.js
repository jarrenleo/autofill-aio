function generateRandomAreaCodeNumber() {
  const areaCodes = ["012", "013", "016", "019"];

  return areaCodes[Math.floor(Math.random() * areaCodes.length)];
}

// Generate a random name from the names array
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
