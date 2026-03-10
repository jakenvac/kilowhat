# Agent Guidelines for EV Charge Calculator

This document provides coding standards and operational guidelines for AI agents working in this codebase.

## Documentation Structure

This project uses multiple documentation files:

- **README.md** - User-facing documentation (installation, setup, usage)
- **CONTEXT.md** - Project purpose, features, and technical decisions
- **ARCHITECTURE.md** - System design, data flow, and key modules
- **TYPESCRIPT.md** - TypeScript standards, type safety, and Zod conventions
- **AGENTS.md** - This file: coding standards and conventions

**Start here:** For project context, read CONTEXT.md and ARCHITECTURE.md first. For TypeScript rules, see TYPESCRIPT.md.

## Quick Reference

**Tech Stack:** React Native 0.83.2 with Expo ~55.0.5, TypeScript 5.9.2, React Navigation 7.x  
**Target Platforms:** iOS, Android, Web  
**Build Strategy:** Local native builds only (no EAS, no Expo Go) - supports custom native modules

## Build, Test & Development Commands

### Development
```bash
# Start Expo dev server
npm start

# Run on Android device/emulator
npm run android

# Run on iOS device/simulator
npm run ios

# Run in web browser
npm run web
```

### Testing
**Status:** No testing framework configured. When adding tests:
- Recommended: Jest + React Native Testing Library
- Run single test: `npm test path/to/file.test.tsx` (after setup)
- Run all tests: `npm test` (after setup)

### Linting & Type Checking
**Status:** No linting configured.
- Type check: `npx tsc --noEmit`
- No ESLint or Prettier configured (follow existing code style)

### Build & Production
- Local native builds only (no EAS, no Expo Go)
- Native builds managed by Expo locally
- Supports custom native modules

## Project Structure

```
src/
├── screens/          # React Native screen components (default exports)
├── storage/          # AsyncStorage data layer (named exports)
└── types/            # TypeScript interfaces & type definitions
```

## Code Style Guidelines

### Imports
**Order & Organization:**
1. External libraries (React, React Native, navigation)
2. Internal modules (storage, types, utilities)
3. Group related imports with blank lines between categories

**Style:**
- Use relative imports (`../storage/cars`, `../types/Car`)
- No path aliases configured (no `@/` shortcuts)
- Omit file extensions for `.ts` and `.tsx` files
- Alphabetize multi-line imports from same module

**Example:**
```typescript
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { loadCars } from '../storage/cars';
import { Car } from '../types/Car';
import { RootStackParamList } from '../types/navigation';
```

### TypeScript Standards

**See TYPESCRIPT.md for complete TypeScript guidelines.**

**Quick rules:**
- Use `type` over `interface` (unless defining a contract)
- No `any` type - use `unknown` when type is truly unknown
- Explicit return types and parameter types required
- Prefer `readonly` and `const` for immutability
- Use Zod schemas for external data validation
- Object parameters for functions with 4+ arguments

**Example:**
```typescript
type Props = NativeStackScreenProps<RootStackParamList, 'Calculator'>;

export function CalculatorScreen({ navigation }: Props): JSX.Element {
  const [cars, setCars] = useState<Car[]>([]);  // Explicit array type
  const selectedCar = cars[0] ?? null;          // Inferred type
  return <View />;
}
```

### Naming Conventions
- **Components:** PascalCase with descriptive suffixes (`CalculatorScreen`, `AddEditCarScreen`)
- **Functions:** camelCase, descriptive verbs (`loadCars`, `handleSave`, `formatChargeTime`)
- **Constants:** SCREAMING_SNAKE_CASE for module-level (`DEFAULT_SETTINGS`, `STORAGE_KEY`)
- **State variables:** Descriptive nouns (`currentSoc`, `selectedIndex`, `cars`)
- **Handlers:** Prefix with `handle` (`handleCarSelect`, `handleSave`)
- **Boolean flags:** Use refs for non-render state (`targetEditedByUser`)

### Component Structure
**Function Components (Named Exports):**
```typescript
// Helper functions first (not exported)
function formatChargeTime(hours: number): string {
  // implementation
}

// Props type (not exported)
type Props = NativeStackScreenProps<RootStackParamList, 'Screen'>;

// Component (exported with named export)
export function ScreenName({ navigation, route }: Props) {
  // 1. State declarations
  const [state, setState] = useState<Type>(initial);
  
  // 2. Refs
  const someRef = useRef<Type>(null);
  
  // 3. Derived values
  const computed = /* calculation */;
  
  // 4. Callbacks/effects
  const callback = useCallback(async () => {}, [deps]);
  useEffect(() => {}, [deps]);
  
  // 5. Event handlers
  function handleEvent() {}
  
  // 6. JSX return
  return (/* JSX */);
}

// Styles at bottom
const styles = StyleSheet.create({});
```

### Async/Await & Promises
- **Always use async/await** for asynchronous operations
- **No explicit error handling** in storage layer (fail fast, crash on error)
- Use `Promise.all()` for parallel async operations
- Validation before async operations (user input, navigation params)

**Example:**
```typescript
// Good: Parallel async loading
const [loaded, settings] = await Promise.all([loadCars(), loadSettings()]);

// Good: Storage functions are simple, no try/catch
export async function loadCars(): Promise<Car[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

// Good: Validate before async
if (!trimmedName) {
  Alert.alert('Validation', 'Please enter a car name.');
  return;
}
await addCar(car);
```

### Error Handling
- **User input validation:** Alert.alert() before async operations
- **No try/catch in storage layer** - let errors propagate
- **Null coalescing** for safe defaults (`cars[0] ?? null`)
- **Guard clauses** for early returns (validation, edge cases)

### State Management
- **Local component state** with useState for UI state
- **AsyncStorage** for persistence (cars, settings)
- **useRef** for non-render state (flags, timers, input refs)
- **useCallback** for functions passed to child components or used in deps

### Styling
- **StyleSheet.create()** at component bottom
- **Inline styles** only for dynamic values (conditional opacity, colors)
- **Dark theme:** Background `#111`, cards `#1a1a1a`, borders `#333`
- **Primary color:** `#00c896` (teal/green)
- **Text hierarchy:** White `#fff`, gray `#aaa`, muted `#555`
- **Spacing:** Multiples of 4 (4, 8, 12, 16, 20, 24, 32)

### React Native Patterns
- Use `Pressable` over `TouchableOpacity` (modern API)
- Use `keyboardShouldPersistTaps="handled"` on ScrollView
- Use `returnKeyType` on TextInput for keyboard flow
- Platform-specific behavior with `Platform.OS`
- Use `SafeAreaProvider` at app root, `SafeAreaView` in screens when needed

## File Creation Guidelines
- **Screens:** Default export function component in `src/screens/[Name]Screen.tsx`
- **Types:** Named export interface/type in `src/types/[Name].ts`
- **Storage:** Named export functions in `src/storage/[domain].ts`
- **Utilities:** Named export functions, create `src/utils/` if needed

## Navigation Patterns
- **Type-safe routes:** Define all routes in `RootStackParamList` (types/navigation.ts)
- **Screen props:** `NativeStackScreenProps<RootStackParamList, 'RouteName'>`
- **Navigation actions:** `navigation.navigate('Route', { params })`
- **Header customization:** `navigation.setOptions()` in useEffect
- **Listen to focus:** `navigation.addListener('focus', callback)`

## Storage Patterns
- **One storage file per domain** (`cars.ts`, `settings.ts`)
- **Module-level constant** for storage key: `const STORAGE_KEY = 'evapp_domain';`
- **Simple CRUD functions:** load, save, add, update, delete
- **Return promises:** All storage functions return `Promise<T>`
- **Merge with defaults:** `{ ...DEFAULT_SETTINGS, ...JSON.parse(json) }`

## UUID Generation
- Import polyfill first: `import 'react-native-get-random-values';`
- Then import uuid: `import { v4 as uuidv4 } from 'uuid';`
- Use for entity IDs: `id: uuidv4()`

## Common Patterns to Follow
1. **Conditional rendering:** Use ternary or `&&` for simple cases, extract components for complex logic
2. **String parsing:** `parseFloat()` for decimals, `parseInt(value, 10)` for integers
3. **Numeric validation:** `if (isNaN(parsed) || parsed <= 0)`
4. **Optional chaining:** `route.params?.car`, `currentSocRef.current?.focus()`
5. **Safe array access:** Check for undefined due to `noUncheckedIndexedAccess`
   ```typescript
   const car = cars[index];
   if (car) {
     // Use car safely
   }
   ```
6. **Array operations:** Use `.map()`, `.filter()`, spread operator for immutability
7. **Form submission:** Validate → Create object → Call storage → Navigate back

## Anti-Patterns to Avoid
- ❌ No class components (use function components only)
- ❌ No default exports for utilities or types (named exports only)
- ❌ No `any` type (use proper types or `unknown`)
- ❌ No mutations of state/props (use immutable patterns)
- ❌ No console.log() in production code (remove before commit)
- ❌ No try/catch in storage layer unless specifically handling errors
- ❌ No inline styles for static values (use StyleSheet)

## Performance Considerations
- Use `useCallback` for functions in dependency arrays or passed to children
- Use `useRef` to avoid re-renders for non-visual state
- Memoize expensive calculations if needed (not currently required)
- Avoid unnecessary re-fetches (use navigation focus listener)

## When Making Changes
1. **Read existing code first** to understand patterns and conventions
2. **Match the existing style** exactly (spacing, naming, structure)
3. **Type everything** - leverage TypeScript strict mode
4. **Test on target platform** - use Expo dev server to verify changes
5. **Keep components focused** - single responsibility principle
6. **Update types** when changing data structures (Car, Settings, navigation params)
7. **Update documentation** when changes affect:
   - Project scope or features → Update CONTEXT.md
   - System architecture or data flow → Update ARCHITECTURE.md
   - TypeScript patterns, types, or validation → Update TYPESCRIPT.md
   - Coding patterns or conventions → Update AGENTS.md
   - User setup, installation, or usage → Update README.md

## Documentation Maintenance

### When to Update Documentation

**Adding/Removing Features:**
- Update CONTEXT.md with new core features or capabilities
- Update README.md with user-facing changes and usage instructions
- Update ARCHITECTURE.md if new screens, modules, or patterns are introduced

**Refactoring Architecture:**
- Update ARCHITECTURE.md with new directory structure or data flow
- Update AGENTS.md if coding patterns or conventions change
- Update README.md if setup or build process changes

**Changing Type System or Validation:**
- Update TYPESCRIPT.md when adding Zod schemas or changing type patterns
- Update ARCHITECTURE.md if type structure affects system design
- Update AGENTS.md if type usage affects coding conventions

**Changing Dependencies or Tech Stack:**
- Update CONTEXT.md with rationale for technical decisions
- Update TYPESCRIPT.md if TypeScript patterns or Zod usage changes
- Update AGENTS.md with new coding patterns or conventions
- Update README.md with new installation or setup requirements

**Important Guidelines:**
- Always keep documentation in sync with code changes
- If uncertain whether to update docs, ask the user
- Stale documentation is worse than no documentation
- Document the "why" not just the "what"
