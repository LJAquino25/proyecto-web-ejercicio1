import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Flower2, Sparkles } from 'lucide-react'
import { registerCustomer } from '../../services/authService'
import '../../styles/AuthPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
  })
  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setLoading(true)

    try {
      await registerCustomer(formData)
      navigate('/login')
    } catch (error) {
      setErrorMsg(error.message || 'No se pudo completar el registro.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Sparkles className="auth-sparkle" size={34} />

        <span className="auth-label">
          <Flower2 size={16} />
          CREÁ TU CUENTA
        </span>

        <h1>Registro de cliente</h1>
        <p className="auth-subtitle">
          Registrate para hacer tus pedidos más rápido y guardar tus datos.
        </p>

        {errorMsg && <div className="auth-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="reg-name">Nombre completo</label>
            <input
              id="reg-name"
              name="full_name"
              type="text"
              required
              placeholder="Ej. Sofía Hernández"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-email">Correo electrónico</label>
            <input
              id="reg-email"
              name="email"
              type="email"
              required
              placeholder="sofia@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-phone">Teléfono</label>
            <input
              id="reg-phone"
              name="phone"
              type="tel"
              required
              placeholder="7000-0000"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-address">Dirección</label>
            <input
              id="reg-address"
              name="address"
              type="text"
              required
              placeholder="Colonia Escalón, San Salvador"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="reg-password">Contraseña</label>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarme'}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage