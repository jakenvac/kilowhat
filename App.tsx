import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AddEditCarScreen } from './src/screens/AddEditCarScreen';
import { CalculatorScreen } from './src/screens/CalculatorScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { RootStackParamList } from './src/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          initialRouteName="Calculator"
          screenOptions={{
            headerStyle: { backgroundColor: '#111' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '600' },
            contentStyle: { backgroundColor: '#111' },
          }}
        >
          <Stack.Screen
            name="Calculator"
            component={CalculatorScreen}
            options={{ title: 'KiloWhat?' }}
          />
          <Stack.Screen
            name="AddEditCar"
            component={AddEditCarScreen}
            options={({ route }) => ({
              title: route.params?.car ? 'Edit Car' : 'Add Car',
            })}
          />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: 'Settings' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
