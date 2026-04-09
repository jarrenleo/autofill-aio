# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Build Tailwind CSS (watch mode)
npm run build:css
```

There are no test or lint scripts. Load the extension in Chrome via `chrome://extensions` → Load unpacked.

## Architecture

This is a **Chrome Extension (Manifest V3)** that autofills checkout forms on ticketing sites.

### Injection Flow

`background.js` is the service worker. It listens on `chrome.tabs.onUpdated` and matches the tab URL against `allowedUrlPatterns` (a regex array, index-based). On match, it calls `chrome.scripting.executeScript` to inject the appropriate module along with its dependencies.

```
Tab URL match → background.js → injects [names_array.js, emails_array.js, helper.js, modules/<platform>.js]
```

The exception is **Razorpay**, which is declared directly in `manifest.json` as a content script (all_frames, run_at document_idle) rather than injected by background.js.

### Module Pattern

Each `modules/*.js` file:
- Is an IIFE with a guard flag (e.g. `window.__bigtixAutofillLoaded`) to prevent double-execution
- Reads `autofillProfiles` and `activeProfileName` from `chrome.storage.sync`
- Calls `generateProfileData(details)` which branches on `customToggleOn`:
  - **Custom OFF**: uses `details.firstName` + random last name, random phone/IC/nationality
  - **Custom ON**: uses all fields from the stored profile verbatim
- Uses `getEmailFromProfile()` which branches on `useEmailList`:
  - **OFF**: generates a catch-all email (`name.randomletters+numbers@domain`)
  - **ON**: picks a random email from `window.emails` (iCloud addresses)
- `toPayEnabled` (global, not per-profile) controls whether the pay button is auto-clicked

### Shared Utilities (`utils/`)

| File | Purpose |
|------|---------|
| `helper.js` | `fillInput`, `waitForElement`, `getEmailFromProfile`, random generators |
| `names_array.js` | Exposes `window.names` — array of first names |
| `emails_array.js` | Exposes `window.emails` — array of iCloud emails |

`helper.js` functions are globals (no import/export) because modules are injected as plain scripts, not ES modules.

### Storage Schema (`chrome.storage.sync`)

```js
{
  autofillProfiles: {
    "ProfileName": {
      firstName, lastName, useEmailList,
      phoneCountry, phoneNumber, ic, nationality,
      cardNumber, cardExpiryMonth, cardExpiryYear, cardCvv, cardType,
      customToggleOn, quantity
    }
  },
  activeProfileName: "ProfileName",
  toPayEnabled: true
}
```

### Popup (`popup.html` + `popup.js`)

Manages profiles in `chrome.storage.sync`. Supports create, delete, import (JSON), export (JSON). The `customDetailsToggle` shows/hides extra personal detail fields. Profile dropdown appends `(Custom)` indicator when `customToggleOn` is true.

### Supported Platforms

| Module | URL Pattern |
|--------|------------|
| `bms.js` / `bigtix.js` | bigtix.io, bookmyshow.com booking/checkout |
| `reddot.js` | reddotpayment.com |
| `pgw.js` | pgw-ui.2c2p.com |
| `t2u.js` | ticket2u.com.my |
| `op.js` | onlinepayment.com.my |
| `sistic.js` | sistic.com.sg |
| `stripe.js` | checkout.stripe.com |
| `etix.js` | booking.etix.my |
| `secured-bot.js` | secured-bot.com/etix |
| `razorpay.js` | api.razorpay.com (content script) |

### Adding a New Platform

1. Add the URL regex to `allowedUrlPatterns` in `background.js`
2. Add a `case` in the switch statement injecting `["utils/names_array.js", "utils/emails_array.js", "utils/helper.js", "modules/<new>.js"]`
3. Create `modules/<new>.js` following the IIFE + guard pattern, calling `chrome.storage.sync.get` and using the shared helper globals
