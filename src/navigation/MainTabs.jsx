import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MaterialIcons } from '@expo/vector-icons'
import { COLORS } from '../styles/theme'

import DashboardScreen from '../screens/main/DashboardScreen'
import ConfirmConversionScreen from '../screens/main/ConfirmConversionScreen'
import ExchangeScreen from '../screens/main/ExchangeScreen'
import RateAlertsScreen from '../screens/main/RateAlertsScreen'
import ProfileScreen from '../screens/main/ProfileScreen'

const Tab = createBottomTabNavigator()
const DashStack = createNativeStackNavigator()

function DashboardStack() {
  return (
    <DashStack.Navigator screenOptions={{ headerShown: false }}>
      <DashStack.Screen name="DashboardMain" component={DashboardScreen} />
      <DashStack.Screen name="ConfirmConversion" component={ConfirmConversionScreen} />
    </DashStack.Navigator>
  )
}

const TAB_ICONS = {
  Dashboard: 'home',
  Exchange:  'currency-exchange',
  Alerts:    'notifications',
  Profile:   'person',
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.card,
          borderTopColor: COLORS.cardLight,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: 'bold' },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: 'Inicio' }} />
      <Tab.Screen name="Exchange"  component={ExchangeScreen}  options={{ tabBarLabel: 'Cambio' }} />
      <Tab.Screen name="Alerts"    component={RateAlertsScreen} options={{ tabBarLabel: 'Alertas' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ tabBarLabel: 'Perfil' }} />
    </Tab.Navigator>
  )
}
