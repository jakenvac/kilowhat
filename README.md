# KiloWhat?

**kWh? No problem.**

A simple, privacy-focused mobile app for calculating electric vehicle charging times and energy requirements. Works completely offline with no account required.

[<img src="https://raw.githubusercontent.com/ImranR98/Obtainium/main/assets/graphics/badge_obtainium.png" alt="Get it on Obtainium" height="60">](http://apps.obtainium.imranr.dev/redirect.html?r=obtainium://add/https://github.com/jakenvac/kilowhat)

![Android](https://img.shields.io/badge/Android-3DDC84?style=flat-square&logo=android&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![License](https://img.shields.io/github/license/jakenvac/kilowhat?style=flat-square)
![Downloads](https://img.shields.io/github/downloads/jakenvac/kilowhat/total?style=flat-square&label=Downloads&logo=github)

## Features

### 🔋 Charging Calculator
- Calculate kWh needed to reach your target charge
- Estimate charging time based on charger specifications
- Real-time updates as you adjust values
- Accounts for charger efficiency losses

### 🚗 Multi-Car Management
- Save multiple vehicles with different battery capacities
- Set custom default target charge for each car
- Quick switching between vehicles
- Edit or delete cars anytime

### ⚙️ Customizable Settings
- Configure charger efficiency (default 88%)
- Set charger max output power (default 7 kW)
- Auto-focus current charge field (enabled by default)
- Remembers your last entered charge level (default 50%)

### 🔒 Privacy First
- **No internet required** - works completely offline
- **No user accounts** - no sign-up, no login
- **No tracking** - your data never leaves your device
- **No ads** - clean, focused experience

## Screenshots

<!-- Add screenshots here when available -->

## Installation

### For Users

#### Option 1: Install via Obtainium (Recommended)

[Obtainium](https://github.com/ImranR98/Obtainium) allows you to install and auto-update apps directly from GitHub releases.

1. **Install Obtainium** (if you don't have it):
   - Download from [F-Droid](https://f-droid.org/packages/dev.imranr.obtainium.fdroid/) or [GitHub](https://github.com/ImranR98/Obtainium/releases)

2. **Add KiloWhat? to Obtainium**:
   - Click this link on your Android device: [Get it on Obtainium](http://apps.obtainium.imranr.dev/redirect.html?r=obtainium://add/https://github.com/jakenvac/kilowhat)
   - Or manually add the app in Obtainium using: `https://github.com/jakenvac/kilowhat`

3. **Install and enjoy**:
   - Obtainium will automatically check for updates and notify you

#### Option 2: Direct APK Download

1. Go to the [Releases page](https://github.com/jakenvac/kilowhat/releases)
2. Download the latest `kilowhat-vX.X.X.apk` file
3. Install on your Android device
4. **Note:** You may need to enable "Install from Unknown Sources" in your Android settings

**Nightly Builds:** Pre-release nightly builds are also available on the releases page for testing the latest features.

### For Developers

#### Prerequisites
- Node.js 18+ and npm/yarn
- Android Studio with SDK 23+

#### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd evapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on your Android device/emulator**
   ```bash
   npm run android
   ```

#### First Run

The first time you run the app, Expo will build the native Android app locally. This may take several minutes.

**Note:** This app uses local native builds, not Expo Go. Make sure you have Android Studio set up with the Android SDK.

## Usage

### Adding Your First Car

1. Open the app - you'll see "Add vehicle" button where the vehicle selector would be
2. Tap "Add vehicle" to go directly to the add car screen
3. Enter your car's details:
   - **Car name:** e.g., "Zephyr E40"
   - **Battery capacity:** Usable kWh (e.g., 77.4)
   - **Default charge target:** e.g., 80%
4. Tap "Save"
5. You'll return to the calculator with your vehicle selected

### Calculating Charging Time

1. Select your car by tapping the vehicle name (opens a modal to switch between vehicles)
2. Enter your **current charge** percentage (auto-focused by default)
3. Enter your **target charge** percentage (pre-filled with your car's default)
4. The app instantly shows:
   - Energy needed in kWh
   - Estimated charging time
   - Charger efficiency applied

### Adjusting Settings

1. Tap the gear icon ⚙️ in the top-right corner
2. Adjust your charger specifications:
   - **Efficiency:** Typical values are 85-95% (default 88%)
   - **Max output:** Your charger's power rating in kW (default 7 kW)
   - **Auto-focus current charge:** Enable/disable automatic focus (default enabled)
3. All settings save automatically as you change them

## Technical Details

### Built With

- **React Native 0.83.2** - Cross-platform mobile framework
- **Expo ~55.0.5** - Development and build tooling
- **TypeScript 5.9.2** - Type-safe development
- **React Navigation 7.x** - Native navigation
- **AsyncStorage** - Local data persistence

### Project Structure

```
src/
├── screens/      # UI components (Calculator, AddEditCar, Settings)
├── storage/      # Data persistence layer (AsyncStorage)
└── types/        # TypeScript type definitions
```

### Local Native Builds

This project uses **local native builds** rather than Expo Go or EAS:
- Full support for custom native modules
- Build and run entirely on your machine
- No cloud build service required
- Complete control over native code

### Data Storage

All data is stored locally using AsyncStorage:
- **Cars:** Battery capacity, default targets, names
- **Settings:** Charger specs, preferences
- **No cloud sync** - your data stays on your device

## Development

### Type Checking

```bash
npx tsc --noEmit
```

### Project Documentation

For developers and AI agents working on this project:
- **CONTEXT.md** - Project purpose and technical decisions
- **ARCHITECTURE.md** - System design and data flow
- **AGENTS.md** - Coding standards and conventions

## Calculation Formula

The app uses this formula to calculate energy and time:

```
Energy Needed (kWh) = (Battery Capacity × (Target % - Current %)) / 100 / (Efficiency / 100)

Charging Time (hours) = Energy Needed / Charger Max Output
```

**Example:**
- Battery: 75 kWh
- Current charge: 20%
- Target charge: 80%
- Charger: 7 kW at 88% efficiency

```
Energy = (75 × (80 - 20)) / 100 / 0.88 = 51.14 kWh
Time = 51.14 / 7 = 7.31 hours (7h 18m)
```

## FAQ

### Why local builds instead of Expo Go?

We use local native builds to maintain flexibility for adding custom native modules in the future. This gives you full control without cloud service dependencies.

### Can I use this with Expo Go?

No, this app requires a development build. Run `npm run android` to build and install locally.

### Does this work offline?

Yes! The app works completely offline. No internet connection is ever required.

### Where is my data stored?

All data is stored locally on your device using React Native's AsyncStorage. Nothing is sent to any server.

### Can I sync my data across devices?

No, there is no sync feature. This is intentional to maintain privacy and simplicity.

### Why aren't the calculations perfectly accurate?

Real-world charging is affected by many factors:
- Battery temperature
- Battery management system limitations
- AC vs. DC charging differences
- Charging curve (slower near 100%)
- Ambient temperature

This app provides estimates based on simple linear calculations. Always allow extra time for charging.

### What charger efficiency should I use?

Typical values:
- **Home Level 2 (AC):** 85-92%
- **Public Level 2:** 88-93%
- **DC Fast Charging:** 90-95%

When in doubt, use 88% as a conservative estimate (the app's default).

## Contributing

Contributions are welcome! Please:
1. Read AGENTS.md for coding standards
2. Ensure TypeScript strict mode compliance
3. Test on Android
4. Update documentation if needed

### Platform Support

**Android:** Fully supported and tested

**iOS:** Planned for future release. The codebase is React Native and should work on iOS with minimal changes, but we need someone with an iOS device to test it. If you'd like to help with iOS support, please open an issue!

**Web:** Not currently supported or planned.

## License

MIT License - Free and open source

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**KiloWhat? - Making EV charging math simple.**
