# Project Context

## What This Is

**KiloWhat?** is an offline-first mobile application for electric vehicle owners to quickly calculate charging times and energy requirements. The app helps users estimate how long it will take to charge their EV based on current battery state, target charge level, and charger specifications.

The name "KiloWhat?" is a playful take on kilowatt-hours (kWh) - the exact question EV owners ask when trying to figure out charging.

## Core Features

### Car Management
- Add, edit, and delete multiple vehicles
- Store battery capacity (kWh) for each vehicle
- Set default target charge percentage per vehicle
- Persist car data locally with AsyncStorage

### Charging Calculator
- Input current state of charge (SOC) percentage
- Set target state of charge percentage
- Calculate kWh needed to reach target
- Estimate charging time based on charger output
- Account for charger efficiency losses
- Real-time updates as inputs change

### Settings
- Configure charger efficiency (default 90%)
- Set charger max output power (default 7.4 kW)
- Enable/disable auto-focus on current charge field
- Save last entered current charge value
- Persist settings across app sessions

## Target Users

- EV owners who charge at home or public stations
- Users managing multiple electric vehicles (family, fleet)
- People who want quick offline estimates without complex apps
- Users who prefer privacy (no accounts, no tracking, no internet required)

## Key Constraints

### Privacy & Offline First
- No backend server or API calls
- No user accounts or authentication
- No analytics or tracking
- Works completely offline
- All data stored locally on device

### Simplicity
- Single-purpose tool (charging calculations only)
- Minimal UI with essential features only
- No complex workflows or nested navigation
- Fast startup and instant calculations

### Technical Constraints
- Local native builds only (no EAS, no Expo Go)
- Supports custom native modules if needed
- Cross-platform (iOS, Android, Web)
- Small app size and minimal dependencies

## Why These Technical Decisions

### React Native + Expo
- **Cross-platform:** Single codebase for iOS, Android, and Web
- **Native feel:** Real native components, not web views
- **Fast development:** Hot reload, extensive library ecosystem
- **Expo benefits:** Simplified setup while maintaining native build capability

### TypeScript with Strict Mode
- **Type safety:** Catch errors at compile time
- **Better refactoring:** Rename and restructure with confidence
- **Self-documenting:** Types serve as inline documentation
- **IDE support:** Better autocomplete and error detection

### AsyncStorage (No Backend)
- **Privacy:** Data never leaves the device
- **Offline:** Works without internet connection
- **Simplicity:** No server maintenance or API complexity
- **Speed:** Instant data access, no network latency

### React Navigation
- **Type-safe routing:** Compile-time checks for navigation params
- **Native feel:** Platform-appropriate transitions and gestures
- **Mature library:** Battle-tested with strong community support

### Local Native Builds
- **Custom modules:** Ability to add native functionality if needed
- **Full control:** Not limited by Expo Go constraints
- **Development flexibility:** Can install any native module
- **No EAS dependency:** Build and test locally without cloud services

## Non-Goals

This project explicitly does NOT aim to:
- Track historical charging sessions
- Provide route planning or trip calculations
- Show nearby charging stations or maps
- Integrate with vehicle APIs or OBD-II
- Offer social features or data sharing
- Generate reports or analytics
- Support payment or subscription features
- Sync data across devices or to cloud

## Future Considerations

Potential features that align with project goals:
- Multiple charger profiles (home vs. public)
- Battery degradation tracking over time
- Temperature-adjusted charging estimates
- Cost calculations based on electricity rates
- Export/import car configurations
- Dark/light theme toggle

Features that would violate project principles:
- Anything requiring internet connectivity
- User accounts or cloud sync
- Advertising or monetization
- Data collection or analytics
- Social or sharing features
