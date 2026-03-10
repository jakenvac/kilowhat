import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { loadSettings, saveSettings } from '../storage/settings';
import { DEFAULT_SETTINGS } from '../types/Settings';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation }: Props) {
  const [efficiency, setEfficiency] = useState(String(DEFAULT_SETTINGS.chargerEfficiency));
  const [maxOutput, setMaxOutput] = useState(String(DEFAULT_SETTINGS.chargerMaxOutputKw));
  const [autoFocus, setAutoFocus] = useState(DEFAULT_SETTINGS.autoFocusCurrentCharge);

  useEffect(() => {
    loadSettings().then(s => {
      setEfficiency(String(s.chargerEfficiency));
      setMaxOutput(String(s.chargerMaxOutputKw));
      setAutoFocus(s.autoFocusCurrentCharge);
    });
  }, []);

  async function handleSave() {
    const parsedEfficiency = parseFloat(efficiency);
    const parsedMaxOutput = parseFloat(maxOutput);

    if (isNaN(parsedEfficiency) || parsedEfficiency <= 0 || parsedEfficiency > 100) {
      Alert.alert('Validation', 'Charger efficiency must be between 1 and 100.');
      return;
    }
    if (isNaN(parsedMaxOutput) || parsedMaxOutput <= 0) {
      Alert.alert('Validation', 'Charger max output must be a positive number.');
      return;
    }

    const current = await loadSettings();
    await saveSettings({
      ...current,
      chargerEfficiency: parsedEfficiency,
      chargerMaxOutputKw: parsedMaxOutput,
      autoFocusCurrentCharge: autoFocus,
    });
    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">

        <Pressable
          style={styles.manageCarsButton}
          onPress={() => navigation.navigate('CarManagement')}
        >
          <Text style={styles.manageCarsText}>Manage Cars</Text>
        </Pressable>
        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Charger efficiency</Text>
            <Text style={styles.fieldHint}>Typical home 7kW wallbox: 88%</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={efficiency}
              onChangeText={setEfficiency}
              keyboardType="numeric"
              placeholder="88"
              placeholderTextColor="#555"
              maxLength={5}
              returnKeyType="done"
              autoFocus
            />
            <Text style={styles.unit}>%</Text>
          </View>
          <Text style={styles.description}>
            The percentage of grid energy that actually reaches your battery. Accounts for losses
            in the wallbox and your car's onboard charger.
          </Text>
        </View>

        <View style={styles.field}>
          <View style={styles.fieldHeader}>
            <Text style={styles.fieldLabel}>Charger max output</Text>
            <Text style={styles.fieldHint}>Standard home wallbox: 7kW</Text>
          </View>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={maxOutput}
              onChangeText={setMaxOutput}
              keyboardType="decimal-pad"
              placeholder="7"
              placeholderTextColor="#555"
              maxLength={5}
              returnKeyType="done"
            />
            <Text style={styles.unit}>kW</Text>
          </View>
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.fieldLabel}>Auto-focus current charge</Text>
            <Text style={styles.description}>
              Automatically open the keyboard on the current charge field when the app opens.
            </Text>
          </View>
          <Switch
            value={autoFocus}
            onValueChange={setAutoFocus}
            trackColor={{ false: '#2a2a2a', true: '#00c896' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save Settings</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#111',
  },
  container: {
    padding: 24,
    gap: 24,
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
  actions: {
    gap: 12,
    marginTop: 8,
  },
  manageCarsButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  manageCarsText: {
    color: '#aaa',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#00c896',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cancelButtonText: {
    color: '#555',
    fontSize: 16,
    fontWeight: '500',
  },
});
