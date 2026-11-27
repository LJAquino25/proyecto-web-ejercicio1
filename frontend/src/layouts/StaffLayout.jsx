import { useState } from 'react'
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { Flower2, LogOut, Users } from 'lucide-react'
import { apiRequest } from '../services/api'
import { getSession, logoutUser } from '../services/authService'
import { adminModules } from '../data/adminModules'
import '../styles/Admin.css'

function StaffLayout() {
  const navigate = useNavigate()
  const session = getSession()
  const [logoutError, setLogoutError] = useState('')
  const [loggingOut, setLoggingOut] = useState(false)

  if (session?.accountType !== 'employee') {
    return <Navigate to="/login" replace />
  }

  const handleLogout = async () => {
    setLogoutError('')
    setLoggingOut(true)

    try {
      await apiRequest('/logout', { method: 'POST' })
      logoutUser()
      navigate('/login', { replace: true })
    } catch (error) {
      setLogoutError(error.message || 'No se pudo cerrar la sesión.')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="staff-shell">
      <aside className="staff-sidebar">

        <NavLink
          to="/staff"
          className="staff-brand"
          aria-label="Orígenes, espacio de equipo"
        >
          <span className="staff-brand-icon">
            <Flower2 size={26} />
          </span>

          <span>
            <strong>orígenes.</strong>
            <small>ESPACIO DE EQUIPO</small>
          </span>
        </NavLink>

        <nav
          className="staff-navigation"
          aria-label="Navegación administrativa"
        >
          {adminModules.map((group) => (
            <div className="staff-nav-group" key={group.name}>

              <span className="staff-nav-label">
                {group.name}
              </span>

              {group.items.map((item) => {
                const ModuleIcon = item.icon

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === '/staff'}
                    className={({ isActive }) =>
                      `staff-nav-link${isActive ? ' active' : ''}`
                    }
                  >
                    <ModuleIcon size={19} />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}

            </div>
          ))}
        </nav>

        <div className="staff-sidebar-footer">
          <span className="staff-user-avatar">
            <Users size={18} />
          </span>

          <span className="staff-user-copy">
            <strong>Equipo Orígenes</strong>
            <small>{session.role || 'Personal'}</small>
          </span>

          <button
            type="button"
            className="staff-logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
            aria-label="Cerrar sesión"
            title="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </div>

      </aside>

      <div className="staff-main">

        <header className="staff-topbar">
          <span>
            Orígenes SV <span aria-hidden="true">/</span> Administración
          </span>

          <span className="staff-online-indicator">
            <i aria-hidden="true" />
            Espacio de trabajo
          </span>
        </header>

        {logoutError && (
          <div className="staff-logout-error" role="alert">
            {logoutError}
          </div>
        )}

        <main className="staff-content">
          <Outlet />
        </main>

      </div>
    </div>
  )
}

export default StaffLayout