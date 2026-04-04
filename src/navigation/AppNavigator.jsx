import { NavigationContainer } from '@react-navigation/native'
import { useFinance } from '../context/FinanceContext'
import AuthStack from './AuthStack'
import MainTabs from './MainTabs'

export default function AppNavigator() {
  const { user } = useFinance()
  const isAuthenticated = !!(user.name && user.phoneVerified)

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  )
}
