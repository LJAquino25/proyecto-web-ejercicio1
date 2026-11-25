import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  ArrowLeft,
  UserRound,
  Mail,
  Phone,
  MapPin,
  LockKeyhole,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react'

import { registerCustomer } from '../../services/authService'
import '../../styles/RegisterPage.css'

function RegisterPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const requiresCustomer = Boolean(location.state?.requiresCustomer)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
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
      await registerCustomer(formData)
      navigate('/login', { state: location.state })
    } catch (error) {
      setErrorMsg(
        error.message || 'No se pudo completar el registro.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">

      <div className="register-shell">

    
      <header className="register-navigation">

      <Link to="/" className="register-wordmark">
            Orígenes SV.
      </Link>

      <Link to="/" className="register-back">
            <ArrowLeft size={20} />
            Volver al inicio
          </Link>

        </header>

        <section className="register-container">

    
        <div className="register-brand">

            <span className="register-brand-tag">
              QUÉ BUENO QUE ESTÁS AQUÍ
            </span>

        <div className="register-brand-content">

           
              <svg
                className="register-illustration"
                viewBox="0 0 240 220"
                aria-hidden="true"
              >

                <g
                  transform="translate(120 110) rotate(-12)"
                  fill="var(--color-fuchsia)"
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
                    fill="var(--color-cream)"
                  />

                </g>
                <g fill="var(--color-blue)">

                  <path
                    d="M0 -19 Q3 -3 19 0 Q3 3 0 19 Q-3 3 -19 0 Q-3 -3 0 -19Z"
                    transform="translate(39 48)"
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
                  fill="var(--color-fuchsia)"
                />

                <circle
                  cx="215"
                  cy="60"
                  r="3.5"
                  fill="var(--color-blue)"
                />

                <circle
                  cx="35"
                  cy="158"
                  r="9"
                  fill="var(--color-fuchsia)"
                />

                <circle
                  cx="54"
                  cy="173"
                  r="4"
                  fill="var(--color-blue)"
                />

              </svg>

              <h2>¡Bienvenido a nuestra mesa!</h2>

              <p>
                Platos típicos, postres y café.
              </p>

            </div>

            <span className="register-brand-footer">
              SABOR QUE NOS UNE
            </span>

          </div>

     
          <section className="register-card">

            <span className="register-label">
              CREÁ TU CUENTA
            </span>

            <h1>Registro de cliente</h1>

            <p className="register-subtitle">
              {requiresCustomer
                ? 'Creá tu cuenta y luego iniciá sesión para continuar con tu pedido.'
                : 'Registrate para hacer tus pedidos y guardar tus datos.'}
            </p>

            {errorMsg && (
              <div className="register-alert" role="alert">
                {errorMsg}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="register-form"
            >

          
              <div className="register-field">

                <label htmlFor="reg-name">
                  Nombre completo
                </label>

          <div className="register-input-wrapper">

             <UserRound
               size={20}
               className="register-input-icon"
                  />

                  <input
                    id="reg-name"
                    name="full_name"
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Ej. Sofía Hernández"
                    value={formData.full_name}
                    onChange={handleChange}
                  />

            </div>

              </div>

             
              <div className="register-field">

                <label htmlFor="reg-email">
                  Correo electrónico
                </label>

           <div className="register-input-wrapper">

                  <Mail
                    size={20}
                    className="register-input-icon"
                  />

                  <input
                    id="reg-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="sofia@ejemplo.com"
                    value={formData.email}
                    onChange={handleChange}
                  />

            </div>

              </div>
              <div className="register-field">

                <label htmlFor="reg-phone">
                  Teléfono
                </label>

                <div className="register-input-wrapper">

                  <Phone
                    size={20}
                    className="register-input-icon"
                  />

                  <input
                    id="reg-phone"
                    name="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    placeholder="7000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                  />

                </div>

              </div>


              <div className="register-field">

                <label htmlFor="reg-address">
                  Dirección
                </label>

                <div className="register-input-wrapper">

                  <MapPin
                    size={20}
                    className="register-input-icon"
                  />

                  <input
                    id="reg-address"
                    name="address"
                    type="text"
                    required
                    autoComplete="street-address"
                    placeholder="Colonia Escalón, San Salvador"
                    value={formData.address}
                    onChange={handleChange}
                  />

                </div>

              </div>

       
              <div className="register-field">

                <label htmlFor="reg-password">
                  Contraseña
                </label>

                <div className="register-input-wrapper">

                  <LockKeyhole
                    size={20}
                    className="register-input-icon"
                  />

                  <input
                    id="reg-password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.password}
                    onChange={handleChange}
                  />

                

               <button
                    type="button"
                    className="register-password-toggle"
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
                className="register-submit"
                disabled={loading}
              >
                {loading ? 'Creando cuenta...' : 'Registrarme'}
                <ArrowRight size={22} />
              </button>

            </form>

            <div className="register-divider">
              <span>¿Ya sos parte de Orígenes SV?</span>
            </div>

            <p className="register-footer-text">
              ¿Ya tenés cuenta?
            </p>

            <Link
              to="/login"
              state={location.state}
              className="register-login-button"
            >
              <LogIn size={20} />
              Iniciar sesión
            </Link>

          </section>

        </section>

      </div>

    </main>
  )
}

export default RegisterPage