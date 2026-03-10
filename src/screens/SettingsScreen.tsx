import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { loadSettings, saveSettings } from '../storage/settings';
import { DEFAULT_SETTINGS } from '../types/Settings';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen(_props: Props) {
  const [autoFocus, setAutoFocus] = useState(DEFAULT_SETTINGS.autoFocusCurrentCharge);

  useEffect(() => {
    loadSettings().then(s => {
      setAutoFocus(s.autoFocusCurrentCharge);
    });
  }, []);

  async function handleAutoFocusChange(value: boolean) {
    setAutoFocus(value);
    const current = await loadSettings();
    await saveSettings({ ...current, autoFocusCurrentCharge: value });
  }

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.toggleRow}>
        <View style={styles.toggleText}>
          <Text style={styles.fieldLabel}>Auto-focus current charge</Text>
          <Text style={styles.description}>
            Automatically open the keyboard on the current charge field when the app opens.
          </Text>
        </View>
        <Switch
          value={autoFocus}
          onValueChange={handleAutoFocusChange}
          trackColor={{ false: '#2a2a2a', true: '#00c896' }}
          thumbColor="#fff"
        />
      </View>

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>
          Version {Constants.expoConfig?.version ?? 'unknown'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 24,
    paddingBottom: 40,
  },
  field: {
    gap: 8,
  },
  fieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  fieldLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  fieldHint: {
    color: '#444',
    fontSize: 12,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
    paddingVertical: 14,
  },
  unit: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    color: '#444',
    fontSize: 13,
    lineHeight: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  toggleText: {
    flex: 1,
    gap: 6,
  },
  versionContainer: {
    alignItems: 'center',
    paddingTop: 16,
  },
  versionText: {
    color: '#444',
    fontSize: 12,
  },
});
