import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { adminModules } from '../../data/adminModules'

function AdminDashboard() {
  const moduleGroups = adminModules.filter(
    (group) => group.name !== 'General'
  )

  return (
    <section className="admin-dashboard">
      <div className="admin-welcome">
        <span className="admin-eyebrow">
          PANEL ADMINISTRATIVO
        </span>

        <h1>Gestión del restaurante</h1>

        <p>
          Administrá las operaciones de Orígenes SV desde un mismo lugar.
        </p>
      </div>

      {moduleGroups.map((group) => (
        <section
          className="admin-module-section"
          key={group.name}
        >
          <div className="admin-section-heading">
            <h2>{group.name}</h2>
          </div>

          <div className="admin-module-grid">
            {group.items.map((item) => {
              const ModuleIcon = item.icon

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="admin-module-card"
                >
                  <span className={`admin-module-icon ${item.color}`}>
                    <ModuleIcon size={25} />
                  </span>

                  <span className="admin-module-copy">
                    <strong>{item.name}</strong>

                    <small>{item.description}</small>

                    <span className="admin-module-link">
                      Abrir módulo
                      <ArrowUpRight size={16} />
                    </span>
                  </span>
                </Link>
              )
            })}
          </div>
        </section>
      ))}
    </section>
  )
}

export default AdminDashboard