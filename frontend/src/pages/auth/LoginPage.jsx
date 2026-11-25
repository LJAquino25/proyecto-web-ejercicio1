import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
  UserRoundPlus
} from 'lucide-react'

import { loginUser } from '../../services/authService'
import '../../styles/AuthPage.css'
import '../../styles/LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const [errorMsg, setErrorMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <main className="auth-page login-page">

      <div className="login-shell">

        <header className="login-navigation">

          <Link to="/" className="login-wordmark">
            Orígenes SV.
          </Link>

          <Link to="/" className="login-back">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>

        </header>

        <section className="login-container">

          <div className="login-brand">

            <span className="login-brand-tag">
              UN PEDACITO DE CASA
            </span>

            <div className="login-brand-content">

              <svg
                className="login-illustration"
                viewBox="0 0 240 220"
                aria-hidden="true"
              >

                <g
                  transform="translate(120 110) rotate(12)"
                  fill="var(--color-cream)"
                >
                  {Array.from({ length: 8 }, (_, index) => (
                    <ellipse
                      key={index}
                      cx="0"
                      cy="-35"
                      rx="15"
                      ry="35"
                      transform={`rotate(${index * 45})`}
                    />
                  ))}

                  <circle r="28" />

                  <circle
                    r="20"
                    fill="var(--color-yellow)"
                  />

                </g>

                <g fill="var(--color-fuchsia)">

                  <path
                    d="M0 -19 Q3 -3 19 0 Q3 3 0 19 Q-3 3 -19 0 Q-3 -3 0 -19Z"
                    transform="translate(39 48) rotate(10)"
                  />

                  <path
                    d="M0 -12 Q2 -2 12 0 Q2 2 0 12 Q-2 2 -12 0 Q-2 -2 0 -12Z"
                    transform="translate(204 148)"
                  />

                </g>

                <circle
                  cx="198"
                  cy="43"
                  r="7"
                  fill="var(--color-yellow)"
                />

                <circle
                  cx="215"
                  cy="60"
                  r="3.5"
                  fill="var(--color-fuchsia)"
                />

                <circle
                  cx="35"
                  cy="158"
                  r="9"
                  fill="var(--color-yellow)"
                />

                <circle
                  cx="54"
                  cy="173"
                  r="4"
                  fill="var(--color-fuchsia)"
                />

              </svg>

              <h2>¡Qué gusto tenerte de vuelta!</h2>

              <p>
                Siempre hay un lugar para vos
                en nuestra mesa.
              </p>

            </div>

            <span className="login-brand-footer">
              HECHO CON AMOR EN EL SALVADOR
            </span>

          </div>

          <section className="auth-card login-card">

            <span className="auth-label">
              TU ESPACIO EN ORÍGENES
            </span>

            <h1>Iniciar sesión</h1>

            <p className="auth-subtitle">
              Accedé con tu correo y contraseña.
            </p>

            {errorMsg && (
              <div className="auth-alert" role="alert">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="auth-form"
            >

              <div className="auth-field">

                <label htmlFor="login-email">
                  Correo electrónico
                </label>

                <div className="login-input-wrapper">

                  <Mail
                    size={20}
                    className="login-input-icon"
                  />

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="correo@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

                </div>

              </div>

       
              <div className="auth-field">

                <label htmlFor="login-password">
                  Contraseña
                </label>

                <div className="login-input-wrapper">

                  <LockKeyhole
                    size={20}
                    className="login-input-icon"
                  />

                  <input
                    id="login-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                  >
                    {showPassword
                      ? <EyeOff size={20} />
                      : <Eye size={20} />
                    }
                  </button>

                </div>

              </div>
              <button
                type="submit"
                className="auth-submit"
                disabled={loading}
              >
                {loading ? 'Ingresando...' : 'Entrar'}
                <ArrowRight size={22} />
              </button>

            </form>

            <div className="login-divider">
              <span>¿Primera vez por aquí?</span>
            </div>

            <p className="auth-footer-text">
              ¿Aún no tenés cuenta de cliente?
            </p>

            <Link
              to="/register"
              className="login-register-button"
            >
              <UserRoundPlus size={20} />
              Crear una cuenta
            </Link>

            <p className="login-access-note">
              Acceso para clientes y equipo del restaurante.
            </p>

          </section>

        </section>

      </div>

    </main>
  )
}

export default LoginPage