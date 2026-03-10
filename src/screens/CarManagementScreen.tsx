import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { deleteCar, loadCars } from '../storage/cars';
import { Car } from '../types/Car';
import { RootStackParamList } from '../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'CarManagement'>;

export function CarManagementScreen({ navigation }: Props) {
  const [cars, setCars] = useState<Car[]>([]);

  const fetchCars = useCallback(async () => {
    setCars(await loadCars());
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchCars);
    return unsubscribe;
  }, [navigation, fetchCars]);

  function handleDelete(car: Car) {
    Alert.alert('Remove Car', `Remove "${car.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          const updated = await deleteCar(car.id);
          setCars(updated);
        },
      },
    ]);
  }

  function renderItem({ item }: { item: Car }) {
    return (
      <View style={styles.row}>
        <Pressable
          style={styles.rowContent}
          onPress={() => navigation.navigate('AddEditCar', { car: item })}
        >
          <Text style={styles.carName}>{item.name}</Text>
          <Text style={styles.carDetail}>
            {item.batteryCapacityKwh} kWh · target {item.defaultTargetSoc}%
          </Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={() => handleDelete(item)}>
          <Text style={styles.deleteText}>Remove</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={cars}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No cars yet.</Text>
            <Text style={styles.emptySubtext}>Tap "Add Car" below to get started.</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
      <View style={styles.footer}>
        <Pressable
          style={styles.addButton}
          onPress={() => navigation.navigate('AddEditCar', {})}
        >
          <Text style={styles.addButtonText}>+ Add Car</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111',
  },
  list: {
    padding: 24,
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
  },
  rowContent: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  carName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  carDetail: {
    color: '#666',
    fontSize: 13,
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderLeftWidth: 1,
    borderLeftColor: '#2a2a2a',
  },
  deleteText: {
    color: '#e05',
    fontSize: 13,
    fontWeight: '600',
  },
  separator: {
    height: 10,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  emptySubtext: {
    color: '#555',
    fontSize: 14,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#1e1e1e',
  },
  addButton: {
    backgroundColor: '#00c896',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '700',
  },
});
