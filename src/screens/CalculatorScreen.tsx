import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import { SelectionModal } from '../components/SelectionModal';
import { deleteCar, loadCars } from '../storage/cars';
import { deleteChargerProfile, loadChargerProfiles } from '../storage/chargerProfiles';
import { loadSettings, saveSettings } from '../storage/settings';
import { Car } from '../types/Car';
import { ChargerProfile } from '../types/ChargerProfile';
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
  const [chargerProfiles, setChargerProfiles] = useState<ChargerProfile[]>([]);
  const [selectedChargerIndex, setSelectedChargerIndex] = useState(0);
  const [currentSoc, setCurrentSoc] = useState(String(DEFAULT_SETTINGS.lastCurrentSoc));
  const [targetSoc, setTargetSoc] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isChargerModalVisible, setIsChargerModalVisible] = useState(false);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);
  const [shouldReopenChargerModal, setShouldReopenChargerModal] = useState(false);
  const targetEditedByUser = useRef(false);
  const currentSocRef = useRef<TextInput>(null);

  const selectedCar = cars[selectedIndex] ?? null;
  const selectedCharger = chargerProfiles[selectedChargerIndex] ?? null;

  const fetchData = useCallback(async () => {
    const [loadedCars, loadedProfiles, settings] = await Promise.all([
      loadCars(),
      loadChargerProfiles(),
      loadSettings()
    ]);
    setCars(loadedCars);
    setChargerProfiles(loadedProfiles);
    setCurrentSoc(String(settings.lastCurrentSoc));
    
    if (loadedCars.length > 0) {
      setSelectedIndex(0);
      if (!targetEditedByUser.current) {
        const firstCar = loadedCars[0];
        if (firstCar) {
          setTargetSoc(String(firstCar.defaultTargetSoc));
        }
      }
      if (settings.autoFocusCurrentCharge) {
        setTimeout(() => currentSocRef.current?.focus(), 100);
      }
    }
    
    if (loadedProfiles.length > 0) {
      setSelectedChargerIndex(0);
    }
    
    // Reopen modal if we were editing a vehicle
    if (shouldReopenModal) {
      setIsModalVisible(true);
      setShouldReopenModal(false);
    }
    
    // Reopen charger modal if we were editing a charger
    if (shouldReopenChargerModal) {
      setIsChargerModalVisible(true);
      setShouldReopenChargerModal(false);
    }
  }, [shouldReopenModal, shouldReopenChargerModal]);

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
    setIsModalVisible(false);
    targetEditedByUser.current = false;
    const car = cars[index];
    if (car) {
      setTargetSoc(String(car.defaultTargetSoc));
    }
  }

  function handleChargerSelect(index: number) {
    setSelectedChargerIndex(index);
    setIsChargerModalVisible(false);
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

  async function handleDeleteCar(carId: string) {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteCar(carId);
            await fetchData();
            if (cars.length === 1) {
              setIsModalVisible(false);
            }
          },
        },
      ]
    );
  }

  async function handleDeleteCharger(chargerId: string) {
    Alert.alert(
      'Delete Charger',
      'Are you sure you want to delete this charger?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChargerProfile(chargerId);
              await fetchData();
              if (chargerProfiles.length === 1) {
                setIsChargerModalVisible(false);
              }
            } catch (error) {
              Alert.alert('Error', String(error));
            }
          },
        },
      ]
    );
  }

  const current = parseFloat(currentSoc);
  const target = parseFloat(targetSoc);
  const efficiency = selectedCharger?.efficiency ?? DEFAULT_SETTINGS.chargerEfficiency;
  const maxOutputKw = selectedCharger?.maxOutputKw ?? DEFAULT_SETTINGS.chargerMaxOutputKw;
  const kwhNeeded =
    selectedCar && !isNaN(current) && !isNaN(target)
      ? Math.max(0, (selectedCar.batteryCapacityKwh * (target - current)) / 100) / (efficiency / 100)
      : null;

  const chargeTime = kwhNeeded !== null ? formatChargeTime(kwhNeeded / maxOutputKw) : null;

  return (
    <>
      <View style={styles.container}>
          {/* Result - Calculator Display */}
          <View style={styles.resultCard}>
          {/* Always rendered to hold the card size; hidden when no vehicle or no input */}
          <View style={{ opacity: selectedCar && currentSoc ? 1 : 0, alignItems: 'center', gap: 4 }}>
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
          {/* Prompt overlaid when no vehicle */}
          {!selectedCar && (
            <View style={[StyleSheet.absoluteFill, styles.resultPromptContainer]}>
              <Text style={styles.resultPrompt}>Add a vehicle to calculate charge time</Text>
            </View>
          )}
          {/* Prompt overlaid when no input */}
          {selectedCar && !currentSoc && (
            <View style={[StyleSheet.absoluteFill, styles.resultPromptContainer]}>
              <Text style={styles.resultPrompt}>Enter your current charge to get started</Text>
            </View>
          )}
        </View>

        {/* Car selector */}
        <View>
          <Text style={styles.label}>Vehicle</Text>
          <Pressable 
            style={styles.vehicleSelector}
            onPress={() => {
              if (cars.length === 0) {
                navigation.navigate('AddEditCar', {});
              } else {
                setIsModalVisible(true);
              }
            }}
          >
            <Text style={styles.vehicleName} numberOfLines={1}>
              {selectedCar?.name ?? 'Add vehicle'}
            </Text>
            <MaterialDesignIcons name="chevron-right" size={20} color="#00c896" />
          </Pressable>
        </View>

        {/* Charger selector */}
        <View>
          <Text style={styles.label}>Charger</Text>
          <Pressable 
            style={styles.vehicleSelector}
            onPress={() => {
              if (chargerProfiles.length === 0) {
                navigation.navigate('AddEditChargerProfile', {});
              } else {
                setIsChargerModalVisible(true);
              }
            }}
          >
            <Text style={styles.vehicleName} numberOfLines={1}>
              {selectedCharger?.name ?? 'Add charger'}
            </Text>
            <MaterialDesignIcons name="chevron-right" size={20} color="#00c896" />
          </Pressable>
        </View>

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

      </View>

    {/* Vehicle selection modal */}
    <SelectionModal
      visible={isModalVisible}
      title="Select Vehicle"
      items={cars}
      selectedIndex={selectedIndex}
      getItemKey={(car) => car.id}
      getItemLabel={(car) => car.name}
      addButtonLabel="Add Vehicle"
      onClose={() => setIsModalVisible(false)}
      onSelect={handleCarSelect}
      onEdit={(car) => {
        setShouldReopenModal(true);
        setIsModalVisible(false);
        navigation.navigate('AddEditCar', { car });
      }}
      onDelete={(car) => handleDeleteCar(car.id)}
      onAdd={() => {
        setShouldReopenModal(true);
        setIsModalVisible(false);
        navigation.navigate('AddEditCar', {});
      }}
    />

    {/* Charger selection modal */}
    <SelectionModal
      visible={isChargerModalVisible}
      title="Select Charger"
      items={chargerProfiles}
      selectedIndex={selectedChargerIndex}
      getItemKey={(profile) => profile.id}
      getItemLabel={(profile) => profile.name}
      addButtonLabel="Add Charger"
      onClose={() => setIsChargerModalVisible(false)}
      onSelect={handleChargerSelect}
      onEdit={(profile) => {
        setShouldReopenChargerModal(true);
        setIsChargerModalVisible(false);
        navigation.navigate('AddEditChargerProfile', { profile });
      }}
      onDelete={(profile) => handleDeleteCharger(profile.id)}
      onAdd={() => {
        setShouldReopenChargerModal(true);
        setIsChargerModalVisible(false);
        navigation.navigate('AddEditChargerProfile', {});
      }}
    />
  </>
  );
}

const styles = StyleSheet.create({
  settingsCog: {
    color: '#eee',
    fontSize: 24,
  },
  container: {
    flex: 1,
    padding: 24,
    gap: 20,
  },
  label: {
    color: '#aaa',
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  vehicleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vehicleName: {
    color: '#00c896',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
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
    borderRadius: 6,
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
    flex: 1,
    minHeight: 180,
    maxHeight: 250,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 24,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
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
