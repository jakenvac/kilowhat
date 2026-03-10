import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';

import { deleteCar, loadCars } from '../storage/cars';
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
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [shouldReopenModal, setShouldReopenModal] = useState(false);
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
    // Reopen modal if we were editing a vehicle
    if (shouldReopenModal) {
      setIsModalVisible(true);
      setShouldReopenModal(false);
    }
  }, [shouldReopenModal]);

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

  const current = parseFloat(currentSoc);
  const target = parseFloat(targetSoc);
  const kwhNeeded =
    selectedCar && !isNaN(current) && !isNaN(target)
      ? Math.max(0, (selectedCar.batteryCapacityKwh * (target - current)) / 100) / (efficiency / 100)
      : null;

  const chargeTime = kwhNeeded !== null ? formatChargeTime(kwhNeeded / maxOutputKw) : null;

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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

    </ScrollView>

    {/* Vehicle selection modal */}
    <Modal
      visible={isModalVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Vehicle</Text>
            <Pressable onPress={() => setIsModalVisible(false)} hitSlop={12}>
              <MaterialDesignIcons name="close" size={24} color="#aaa" />
            </Pressable>
          </View>

          <ScrollView style={styles.modalList}>
            {cars.map((car, i) => (
              <View key={car.id} style={styles.vehicleRow}>
                <Pressable
                  style={styles.vehicleRowPressable}
                  onPress={() => handleCarSelect(i)}
                >
                  <View style={styles.vehicleRowLeft}>
                    {i === selectedIndex && (
                      <MaterialDesignIcons name="check" size={20} color="#00c896" />
                    )}
                    <Text style={[
                      styles.vehicleRowText,
                      i === selectedIndex && styles.vehicleRowTextSelected
                    ]}>
                      {car.name}
                    </Text>
                  </View>
                </Pressable>
                <View style={styles.vehicleRowActions}>
                  <Pressable
                    onPress={() => {
                      setShouldReopenModal(true);
                      setIsModalVisible(false);
                      navigation.navigate('AddEditCar', { car });
                    }}
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialDesignIcons name="pencil" size={20} color="#aaa" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCar(car.id)}
                    hitSlop={8}
                    style={styles.iconButton}
                  >
                    <MaterialDesignIcons name="trash-can-outline" size={20} color="#ff6b6b" />
                  </Pressable>
                </View>
              </View>
            ))}
          </ScrollView>

          <Pressable
            style={styles.addVehicleButton}
            onPress={() => {
              setShouldReopenModal(true);
              setIsModalVisible(false);
              navigation.navigate('AddEditCar', {});
            }}
          >
            <MaterialDesignIcons name="plus" size={20} color="#000" />
            <Text style={styles.addVehicleButtonText}>Add Vehicle</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  </>
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
  vehicleSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  vehicleName: {
    color: '#00c896',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  modalList: {
    maxHeight: 400,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 4,
  },
  vehicleRowPressable: {
    flex: 1,
    paddingVertical: 12,
  },
  vehicleRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  vehicleRowText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '400',
  },
  vehicleRowTextSelected: {
    fontWeight: '600',
    color: '#00c896',
  },
  vehicleRowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00c896',
    marginHorizontal: 24,
    marginTop: 16,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  addVehicleButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
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
