import { Car } from './Car';

export type RootStackParamList = {
  Calculator: undefined;
  CarManagement: undefined;
  AddEditCar: { car?: Car };
  Settings: undefined;
};
