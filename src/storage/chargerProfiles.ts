import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChargerProfile } from '../types/ChargerProfile';

const STORAGE_KEY = 'evapp_charger_profiles';

export const DEFAULT_CHARGER_PROFILE: ChargerProfile = {
  id: 'default',
  name: 'Home Charger',
  maxOutputKw: 7,
  efficiency: 88,
};

export async function loadChargerProfiles(): Promise<ChargerProfile[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  const profiles = json ? JSON.parse(json) : [];
  
  // Ensure default profile exists
  if (profiles.length === 0) {
    return [DEFAULT_CHARGER_PROFILE];
  }
  
  return profiles;
}

export async function saveChargerProfiles(profiles: ChargerProfile[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
}

export async function addChargerProfile(profile: ChargerProfile): Promise<ChargerProfile[]> {
  const profiles = await loadChargerProfiles();
  const updated = [...profiles, profile];
  await saveChargerProfiles(updated);
  return updated;
}

export async function updateChargerProfile(updated: ChargerProfile): Promise<ChargerProfile[]> {
  const profiles = await loadChargerProfiles();
  const next = profiles.map(p => (p.id === updated.id ? updated : p));
  await saveChargerProfiles(next);
  return next;
}

export async function deleteChargerProfile(id: string): Promise<ChargerProfile[]> {
  const profiles = await loadChargerProfiles();
  
  // Prevent deleting the last profile
  if (profiles.length <= 1) {
    throw new Error('Cannot delete the last charger profile');
  }
  
  const next = profiles.filter(p => p.id !== id);
  await saveChargerProfiles(next);
  return next;
}
