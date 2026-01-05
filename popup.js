const quantityInput = document.getElementById("quantity");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const emailInput = document.getElementById("email");
const phoneCountryInput = document.getElementById("phoneCountry");
const phoneNumberInput = document.getElementById("phoneNumber");
const icInput = document.getElementById("ic");
const nationalityInput = document.getElementById("nationality");

const cardNumberInput = document.getElementById("cardNumber");
const cardExpiryMonthInput = document.getElementById("cardExpiryMonth");
const cardExpiryYearInput = document.getElementById("cardExpiryYear");
const cardCvvInput = document.getElementById("cardCvv");
const cardTypeInput = document.getElementById("cardType");
const saveButton = document.getElementById("save");

const statusDiv = document.getElementById("status");
const profileSelect = document.getElementById("profileSelect");
const newProfileBtn = document.getElementById("newProfileBtn");
const deleteProfileBtn = document.getElementById("deleteProfileBtn");
const toPayToggle = document.getElementById("toPayToggle");
const customDetailsToggle = document.getElementById("customDetailsToggle");
const customDetailsSection = document.getElementById("customDetailsSection");
const nameGrid = document.getElementById("nameGrid");
const lastNameDiv = document.getElementById("lastNameDiv");
const exportProfilesBtn = document.getElementById("exportProfilesBtn");
const importProfilesBtn = document.getElementById("importProfilesBtn");
const importProfilesInput = document.getElementById("importProfilesInput");

// Function to get profile display name with indicator
function getProfileDisplayName(profileName, profiles) {
  const profileData = profiles[profileName] || {};
  const customToggleOn = profileData.customToggleOn || false;
  return customToggleOn ? `${profileName} (Custom)` : profileName;
}

// Function to toggle custom details section visibility
function toggleCustomDetailsSection(show) {
  if (show) {
    customDetailsSection.classList.remove("hidden");
    nameGrid.classList.remove("grid-cols-1");
    nameGrid.classList.add("grid-cols-2");
    lastNameDiv.classList.remove("hidden");
  } else {
    customDetailsSection.classList.add("hidden");
    nameGrid.classList.remove("grid-cols-2");
    nameGrid.classList.add("grid-cols-1");
    lastNameDiv.classList.add("hidden");
  }
  customDetailsToggle.checked = show;
}

// Handle custom details toggle
customDetailsToggle.addEventListener("change", () => {
  toggleCustomDetailsSection(customDetailsToggle.checked);

  // Save the toggle state to the current profile
  const activeProfileName = profileSelect.value;
  if (activeProfileName) {
    chrome.storage.sync.get("autofillProfiles", (result) => {
      let profiles = result.autofillProfiles || {};
      const profileData = profiles[activeProfileName] || {};
      profileData.customToggleOn = customDetailsToggle.checked;
      profiles[activeProfileName] = profileData;
      chrome.storage.sync.set({ autofillProfiles: profiles }, () => {
        // Update the profile dropdown text to reflect the new indicator
        const selectedOption =
          profileSelect.options[profileSelect.selectedIndex];
        selectedOption.textContent = getProfileDisplayName(
          activeProfileName,
          profiles
        );
      });
    });
  }
});

// Function to load data for a specific profile into the form
function loadProfileData(profileDetails) {
  quantityInput.value = profileDetails?.quantity || 1;
  firstNameInput.value = profileDetails?.firstName || "";
  lastNameInput.value = profileDetails?.lastName || "";
  emailInput.value = profileDetails?.email || "";
  phoneCountryInput.value = profileDetails?.phoneCountry || "";
  phoneNumberInput.value = profileDetails?.phoneNumber || "";
  icInput.value = profileDetails?.ic || "";
  nationalityInput.value = profileDetails?.nationality || "";
  cardNumberInput.value = profileDetails?.cardNumber || "";
  cardExpiryMonthInput.value = profileDetails?.cardExpiryMonth || "";
  cardExpiryYearInput.value = profileDetails?.cardExpiryYear || "";
  cardCvvInput.value = profileDetails?.cardCvv || "";
  cardTypeInput.value = profileDetails?.cardType || "VISA";

  // Set the custom details toggle based on the profile's customToggleOn state
  const customToggleOn = profileDetails?.customToggleOn || false;
  toggleCustomDetailsSection(customToggleOn);
}

// Load profiles and active profile when popup opens
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.sync.get(
    ["autofillProfiles", "activeProfileName", "toPayEnabled"],
    (result) => {
      const profiles = result.autofillProfiles || {};
      let activeProfileName = result.activeProfileName;
      const toPayEnabled =
        result.toPayEnabled !== undefined ? result.toPayEnabled : true;
      const profileNames = Object.keys(profiles);

      // Set initial toggle state
      toPayToggle.checked = toPayEnabled;

      // Clear existing options
      profileSelect.innerHTML = "";

      // If no profiles, create a default one
      if (profileNames.length === 0) {
        profiles["Default"] = {};
        activeProfileName = "Default";
        profileNames.push("Default");
        chrome.storage.sync.set({
          autofillProfiles: profiles,
          activeProfileName: activeProfileName,
        });
      }

      // Ensure activeProfileName is valid, default to first if not
      if (!activeProfileName || !profiles[activeProfileName]) {
        activeProfileName = profileNames[0];
        chrome.storage.sync.set({ activeProfileName: activeProfileName });
      }

      // Populate dropdown
      profileNames.forEach((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = getProfileDisplayName(name, profiles);
        if (name === activeProfileName) option.selected = true;
        profileSelect.appendChild(option);
      });

      // Load data for the active profile
      activeProfileName && profiles[activeProfileName]
        ? loadProfileData(profiles[activeProfileName])
        : loadProfileData({});
    }
  );
});

// Handle profile selection change
profileSelect.addEventListener("change", () => {
  const selectedProfileName = profileSelect.value;
  chrome.storage.sync.set({ activeProfileName: selectedProfileName }, () => {
    // Reload data for the newly selected profile
    chrome.storage.sync.get("autofillProfiles", (result) => {
      const profiles = result.autofillProfiles || {};
      profiles[selectedProfileName]
        ? loadProfileData(profiles[selectedProfileName])
        : loadProfileData({});
    });
  });
});

// Save toggle state
toPayToggle.addEventListener("change", () => {
  const isEnabled = toPayToggle.checked;
  chrome.storage.sync.set({ toPayEnabled: isEnabled });
});

// Save settings for the CURRENTLY SELECTED profile
saveButton.addEventListener("click", () => {
  // Get current profile from dropdown
  const activeProfileName = profileSelect.value;
  if (!activeProfileName) {
    statusDiv.textContent = "No profile selected. Please select a profile.";
    setTimeout(() => {
      statusDiv.textContent = "";
    }, 3000);
    return;
  }

  const details = {
    quantity: parseInt(quantityInput.value, 10) || 1,
    firstName: firstNameInput.value,
    lastName: lastNameInput.value,
    email: emailInput.value,
    phoneCountry: phoneCountryInput.value,
    phoneNumber: phoneNumberInput.value,
    ic: icInput.value,
    nationality: nationalityInput.value,
    cardNumber: cardNumberInput.value,
    cardExpiryMonth: cardExpiryMonthInput.value,
    cardExpiryYear: cardExpiryYearInput.value,
    cardCvv: cardCvvInput.value,
    cardType: cardTypeInput.value,
    customToggleOn: customDetailsToggle.checked,
  };

  // Get existing profiles, update the active one, and save back
  chrome.storage.sync.get("autofillProfiles", (result) => {
    let profiles = result.autofillProfiles || {};
    profiles[activeProfileName] = details;

    chrome.storage.sync.set({ autofillProfiles: profiles }, () => {
      statusDiv.textContent = `Profile "${activeProfileName}" saved.`;
      setTimeout(() => {
        statusDiv.textContent = "";
      }, 3000);
    });
  });
});

// --- Add New Profile Logic Below ---
newProfileBtn.addEventListener("click", () => {
  const newProfileName = prompt("Enter a name for the new profile");

  if (!newProfileName || newProfileName.trim() === "") {
    alert("Profile name cannot be empty.");
    return;
  }

  const trimmedName = newProfileName.trim();

  chrome.storage.sync.get("autofillProfiles", (result) => {
    let profiles = result.autofillProfiles || {};

    // Check if profile already exists
    if (profiles[trimmedName]) {
      if (
        confirm(
          `Profile "${trimmedName}" already exists. Choose another profile name.`
        )
      )
        return;
    } else {
      // Add the new profile to the local object with empty data
      profiles[trimmedName] = {};
    }

    // Save the updated profiles (now including the new one) and set it as active
    chrome.storage.sync.set(
      { autofillProfiles: profiles, activeProfileName: trimmedName },
      () => {
        // Update dropdown
        // Check if option already exists (in case of overwrite confirmation)
        let existingOption = profileSelect.querySelector(
          `option[value="${trimmedName}"]`
        );
        if (!existingOption) {
          const option = document.createElement("option");
          option.value = trimmedName;
          option.textContent = getProfileDisplayName(trimmedName, profiles);
          profileSelect.appendChild(option);
        }
        // Select the new/existing profile
        profileSelect.value = trimmedName;

        // Clear the form for the new profile
        loadProfileData({});

        statusDiv.textContent = `Switched to profile "${trimmedName}".`;
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 3000);
      }
    );
  });
});

// --- Add Delete Profile Logic Below ---

// --- Export Profiles ---
exportProfilesBtn.addEventListener("click", () => {
  chrome.storage.sync.get("autofillProfiles", (result) => {
    const profiles = result.autofillProfiles || {};
    const dataStr = JSON.stringify(profiles, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "BigTix_Autofill_Profiles.json";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
  });
});

// --- Import Profiles ---
importProfilesBtn.addEventListener("click", () => {
  importProfilesInput.value = ""; // reset file input
  importProfilesInput.click();
});

importProfilesInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported || typeof imported !== "object") {
        alert("Invalid profiles file.");
        return;
      }
      chrome.storage.sync.get(
        ["autofillProfiles", "activeProfileName"],
        (result) => {
          let profiles = result.autofillProfiles || {};
          // Merge imported profiles
          let importedCount = 0;
          for (const [name, data] of Object.entries(imported)) {
            profiles[name] = data;
            importedCount++;
          }
          chrome.storage.sync.set({ autofillProfiles: profiles }, () => {
            // Update dropdown UI
            profileSelect.innerHTML = "";
            Object.keys(profiles).forEach((name) => {
              const option = document.createElement("option");
              option.value = name;
              option.textContent = getProfileDisplayName(name, profiles);
              profileSelect.appendChild(option);
            });
            // If there was an active profile, keep it selected if it still exists
            let activeProfileName = result.activeProfileName;
            if (!activeProfileName || !profiles[activeProfileName]) {
              activeProfileName = Object.keys(profiles)[0];
            }
            profileSelect.value = activeProfileName;
            chrome.storage.sync.set({ activeProfileName }, () => {
              loadProfileData(profiles[activeProfileName] || {});
              statusDiv.textContent = `Imported ${importedCount} profile(s).`;
              setTimeout(() => {
                statusDiv.textContent = "";
              }, 3000);
            });
          });
        }
      );
    } catch (err) {
      alert("Failed to import profiles: Invalid JSON file.");
    }
  };
  reader.readAsText(file);
});

// --- Delete Profile ---
deleteProfileBtn.addEventListener("click", () => {
  const profileNameToDelete = profileSelect.value;

  if (!profileNameToDelete) {
    alert("No profile selected to delete.");
    return;
  }

  // Confirmation dialog
  if (
    !confirm(
      `Are you sure you want to delete the profile "${profileNameToDelete}"? This cannot be undone.`
    )
  ) {
    return; // User cancelled
  }

  chrome.storage.sync.get("autofillProfiles", (result) => {
    let profiles = result.autofillProfiles || {};

    if (!profiles[profileNameToDelete]) {
      console.error("Profile to delete not found in storage.");
      return;
    }

    // Delete the profile
    delete profiles[profileNameToDelete];

    const remainingProfileNames = Object.keys(profiles);
    let nextActiveProfileName = null;

    // Determine the next active profile
    if (remainingProfileNames.length > 0) {
      nextActiveProfileName = remainingProfileNames[0]; // Select the first remaining profile
    } else {
      // If no profiles left, create a new default one
      profiles["Default"] = {};
      nextActiveProfileName = "Default";
    }

    // Save the updated profiles and the new active profile name
    chrome.storage.sync.set(
      { autofillProfiles: profiles, activeProfileName: nextActiveProfileName },
      () => {
        // Update dropdown UI
        profileSelect.innerHTML = ""; // Clear dropdown
        const allProfileNames = Object.keys(profiles); // Get updated list including potential new 'Default'
        allProfileNames.forEach((name) => {
          const option = document.createElement("option");
          option.value = name;
          option.textContent = getProfileDisplayName(name, profiles);
          if (name === nextActiveProfileName) {
            option.selected = true;
          }
          profileSelect.appendChild(option);
        });

        // Load data for the new active profile
        loadProfileData(profiles[nextActiveProfileName] || {});

        statusDiv.textContent = `Profile "${profileNameToDelete}" deleted.`;
        setTimeout(() => {
          statusDiv.textContent = "";
        }, 3000);
      }
    );
  });
});
