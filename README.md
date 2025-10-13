# 🎟️ Autofill AIO

Chrome extension that automatically fills checkout forms on ticketing and payment platforms. Built to streamline the checkout process with multi-profile management and intelligent form detection.

## ✨ Features

- **🔄 Multi-Profile Management** - Create, switch between, import, and export multiple autofill profiles
- **💳 Smart Payment Autofill** - Automatically fills personal details, contact information, and payment card data
- **🎯 Platform Support**
  - BigTix (bigtix.io)
  - RedDot Payment Gateway (reddotpayment.com)
  - PGW Payment Gateway (pgw-ui.2c2p.com)
- **📸 Screenshot Capture** - Automatically captures cart summary before proceeding to payment
- **⚡ Auto-Payment Toggle** - Option to enable/disable automatic payment submission
- **🌙 Modern Dark UI** - Clean, responsive interface built with Tailwind CSS
- **🔐 Secure Storage** - Profile data stored locally using Chrome's sync storage API

## 🚀 How It Works

The extension uses content scripts injected into checkout pages that:

1. Detect when you're on a supported checkout page
2. Wait for form elements to load dynamically
3. Automatically populate fields with your saved profile data
4. Optionally proceed through payment steps

## 📋 Profile Data

Each profile stores:

- Name
- Card number
- Card expiry (month/year)
- CVV
- Card type (VISA/MasterCard)

Additional data like email addresses and phone numbers are automatically generated with random variations for testing purposes.

## 🎯 Usage

1. Click the extension icon in your Chrome toolbar
2. Create a new profile or use the default one
3. Fill in your details and card information
4. Save the profile
5. Navigate to a supported checkout page
6. Watch as the extension automatically fills your information

## ⚙️ Configuration

- **Profiles**: Manage multiple profiles for different cards or use cases
- **Import/Export**: Back up your profiles or share them across devices
- **Auto-Payment**: Toggle whether to automatically proceed to payment

## 🔒 Privacy & Security

- All profile data is stored locally using Chrome's sync storage
- No data is sent to external servers
- Email addresses and phone numbers are randomly generated to prevent detection
