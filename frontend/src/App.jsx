import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/customers/HomePage'
import MenuPage from './pages/customers/MenuPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import StaffLayout from './layouts/StaffLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import EmployeeRegistrationPage from './pages/admin/EmployeeRegistrationPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/menu" element={<MenuPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/staff" element={<StaffLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="team" element={<EmployeeRegistrationPage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App