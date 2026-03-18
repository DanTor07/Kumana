import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Welcome from './pages/Welcome'
import CreateAccount from './pages/CreateAccount'
import VerifyNumber from './pages/VerifyNumber'
import CompleteProfile from './pages/CompleteProfile'
import Dashboard from './pages/Dashboard'
import Exchange from './pages/Exchange'
import ConfirmConversion from './pages/ConfirmConversion'
import RateAlerts from './pages/RateAlerts'
import Profile from './pages/Profile'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/crear-cuenta" element={<CreateAccount />} />
        <Route path="/verificar" element={<VerifyNumber />} />
        <Route path="/completar-perfil" element={<CompleteProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cambio" element={<Exchange />} />
        <Route path="/confirmar" element={<ConfirmConversion />} />
        <Route path="/alertas" element={<RateAlerts />} />
        <Route path="/perfil" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
