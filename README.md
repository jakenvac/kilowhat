# EV Charge Calculator

A simple, privacy-focused mobile app for calculating electric vehicle charging times and energy requirements. Works completely offline with no account required.

![Platform Support](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.83.2-61dafb)
![Expo](https://img.shields.io/badge/Expo-~55.0.5-000020)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178c6)

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
- Configure charger efficiency (default 90%)
- Set charger max output power (default 7.4 kW)
- Auto-focus current charge field option
- Remembers your last entered charge level

### 🔒 Privacy First
- **No internet required** - works completely offline
- **No user accounts** - no sign-up, no login
- **No tracking** - your data never leaves your device
- **No ads** - clean, focused experience

## Screenshots

<!-- Add screenshots here when available -->

## Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 23+

### Setup

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

4. **Run on your device/emulator**
   
   For Android:
   ```bash
   npm run android
   ```
   
   For iOS:
   ```bash
   npm run ios
   ```
   
   For Web:
   ```bash
   npm run web
   ```

### First Run

The first time you run on iOS or Android, Expo will build the native app locally. This may take several minutes.

**Note:** This app uses local native builds, not Expo Go. Make sure you have the appropriate development environment set up (Xcode for iOS, Android Studio for Android).

## Usage

### Adding Your First Car

1. Open the app - you'll see "No cars saved - tap to add one"
2. Tap the empty card to go to car management
3. Tap the "+" button in the header
4. Enter your car's details:
   - **Car name:** e.g., "Tesla Model 3"
   - **Battery capacity:** Usable kWh (e.g., 77.4)
   - **Default charge target:** e.g., 80%
5. Tap "Save"

### Calculating Charging Time

1. Select your car from the vehicle selector
2. Enter your **current charge** percentage
3. Enter your **target charge** percentage (or use the default)
4. The app instantly shows:
   - Energy needed in kWh
   - Estimated charging time
   - Efficiency adjustment applied

### Adjusting Settings

1. Tap the gear icon ⚙️ in the top-right corner
2. Adjust your charger specifications:
   - **Efficiency:** Typical values are 85-95%
   - **Max output:** Your charger's power rating in kW
3. Settings save automatically

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
├── screens/      # UI components (Calculator, CarManagement, etc.)
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
- Charger: 7.4 kW at 90% efficiency

```
Energy = (75 × (80 - 20)) / 100 / 0.90 = 50 kWh
Time = 50 / 7.4 = 6.76 hours (6h 46m)
```

## FAQ

### Why local builds instead of Expo Go?

We use local native builds to maintain flexibility for adding custom native modules in the future. This gives you full control without cloud service dependencies.

### Can I use this with Expo Go?

No, this app requires a development build. Run `npm run ios` or `npm run android` to build and install locally.

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

When in doubt, use 90% as a conservative estimate.

## Contributing

Contributions are welcome! Please:
1. Read AGENTS.md for coding standards
2. Ensure TypeScript strict mode compliance
3. Test on both iOS and Android
4. Update documentation if needed

## License

<!-- Add your license here -->

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Made for EV owners who want a simple, private, offline charging calculator.**
