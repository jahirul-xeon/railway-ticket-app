import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { AppStackParamList } from './types';
import { AppColors } from '@/constants/appTheme';
import { TabsNavigator } from './TabsNavigator';
import { ResultsScreen } from '@/screens/ResultsScreen';
import { SeatsScreen } from '@/screens/SeatsScreen';
import { PassengerScreen } from '@/screens/PassengerScreen';
import { ConfirmationScreen } from '@/screens/ConfirmationScreen';
import { DevelopersScreen } from '@/screens/DevelopersScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: AppColors.primary },
        headerTintColor: AppColors.white,
        headerTitleStyle: { fontWeight: '700' },
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: AppColors.bg },
      }}>
      <Stack.Screen name="Tabs" component={TabsNavigator} options={{ headerShown: false }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Available Trains' }} />
      <Stack.Screen name="Seats" component={SeatsScreen} options={{ title: 'Select Seats' }} />
      <Stack.Screen name="Passenger" component={PassengerScreen} options={{ title: 'Passenger & Payment' }} />
      <Stack.Screen
        name="Confirmation"
        component={ConfirmationScreen}
        options={{ title: 'Booking Confirmed', headerBackVisible: false }}
      />
      <Stack.Screen
        name="Developers"
        component={DevelopersScreen}
        options={{ title: 'Developers' }}
      />
    </Stack.Navigator>
  );
}
