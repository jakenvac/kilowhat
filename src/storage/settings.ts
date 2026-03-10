import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_SETTINGS, Settings } from '../types/Settings';

const STORAGE_KEY = 'evapp_settings';

export async function loadSettings(): Promise<Settings> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? { ...DEFAULT_SETTINGS, ...JSON.parse(json) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings: Settings): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}
