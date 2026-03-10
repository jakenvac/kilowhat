export type Settings = {
  readonly chargerEfficiency: number; // DEPRECATED: kept for migration, use chargerProfiles instead
  readonly chargerMaxOutputKw: number; // DEPRECATED: kept for migration, use chargerProfiles instead
  readonly selectedChargerProfileId: string;
  readonly autoFocusCurrentCharge: boolean;
  readonly lastCurrentSoc: number; // persisted between sessions
};

export const DEFAULT_SETTINGS: Settings = {
  chargerEfficiency: 88, // DEPRECATED
  chargerMaxOutputKw: 7, // DEPRECATED
  selectedChargerProfileId: 'default',
  autoFocusCurrentCharge: true,
  lastCurrentSoc: 50,
};
