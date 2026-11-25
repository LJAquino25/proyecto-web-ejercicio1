import { ArrowUpRight, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

function AdminDashboard() {
  return (
    <section className="admin-dashboard">
      <div className="admin-welcome">
        <span className="admin-eyebrow">PANEL ADMINISTRATIVO</span>
        <h1>Gestión del restaurante</h1>
        <p>
          Desde aquí podrás acceder a las herramientas administrativas de Orígenes SV.
        </p>
      </div>

      <div className="admin-section-heading">
        <div>
          <span className="admin-eyebrow">ÁREA DISPONIBLE</span>
          <h2>Personal y planilla</h2>
        </div>
      </div>

      <Link to="/staff/team" className="admin-module-card">
        <span className="admin-module-icon pink"><Users size={23} /></span>
        <span className="admin-module-copy">
          <strong>Registrar empleado</strong>
          <small>Crear una cuenta de equipo, asignarla a una sucursal y definir su rol.</small>
          <span className="admin-module-link">
            Abrir administración de personal <ArrowUpRight size={16} />
          </span>
        </span>
      </Link>
    </section>
  )
}

export default AdminDashboard
