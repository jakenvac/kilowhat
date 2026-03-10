export interface Settings {
  chargerEfficiency: number; // percentage, e.g. 88
  chargerMaxOutputKw: number; // kilowatts, e.g. 7
  autoFocusCurrentCharge: boolean;
  lastCurrentSoc: number; // persisted between sessions
}

export const DEFAULT_SETTINGS: Settings = {
  chargerEfficiency: 88,
  chargerMaxOutputKw: 7,
  autoFocusCurrentCharge: true,
  lastCurrentSoc: 50,
};
