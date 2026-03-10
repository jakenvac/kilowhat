import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import { loadCars } from '../storage/cars';
import { loadSettings, saveSettings } from '../storage/settings';
import { Car } from '../types/Car';
import { DEFAULT_SETTINGS } from '../types/Settings';
import { RootStackParamList } from '../types/navigation';

function formatChargeTime(hours: number): string {
  if (hours <= 0) return '0m';
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Calculator'>;

export function CalculatorScreen({ navigation }: Props) {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentSoc, setCurrentSoc] = useState(String(DEFAULT_SETTINGS.lastCurrentSoc));
  const [targetSoc, setTargetSoc] = useState('');
  const [efficiency, setEfficiency] = useState(DEFAULT_SETTINGS.chargerEfficiency);
  const [maxOutputKw, setMaxOutputKw] = useState(DEFAULT_SETTINGS.chargerMaxOutputKw);
  const targetEditedByUser = useRef(false);
  const currentSocRef = useRef<TextInput>(null);

  const selectedCar = cars[selectedIndex] ?? null;

  const fetchData = useCallback(async () => {
    const [loaded, settings] = await Promise.all([loadCars(), loadSettings()]);
    setCars(loaded);
    setEfficiency(settings.chargerEfficiency);
    setMaxOutputKw(settings.chargerMaxOutputKw);
    setCurrentSoc(String(settings.lastCurrentSoc));
    if (loaded.length > 0) {
      setSelectedIndex(0);
      if (!targetEditedByUser.current) {
        const firstCar = loaded[0];
        if (firstCar) {
          setTargetSoc(String(firstCar.defaultTargetSoc));
        }
      }
      if (settings.autoFocusCurrentCharge) {
        setTimeout(() => currentSocRef.current?.focus(), 100);
      }
    }
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={12}>
          <Text style={styles.settingsCog}>
            <MaterialDesignIcons name="cog" style={styles.settingsCog}/>
          </Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  function handleCarSelect(index: number) {
    setSelectedIndex(index);
    targetEditedByUser.current = false;
    const car = cars[index];
    if (car) {
      setTargetSoc(String(car.defaultTargetSoc));
    }
  }

  function handleTargetChange(value: string) {
    targetEditedByUser.current = true;
    setTargetSoc(value);
  }

  async function handleCurrentSocChange(value: string) {
    setCurrentSoc(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      const settings = await loadSettings();
      await saveSettings({ ...settings, lastCurrentSoc: parsed });
    }
  }

  const current = parseFloat(currentSoc);
  const target = parseFloat(targetSoc);
  const kwhNeeded =
    selectedCar && !isNaN(current) && !isNaN(target)
      ? Math.max(0, (selectedCar.batteryCapacityKwh * (target - current)) / 100) / (efficiency / 100)
      : null;

  const chargeTime = kwhNeeded !== null ? formatChargeTime(kwhNeeded / maxOutputKw) : null;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Car selector */}
      <Text style={styles.label}>Vehicle</Text>
      {cars.length === 0 ? (
        <Pressable style={styles.emptyCard} onPress={() => navigation.navigate('CarManagement')}>
          <Text style={styles.emptyText}>No cars saved — tap to add one</Text>
        </Pressable>
      ) : (
        <View style={styles.pickerContainer}>
          {cars.map((car, i) => (
            <Pressable
              key={car.id}
              style={[styles.pickerOption, i === selectedIndex && styles.pickerOptionSelected]}
              onPress={() => handleCarSelect(i)}
            >
              <Text
                style={[
                  styles.pickerOptionText,
                  i === selectedIndex && styles.pickerOptionTextSelected,
                ]}
                numberOfLines={1}
              >
                {car.name}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Inputs */}
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Current charge</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              ref={currentSocRef}
              style={styles.input}
              keyboardType="numeric"
              value={currentSoc}
              onChangeText={handleCurrentSocChange}
              placeholder="0"
              placeholderTextColor="#555"
              maxLength={3}
              returnKeyType="done"
            />
            <Text style={styles.unit}>%</Text>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Target charge</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={targetSoc}
              onChangeText={handleTargetChange}
              placeholder="80"
              placeholderTextColor="#555"
              maxLength={3}
              returnKeyType="done"
            />
            <Text style={styles.unit}>%</Text>
          </View>
        </View>
      </View>

      {/* Result */}
      <View style={styles.resultCard}>
        {/* Always rendered to hold the card size; hidden when no input */}
        <View style={{ opacity: currentSoc ? 1 : 0, alignItems: 'center', gap: 4 }}>
          <Text style={styles.resultLabel}>Energy needed</Text>
          <Text style={styles.resultValue}>
            {kwhNeeded !== null ? kwhNeeded.toFixed(1) : '—'}
          </Text>
          <Text style={styles.resultUnit}>kWh</Text>
          {/* Always reserve space for charge time line */}
          <Text style={styles.chargeTime}>
            {chargeTime !== null ? `≈ ${chargeTime} estimated charge time` : ' '}
          </Text>
          <Text style={styles.resultEfficiency}>at {efficiency}% charger efficiency</Text>
        </View>
        {/* Prompt overlaid when no input */}
        {!currentSoc && (
          <View style={[StyleSheet.absoluteFill, styles.resultPromptContainer]}>
            <Text style={styles.resultPrompt}>Enter your current charge to get started</Text>
          </View>
        )}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  settingsCog: {
    color: '#eee',
    fontSize: 24,
  },
  container: {
    padding: 24,
    gap: 20,
    flexGrow: 1,
  },
  label: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1a1a1a',
  },
  pickerOptionSelected: {
    backgroundColor: '#00c896',
    borderColor: '#00c896',
  },
  pickerOptionText: {
    color: '#ccc',
    fontSize: 15,
    fontWeight: '500',
  },
  pickerOptionTextSelected: {
    color: '#000',
  },
  emptyCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  emptyText: {
    color: '#555',
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  inputGroup: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: '300',
    paddingVertical: 14,
  },
  unit: {
    color: '#555',
    fontSize: 18,
    fontWeight: '500',
  },
  resultCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    padding: 32,
    alignItems: 'center',
    gap: 4,
  },
  resultPromptContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultPrompt: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  resultLabel: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  resultValue: {
    color: '#00c896',
    fontSize: 72,
    fontWeight: '200',
    lineHeight: 80,
  },
  resultUnit: {
    color: '#555',
    fontSize: 20,
    fontWeight: '400',
  },
  chargeTime: {
    color: '#aaa',
    fontSize: 15,
    fontWeight: '400',
    marginTop: 12,
  },
  resultEfficiency: {
    color: '#333',
    fontSize: 12,
    marginTop: 4,
  },
});
