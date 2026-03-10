import { Car } from './Car';
import { ChargerProfile } from './ChargerProfile';

export type RootStackParamList = {
  Calculator: undefined;
  AddEditCar: { car?: Car };
  AddEditChargerProfile: { profile?: ChargerProfile };
  Settings: undefined;
};
