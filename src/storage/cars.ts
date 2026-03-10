import AsyncStorage from '@react-native-async-storage/async-storage';
import { Car } from '../types/Car';

const STORAGE_KEY = 'evapp_cars';

export async function loadCars(): Promise<Car[]> {
  const json = await AsyncStorage.getItem(STORAGE_KEY);
  return json ? JSON.parse(json) : [];
}

export async function saveCars(cars: Car[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cars));
}

export async function addCar(car: Car): Promise<Car[]> {
  const cars = await loadCars();
  const updated = [...cars, car];
  await saveCars(updated);
  return updated;
}

export async function updateCar(updated: Car): Promise<Car[]> {
  const cars = await loadCars();
  const next = cars.map(c => (c.id === updated.id ? updated : c));
  await saveCars(next);
  return next;
}

export async function deleteCar(id: string): Promise<Car[]> {
  const cars = await loadCars();
  const next = cars.filter(c => c.id !== id);
  await saveCars(next);
  return next;
}
