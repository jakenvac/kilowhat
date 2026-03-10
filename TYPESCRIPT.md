# TypeScript Guidelines

This document defines strict TypeScript standards for this codebase. All code must comply with these rules.

## Core Principles

1. **Strict mode enabled** - No exceptions
2. **Explicit types** - Make types visible and clear
3. **Immutability** - Prefer readonly and const
4. **Type safety** - No `any`, use `unknown` when type is truly unknown
5. **Validation** - Use Zod schemas for runtime validation

## Type vs Interface

### Use `type` by Default

**Prefer `type` for:**
- Object shapes that represent data
- Union types
- Intersection types
- Mapped types
- Type aliases
- React component props

```typescript
// ✅ Good - Use type for data structures
type Car = {
  readonly id: string;
  name: string;
  batteryCapacityKwh: number;
  defaultTargetSoc: number;
};

// ✅ Good - Use type for unions
type ChargingStatus = 'idle' | 'charging' | 'complete' | 'error';

// ✅ Good - Use type for props
type CalculatorProps = {
  initialSoc: number;
  onCalculate: (result: ChargeResult) => void;
};
```

### Use `interface` Only for Contracts

**Use `interface` only when:**
- Defining a contract that can be implemented
- Creating an extensible API boundary
- Defining object-oriented class contracts

```typescript
// ✅ Good - Use interface for contracts
interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

// ✅ Good - Implementation of contract
class AsyncStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }
  // ...
}
```

### Why `type` Over `interface`?

1. **Consistency** - One way to define shapes reduces cognitive load
2. **Flexibility** - Types support unions, intersections, and more
3. **Composition** - Easier to compose with union and intersection types
4. **Immutability** - Types work better with readonly modifiers

## Strict Type Rules

### No `any` Type - Ever

```typescript
// ❌ Bad - Never use any
function processData(data: any) {
  return data.value;
}

// ❌ Bad - No implicit any
function processData(data) {  // Error: Parameter 'data' implicitly has 'any' type
  return data.value;
}

// ✅ Good - Use specific types
function processData(data: CarData) {
  return data.value;
}

// ✅ Good - Use unknown when type is truly unknown
function processData(data: unknown) {
  if (isCarData(data)) {
    return data.value;
  }
  throw new Error('Invalid data type');
}
```

### Use `unknown` for Truly Unknown Types

When you don't know the type at compile time, use `unknown` and narrow with type guards:

```typescript
// ✅ Good - Use unknown for external data
async function loadFromStorage(key: string): Promise<unknown> {
  const json = await AsyncStorage.getItem(key);
  return json ? JSON.parse(json) : null;
}

// ✅ Good - Narrow with type guard
function isCar(value: unknown): value is Car {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'batteryCapacityKwh' in value
  );
}

// ✅ Good - Use type guard before accessing
const data = await loadFromStorage('car');
if (isCar(data)) {
  console.log(data.name);  // Safe access
}
```

### Explicit Return Types

Always specify return types for functions - never rely on inference for public APIs:

```typescript
// ❌ Bad - Implicit return type
function calculateEnergy(capacity: number, socDelta: number) {
  return (capacity * socDelta) / 100;
}

// ✅ Good - Explicit return type
function calculateEnergy(capacity: number, socDelta: number): number {
  return (capacity * socDelta) / 100;
}

// ✅ Good - Explicit async return type
async function loadCars(): Promise<Car[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

// ✅ Good - Explicit void return
function logError(message: string): void {
  console.error(message);
}
```

### Explicit Parameter Types

Never rely on type inference for function parameters:

```typescript
// ❌ Bad - Missing parameter types
function updateCar(id, updates) {
  // ...
}

// ✅ Good - Explicit parameter types
function updateCar(id: string, updates: Partial<Car>): Promise<Car> {
  // ...
}
```

## Immutability

### Prefer `readonly` for Properties

```typescript
// ✅ Good - Readonly properties for immutable data
type Car = {
  readonly id: string;           // Never changes after creation
  name: string;                  // Mutable
  batteryCapacityKwh: number;    // Mutable
  defaultTargetSoc: number;      // Mutable
};

// ✅ Good - Fully readonly type
type CarId = {
  readonly id: string;
};

// ✅ Good - Readonly arrays
type CarList = {
  readonly cars: readonly Car[];
};
```

### Use `const` for Variables

```typescript
// ✅ Good - Use const by default
const STORAGE_KEY = 'evapp_cars';
const defaultEfficiency = 90;

// ✅ Good - Use const for objects (object is immutable reference)
const settings = { efficiency: 90, maxOutput: 7.4 };

// ⚠️ Acceptable - Use let only when reassignment is needed
let currentSoc = 20;
currentSoc = 30;  // Reassignment needed
```

### Immutable Data Updates

```typescript
// ❌ Bad - Mutation
function addCar(cars: Car[], newCar: Car): Car[] {
  cars.push(newCar);  // Mutates input
  return cars;
}

// ✅ Good - Immutable update
function addCar(cars: readonly Car[], newCar: Car): Car[] {
  return [...cars, newCar];
}

// ✅ Good - Immutable object update
function updateCar(car: Car, updates: Partial<Car>): Car {
  return { ...car, ...updates };
}

// ✅ Good - Immutable array update
function updateCarInList(cars: readonly Car[], id: string, updates: Partial<Car>): Car[] {
  return cars.map(car => 
    car.id === id ? { ...car, ...updates } : car
  );
}
```

### Readonly Parameters

Use `readonly` for parameters that should not be mutated:

```typescript
// ✅ Good - Readonly array parameter
function findCarById(cars: readonly Car[], id: string): Car | undefined {
  return cars.find(car => car.id === id);
}

// ✅ Good - Readonly object parameter
function formatCar(car: Readonly<Car>): string {
  return `${car.name} (${car.batteryCapacityKwh} kWh)`;
}
```

## Zod Schemas for Validation

### When to Use Zod

**Use Zod schemas when:**
- Consuming external data (API responses, localStorage, user input)
- Data has validation rules (ranges, formats, constraints)
- Runtime type safety is required
- Parsing and validation are needed

**Use plain TypeScript types when:**
- Data is purely internal and type-safe
- No runtime validation needed
- Performance is critical (Zod adds overhead)

### Schema Naming Convention

```typescript
// ✅ Good - Schema naming: lowercase + "Schema" suffix
const carSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  batteryCapacityKwh: z.number().positive(),
  defaultTargetSoc: z.number().min(0).max(100),
});

// ✅ Good - Inferred type: PascalCase, same base name
type Car = z.infer<typeof carSchema>;

// ✅ Good - Co-locate schema and type
export const settingsSchema = z.object({
  chargerEfficiency: z.number().min(50).max(100),
  chargerMaxOutputKw: z.number().positive(),
  autoFocusCurrentCharge: z.boolean(),
  lastCurrentSoc: z.number().min(0).max(100),
});

export type Settings = z.infer<typeof settingsSchema>;
```

### Schema-Driven Types

**The schema is the source of truth, not the type:**

```typescript
// ✅ Good - Schema defines validation and type
const userInputSchema = z.object({
  currentSoc: z.number().min(0).max(100),
  targetSoc: z.number().min(0).max(100),
});

type UserInput = z.infer<typeof userInputSchema>;

// ✅ Good - Use schema for parsing
function parseUserInput(raw: unknown): UserInput {
  return userInputSchema.parse(raw);
}

// ❌ Bad - Don't define type separately when using Zod
type UserInput = { currentSoc: number; targetSoc: number };  // Duplication!
const userInputSchema = z.object({ /* same structure */ });
```

### Validation Examples

```typescript
// ✅ Good - Parse external data with Zod
async function loadCars(): Promise<Car[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  if (!json) return [];
  
  const raw = JSON.parse(json);
  return z.array(carSchema).parse(raw);  // Runtime validation
}

// ✅ Good - Safe parsing with error handling
async function loadSettings(): Promise<Settings> {
  const json = await AsyncStorage.getItem(SETTINGS_KEY);
  if (!json) return DEFAULT_SETTINGS;
  
  const raw = JSON.parse(json);
  const result = settingsSchema.safeParse(raw);
  
  if (!result.success) {
    console.error('Invalid settings:', result.error);
    return DEFAULT_SETTINGS;
  }
  
  return { ...DEFAULT_SETTINGS, ...result.data };
}

// ✅ Good - Validate user input
function validateCarForm(input: unknown): Car | null {
  const result = carSchema.safeParse(input);
  return result.success ? result.data : null;
}
```

### Zod Schema Composition

```typescript
// ✅ Good - Compose schemas
const baseCarSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  batteryCapacityKwh: z.number().positive(),
});

// ✅ Good - Extend schemas
const carWithTargetSchema = baseCarSchema.extend({
  defaultTargetSoc: z.number().min(0).max(100),
});

// ✅ Good - Partial schemas for updates
const carUpdateSchema = carWithTargetSchema.partial().required({ id: true });

type CarUpdate = z.infer<typeof carUpdateSchema>;
```

## Function Parameter Guidelines

### 4-Parameter Rule

Functions with more than 4 parameters should use an object parameter:

```typescript
// ❌ Bad - Too many positional parameters
function calculateCharge(
  batteryCapacity: number,
  currentSoc: number,
  targetSoc: number,
  efficiency: number,
  maxOutput: number
): ChargeResult {
  // ...
}

// ✅ Good - Use object parameter
type CalculateChargeParams = {
  batteryCapacity: number;
  currentSoc: number;
  targetSoc: number;
  efficiency: number;
  maxOutput: number;
};

function calculateCharge(params: CalculateChargeParams): ChargeResult {
  const { batteryCapacity, currentSoc, targetSoc, efficiency, maxOutput } = params;
  // ...
}

// ✅ Good - Named parameters at call site
const result = calculateCharge({
  batteryCapacity: 75,
  currentSoc: 20,
  targetSoc: 80,
  efficiency: 90,
  maxOutput: 7.4,
});
```

### Benefits of Object Parameters

1. **Named arguments** - Clear what each value represents
2. **Flexible order** - No need to remember parameter order
3. **Optional parameters** - Easy to add with `Partial<T>`
4. **Extensibility** - Add new parameters without breaking calls
5. **Destructuring** - Clean syntax in function body

### 1-3 Parameters: Use Positional

For functions with few parameters, positional is fine:

```typescript
// ✅ Good - 1-3 positional parameters are clear
function formatPercentage(value: number): string {
  return `${value}%`;
}

function calculateEnergy(capacity: number, socDelta: number): number {
  return (capacity * socDelta) / 100;
}

function updateCar(id: string, updates: Partial<Car>): Promise<Car> {
  // ...
}
```

### Optional Parameters

Use object parameters with `Partial<T>` for optional parameters:

```typescript
// ✅ Good - Optional parameters with object
type CreateCarParams = {
  name: string;
  batteryCapacityKwh: number;
  defaultTargetSoc?: number;  // Optional
};

function createCar(params: CreateCarParams): Car {
  const { name, batteryCapacityKwh, defaultTargetSoc = 80 } = params;
  return {
    id: uuidv4(),
    name,
    batteryCapacityKwh,
    defaultTargetSoc,
  };
}

// ❌ Bad - Many optional positional parameters
function createCar(
  name: string,
  batteryCapacityKwh: number,
  defaultTargetSoc?: number,
  color?: string,
  year?: number
): Car {
  // Hard to call: createCar('Zephyr', 75, undefined, undefined, 2023)
}
```

## Type Composition

### Union Types

```typescript
// ✅ Good - Discriminated unions
type LoadingState = 
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Car[] }
  | { status: 'error'; error: string };

function handleState(state: LoadingState): void {
  switch (state.status) {
    case 'idle':
      // No data or error
      break;
    case 'loading':
      // Show spinner
      break;
    case 'success':
      // state.data is available
      console.log(state.data);
      break;
    case 'error':
      // state.error is available
      console.error(state.error);
      break;
  }
}
```

### Intersection Types

```typescript
// ✅ Good - Combine types with intersection
type Timestamped = {
  createdAt: Date;
  updatedAt: Date;
};

type CarWithTimestamps = Car & Timestamped;

// ✅ Good - Multiple intersections
type AuditInfo = {
  createdBy: string;
  modifiedBy: string;
};

type AuditedCar = Car & Timestamped & AuditInfo;
```

### Utility Types

```typescript
// ✅ Good - Use built-in utility types
type PartialCar = Partial<Car>;              // All properties optional
type RequiredCar = Required<Car>;            // All properties required
type ReadonlyCar = Readonly<Car>;            // All properties readonly
type CarWithoutId = Omit<Car, 'id'>;        // Exclude properties
type CarIdAndName = Pick<Car, 'id' | 'name'>; // Select properties

// ✅ Good - Combine utilities
type CarUpdate = Partial<Omit<Car, 'id'>> & { id: string };
```

## Type Guards

### User-Defined Type Guards

```typescript
// ✅ Good - Type guard with predicate
function isCar(value: unknown): value is Car {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof value.id === 'string' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'batteryCapacityKwh' in value &&
    typeof value.batteryCapacityKwh === 'number' &&
    'defaultTargetSoc' in value &&
    typeof value.defaultTargetSoc === 'number'
  );
}

// ✅ Good - Use type guard
function processCar(data: unknown): void {
  if (isCar(data)) {
    console.log(data.name);  // TypeScript knows data is Car
  }
}
```

### Discriminated Union Type Guards

```typescript
// ✅ Good - Discriminated unions are self-narrowing
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };

function handleResult<T, E>(result: Result<T, E>): void {
  if (result.success) {
    // TypeScript knows result.value exists
    console.log(result.value);
  } else {
    // TypeScript knows result.error exists
    console.error(result.error);
  }
}
```

## Generics

### Generic Functions

```typescript
// ✅ Good - Generic with constraints
function findById<T extends { id: string }>(
  items: readonly T[],
  id: string
): T | undefined {
  return items.find(item => item.id === id);
}

// ✅ Good - Multiple type parameters
function mapResult<T, U>(
  value: T,
  mapper: (val: T) => U
): U {
  return mapper(value);
}
```

### Generic Types

```typescript
// ✅ Good - Generic type with constraints
type Result<T, E = Error> = 
  | { success: true; value: T }
  | { success: false; error: E };

// ✅ Good - Usage
type CarResult = Result<Car, string>;
type SettingsResult = Result<Settings>;  // Uses default Error
```

## Anti-Patterns

### Never Do These

```typescript
// ❌ Bad - Using any
const data: any = JSON.parse(json);

// ❌ Bad - Type assertion without validation
const car = data as Car;

// ❌ Bad - Non-null assertion without checking
const car = cars.find(c => c.id === id)!;

// ❌ Bad - Disabling strict checks
// @ts-ignore
const value = data.missingProperty;

// ❌ Bad - Using interface for data
interface Car {
  id: string;
  name: string;
}

// ❌ Bad - Mutating parameters
function addCar(cars: Car[], car: Car) {
  cars.push(car);
}
```

## tsconfig.json Requirements

Ensure your `tsconfig.json` has these settings:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    // Strict Type-Checking Options
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    
    // Additional Checks
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "noPropertyAccessFromIndexSignature": true,
    
    // Module Resolution
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

**Key strict settings:**
- `noUncheckedIndexedAccess` - Array/object index access returns `T | undefined`
- `noPropertyAccessFromIndexSignature` - Enforces bracket notation for index signatures
- All standard strict mode flags enabled

## Summary Checklist

When writing TypeScript code, ensure:

- ✅ `type` used instead of `interface` (unless defining a contract)
- ✅ No `any` type anywhere (use `unknown` instead)
- ✅ Explicit return types on all functions
- ✅ Explicit types on all function parameters
- ✅ `readonly` used for immutable properties
- ✅ `const` used for variables (unless reassignment needed)
- ✅ Zod schemas for external data and validation
- ✅ Schema naming: `carSchema` → `type Car`
- ✅ Object parameters for 4+ arguments
- ✅ Type guards for narrowing `unknown`
- ✅ No mutations (use spread operators)
- ✅ Strict mode enabled in tsconfig.json
