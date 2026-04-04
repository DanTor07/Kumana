import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { FinanceProvider } from './src/context/FinanceContext'
import AppNavigator from './src/navigation/AppNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <FinanceProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </FinanceProvider>
    </SafeAreaProvider>
  )
}
