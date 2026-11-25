import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Flower2, Sparkles } from 'lucide-react'
import { loginUser } from '../../services/authService'
import '../../styles/AuthPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
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
      const data = await loginUser(formData)
      const accountType = data?.customer?.accountType

      if (accountType === 'employee') {
        navigate('/staff')
      } else {
        navigate('/menu')
      }
    } catch (error) {
      setErrorMsg(error.message || 'No se pudo iniciar sesión.')
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
          BIENVENIDA / BIENVENIDO
        </span>

        <h1>Iniciar sesión</h1>
        <p className="auth-subtitle">
          Accedé con tu correo y contraseña (clientes y equipo del restaurante).
        </p>

        {errorMsg && <div className="auth-alert">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="login-email">Correo electrónico</label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="login-password">Contraseña</label>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Entrar'}
            <ArrowRight size={20} />
          </button>
        </form>

        <p className="auth-footer-text">
          ¿Aún no tenés cuenta de cliente?{' '}
          <Link to="/register">Registrate aquí</Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage