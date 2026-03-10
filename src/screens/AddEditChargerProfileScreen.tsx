import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

import { addChargerProfile, updateChargerProfile } from '../storage/chargerProfiles';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'AddEditChargerProfile'>;

export function AddEditChargerProfileScreen({ route, navigation }: Props) {
  const existing = route.params?.profile;

  const [name, setName] = useState(existing?.name ?? '');
  const [maxOutput, setMaxOutput] = useState(
    existing ? String(existing.maxOutputKw) : ''
  );
  const [efficiency, setEfficiency] = useState(
    existing ? String(existing.efficiency) : '88'
  );

  async function handleSave() {
    const trimmedName = name.trim();
    const parsedMaxOutput = parseFloat(maxOutput);
    const parsedEfficiency = parseFloat(efficiency);

    if (!trimmedName) {
      Alert.alert('Validation', 'Please enter a charger name.');
      return;
    }
    if (isNaN(parsedMaxOutput) || parsedMaxOutput <= 0) {
      Alert.alert('Validation', 'Please enter a valid max output.');
      return;
    }
    if (isNaN(parsedEfficiency) || parsedEfficiency < 0 || parsedEfficiency > 100) {
      Alert.alert('Validation', 'Efficiency must be between 0 and 100.');
      return;
    }

    const profile = {
      id: existing?.id ?? uuidv4(),
      name: trimmedName,
      maxOutputKw: parsedMaxOutput,
      efficiency: parsedEfficiency,
    };

    if (existing) {
      await updateChargerProfile(profile);
    } else {
      await addChargerProfile(profile);
    }

    navigation.goBack();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Field label="Charger name" hint="e.g. Home Charger">
          <TextInput
            style={styles.standaloneInput}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Home Charger"
            placeholderTextColor="#555"
            returnKeyType="next"
            autoFocus
          />
        </Field>

        <Field label="Max output" hint="kW">
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={maxOutput}
              onChangeText={setMaxOutput}
              keyboardType="decimal-pad"
              placeholder="e.g. 7"
              placeholderTextColor="#555"
              returnKeyType="next"
            />
            <Text style={styles.unit}>kW</Text>
          </View>
        </Field>

        <Field label="Efficiency" hint="0–100">
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={efficiency}
              onChangeText={setEfficiency}
              keyboardType="decimal-pad"
              placeholder="88"
              placeholderTextColor="#555"
              maxLength={5}
              returnKeyType="done"
            />
            <Text style={styles.unit}>%</Text>
          </View>
        </Field>

        <View style={styles.actions}>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </Pressable>
          <Pressable style={styles.cancelButton} onPress={() => navigation.goBack()}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {hint && <Text style={styles.fieldHint}>{hint}</Text>}
      </View>
      {children}
    </View>
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
    paddingBottom: 100,
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
  standaloneInput: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '300',
    paddingVertical: 14,
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
  actions: {
    gap: 12,
    marginTop: 8,
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
