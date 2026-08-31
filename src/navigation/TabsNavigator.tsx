import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import type { TabsParamList } from './types';
import { AppColors } from '@/constants/appTheme';
import { HomeScreen } from '@/screens/HomeScreen';
import { MyBookingsScreen } from '@/screens/MyBookingsScreen';
import { ProfileScreen } from '@/screens/ProfileScreen';

const Tab = createBottomTabNavigator<TabsParamList>();

export function TabsNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: AppColors.primary,
        tabBarInactiveTintColor: AppColors.textMuted,
        tabBarStyle: {
          backgroundColor: AppColors.card,
          borderTopColor: AppColors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<keyof TabsParamList, keyof typeof Ionicons.glyphMap> = {
            Home: 'search',
            MyBookings: 'ticket',
            Profile: 'person-circle',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Search' }} />
      <Tab.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My Tickets' }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
