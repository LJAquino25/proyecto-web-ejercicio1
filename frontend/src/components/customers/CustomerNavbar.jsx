import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import {
  ShoppingBag,
  UserRound,
  Menu,
  X,
  Flower2
} from 'lucide-react'

import '../../styles/CustomerNavbar.css'

function CustomerNavbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="customer-header">
      <nav className="customer-navbar">

        <Link to="/" className="brand">
          <Flower2 size={34} />

          <div>
            <span className="brand-name">orígenes.</span>
            <span className="brand-subtitle">
              RESTAURANTE SV
            </span>
          </div>
        </Link>

        <div className={`nav-links ${isOpen ? 'open' : ''}`}>

          <NavLink to="/" end onClick={() => setIsOpen(false)}>
            Inicio
          </NavLink>

          <NavLink to="/menu" onClick={() => setIsOpen(false)}>
            Nuestro menú
          </NavLink>

        </div>

        <div className="nav-actions">

          <Link to="/cart" className="nav-icon" aria-label="Carrito">
            <ShoppingBag size={23} />
          </Link>

          <Link to="/login" className="nav-icon" aria-label="Iniciar sesión">
            <UserRound size={23} />
          </Link>

          <button
            className="mobile-menu-button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menú de navegación"
            aria-expanded={isOpen}
          >
            {isOpen ? <X /> : <Menu />}
          </button>

        </div>

      </nav>
    </header>
  )
}

export default CustomerNavbar