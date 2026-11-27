import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/customers/HomePage'
import MenuPage from './pages/customers/MenuPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import StaffLayout from './layouts/StaffLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import InventoryPage from './pages/admin/InventoryPage'
import CatalogPage from './pages/admin/CatalogPage'
import RecipesPage from './pages/admin/RecipesPage'
import SalesPage from './pages/admin/SalesPage'
import CashRegisterPage from './pages/admin/CashRegisterPage'
import PurchasesPage from './pages/admin/PurchasesPage'
import ExpensesPage from './pages/admin/ExpensesPage'
import TeamPage from './pages/admin/TeamPage'
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

        <Route path="team" element={<TeamPage />} />

        <Route path="inventory" element={<InventoryPage />} />
        <Route path="catalog" element={<CatalogPage />} />
        <Route path="recipes" element={<RecipesPage />} />
        <Route path="sales" element={<SalesPage />} />
        <Route path="cash" element={<CashRegisterPage />} />
        <Route path="purchases" element={<PurchasesPage />} />
        <Route path="expenses" element={<ExpensesPage />} />
        <Route path="*" element={<Navigate to="/staff" replace />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App