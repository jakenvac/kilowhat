import { Car } from './Car';

export type RootStackParamList = {
  Calculator: undefined;
  AddEditCar: { car?: Car };
  Settings: undefined;
};
