import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Coffee,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  Sparkles,
  Utensils,
} from 'lucide-react'
import {
  createInvoice,
  createOrder,
  getBranches,
  getCatalog,
} from '../../services/catalogService'
import { getSession } from '../../services/authService'
import '../../styles/MenuPage.css'

const FILTERS = [
  { key: 'ALL', label: 'Todos' },
  { key: 'PREPARED', label: 'Producto elaborado' },
  { key: 'PACKAGED', label: 'Empaquetado' },
]

const EMPTY_TAX_CREDIT = {
  nit: '',
  nrc: '',
  institution_name: '',
  business_line: '',
  address: '',
}

const PENDING_CART_KEY = 'pending-order-cart'

function normalizeFilter(rawType) {
  const upper = String(rawType || '').trim().toUpperCase()
  return ['PREPARED', 'PACKAGED'].includes(upper) ? upper : 'ALL'
}

function MenuPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialType = normalizeFilter(searchParams.get('type'))

  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [selectedType, setSelectedType] = useState(initialType)
  const [searchTerm, setSearchTerm] = useState('')
  const [cart, setCart] = useState(() => {
    const savedCart = sessionStorage.getItem(PENDING_CART_KEY)
    if (!savedCart) return []

    try {
      const parsedCart = JSON.parse(savedCart)
      if (
        Array.isArray(parsedCart) &&
        parsedCart.every(
          (item) =>
            item &&
            Number.isInteger(item.id) &&
            typeof item.name === 'string' &&
            Number.isFinite(item.price) &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0
        )
      ) {
        return parsedCart
      }
    } catch {
      sessionStorage.removeItem(PENDING_CART_KEY)
      return []
    }

    sessionStorage.removeItem(PENDING_CART_KEY)
    return []
  })
  const [branchId, setBranchId] = useState('')
  const [invoiceType, setInvoiceType] = useState('NORMAL')
  const [taxCreditData, setTaxCreditData] = useState(EMPTY_TAX_CREDIT)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [orderFeedback, setOrderFeedback] = useState(null)

  useEffect(() => {
    if (cart.length > 0) {
      sessionStorage.setItem(PENDING_CART_KEY, JSON.stringify(cart))
    } else {
      sessionStorage.removeItem(PENDING_CART_KEY)
    }
  }, [cart])

  useEffect(() => {
    setSelectedType(normalizeFilter(searchParams.get('type')))
  }, [searchParams])

  useEffect(() => {
    let active = true

    async function loadMenu() {
      setLoading(true)
      setErrorMsg('')
      try {
        const [data, branchData] = await Promise.all([
          getCatalog(),
          getBranches(),
        ])
        if (active) {
          setProducts(Array.isArray(data) ? data : [])
          setBranches(branchData)
        }
      } catch (error) {
        if (active) {
          setErrorMsg(error.message || 'No se pudo cargar el menú.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadMenu()
    return () => {
      active = false
    }
  }, [])

  const handleSelectType = (typeKey) => {
    setSelectedType(typeKey)
    if (typeKey === 'ALL') {
      setSearchParams({})
    } else {
      setSearchParams({ type: typeKey })
    }
  }

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const itemType = String(item.product_type || '').toUpperCase()
      const matchesType = selectedType === 'ALL' || itemType === selectedType
      const matchesName = String(item.name || '')
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())
      return matchesType && matchesName
    })
  }, [products, selectedType, searchTerm])

  const addToCart = (product) => {
    setOrderFeedback(null)
    setCart((prev) => {
      const existing = prev.find((entry) => entry.id === product.id)
      if (existing) {
        return prev.map((entry) =>
          entry.id === product.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        )
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: Number(product.price),
          quantity: 1,
        },
      ]
    })
  }

  const updateQuantity = (productId, delta) => {
    setCart((prev) =>
      prev
        .map((entry) =>
          entry.id === productId
            ? { ...entry, quantity: entry.quantity + delta }
            : entry
        )
        .filter((entry) => entry.quantity > 0)
    )
  }

  const totalItems = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  )

  const subtotal = useMemo(
    () =>
      Number(
        cart
          .reduce((acc, item) => acc + item.price * item.quantity, 0)
          .toFixed(2)
      ),
    [cart]
  )

  const tax = useMemo(
    () => (invoiceType === 'TAX_CREDIT' ? Number((subtotal * 0.13).toFixed(2)) : 0),
    [subtotal, invoiceType]
  )

  const total = useMemo(
    () => Number((subtotal + tax).toFixed(2)),
    [subtotal, tax]
  )

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return

    if (getSession()?.accountType !== 'customer') {
      navigate('/login', {
        state: { requiresCustomer: true },
      })
      return
    }

    if (!branches.some((branch) => Number(branch.id) === Number(branchId))) {
      setErrorMsg('Seleccioná una sucursal disponible para recoger tu pedido.')
      return
    }

    if (invoiceType === 'TAX_CREDIT') {
      if (
        !taxCreditData.nit.trim() ||
        !taxCreditData.nrc.trim() ||
        !taxCreditData.institution_name.trim()
      ) {
        setErrorMsg(
          'Completá NIT, NRC y nombre de la institución para crédito fiscal.'
        )
        return
      }
    }

    setSubmitting(true)
    setErrorMsg('')
    setOrderFeedback(null)

    try {
      const orderItems = cart.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      }))

      const response = await createOrder({
        branchId: Number(branchId),
        invoiceType,
        status: 'CART',
        orderItems,
      })

      let invoiceError = ''
      if (invoiceType === 'TAX_CREDIT' && response?.order?.id) {
        try {
          await createInvoice({
            orderId: response.order.id,
            type: 'credito-fiscal',
            nit: taxCreditData.nit.trim(),
            nrc: taxCreditData.nrc.trim(),
            institution_name: taxCreditData.institution_name.trim(),
            business_line: taxCreditData.business_line.trim() || null,
            address: taxCreditData.address.trim() || null,
          })
        } catch (invErr) {
          invoiceError = invErr.message
        }
      }

      setCart([])
      setTaxCreditData(EMPTY_TAX_CREDIT)
      setOrderFeedback({
        orderId: response?.order?.id,
        total: response?.order?.total ?? total,
        invoiceType,
        invoiceError,
      })
    } catch (error) {
      if (error.status === 401) {
        navigate('/login', {
          state: { requiresCustomer: true },
        })
        return
      }

      setErrorMsg(error.message || 'No se pudo crear el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="menu-page">
      <header className="menu-header">
        <div>
          <Link to="/" className="menu-back-link">
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>

          <span className="menu-label">
            CATÁLOGO DEL RESTAURANTE
          </span>

          <h1>Nuestro menú</h1>
          <p>
            Explorá nuestros productos elaborados al momento y opciones empaquetadas.
          </p>
        </div>

        <div className="menu-cart-pill">
          <ShoppingBag size={20} />
          <span>
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </span>
          <strong>${total.toFixed(2)}</strong>
        </div>
      </header>

      <section className="menu-controls">
        <div className="menu-filters" role="tablist" aria-label="Filtrar por tipo de producto">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className={`menu-filter-btn ${selectedType === filter.key ? 'active' : ''}`}
              onClick={() => handleSelectType(filter.key)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="menu-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar en el menú..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </label>
      </section>

      {errorMsg && <div className="menu-alert">{errorMsg}</div>}

      <section className="menu-layout">
        <div className="menu-grid-area">
          {loading ? (
            <p className="menu-status">Cargando menú...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="menu-empty">
              <Coffee size={42} strokeWidth={1.5} />
              <p>No encontramos productos con ese filtro o búsqueda.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredProducts.map((product) => {
                const isPackaged =
                  String(product.product_type || '').toUpperCase() === 'PACKAGED'
                const TypeIcon = isPackaged ? Package : Utensils

                return (
                  <article
                    key={product.id}
                    className={`menu-card ${isPackaged ? 'packaged' : 'prepared'}`}
                  >
                    <div className="menu-card-top">
                      <span className="menu-badge">
                        <TypeIcon size={14} />
                        {isPackaged ? 'Empaquetado' : 'Producto elaborado'}
                      </span>
                      <span className="menu-price">
                        ${Number(product.price).toFixed(2)}
                      </span>
                    </div>

                    <h3>{product.name}</h3>

                    <button
                      type="button"
                      className="menu-add-btn"
                      onClick={() => addToCart(product)}
                    >
                      <Plus size={18} />
                      Agregar al pedido
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </div>

        <aside className="menu-cart-panel">
          <h2>Tu pedido</h2>

          {orderFeedback && (
            <div className="menu-order-success">
              <CheckCircle2 size={20} />
              <div>
                <strong>¡Pedido #{orderFeedback.orderId} registrado!</strong>
                <span>Total: ${Number(orderFeedback.total).toFixed(2)}</span>
                {orderFeedback.invoiceError && (
                  <small>Comprobante pendiente: {orderFeedback.invoiceError}</small>
                )}
              </div>
            </div>
          )}

          {cart.length === 0 ? (
            <p className="menu-cart-empty">
              Todavía no agregás productos. Elegí alguno del menú para comenzar.
            </p>
          ) : (
            <>
              <div className="menu-cart-options">
                <label className="menu-cart-field">
                  <span>Sucursal</span>
                  <select
                    value={branchId}
                    onChange={(e) => setBranchId(e.target.value)}
                  >
                    <option value="" disabled>
                      Seleccioná una sucursal
                    </option>
                    {branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                        {branch.address ? ` — ${branch.address}` : ''}
                      </option>
                    ))}
                  </select>
                  {branches.length === 0 && (
                    <small>No hay sucursales registradas en la base de datos.</small>
                  )}
                </label>

                <label className="menu-cart-field">
                  <span>Comprobante</span>
                  <select
                    value={invoiceType}
                    onChange={(e) => setInvoiceType(e.target.value)}
                  >
                    <option value="NORMAL">Factura (Consumidor final)</option>
                    <option value="TAX_CREDIT">Crédito fiscal (+13% IVA)</option>
                  </select>
                </label>

                {invoiceType === 'TAX_CREDIT' && (
                  <div className="menu-tax-credit-fields">
                    <label className="menu-cart-field">
                      <span>NIT *</span>
                      <input
                        type="text"
                        placeholder="0614-000000-000-0"
                        value={taxCreditData.nit}
                        onChange={(e) =>
                          setTaxCreditData((prev) => ({
                            ...prev,
                            nit: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="menu-cart-field">
                      <span>NRC *</span>
                      <input
                        type="text"
                        placeholder="123456-7"
                        value={taxCreditData.nrc}
                        onChange={(e) =>
                          setTaxCreditData((prev) => ({
                            ...prev,
                            nrc: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="menu-cart-field">
                      <span>Institución / Razón social *</span>
                      <input
                        type="text"
                        placeholder="Nombre de la empresa o institución"
                        value={taxCreditData.institution_name}
                        onChange={(e) =>
                          setTaxCreditData((prev) => ({
                            ...prev,
                            institution_name: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="menu-cart-field">
                      <span>Giro (opcional)</span>
                      <input
                        type="text"
                        placeholder="Ej. Servicios de ingeniería"
                        value={taxCreditData.business_line}
                        onChange={(e) =>
                          setTaxCreditData((prev) => ({
                            ...prev,
                            business_line: e.target.value,
                          }))
                        }
                      />
                    </label>

                    <label className="menu-cart-field">
                      <span>Dirección fiscal (opcional)</span>
                      <input
                        type="text"
                        placeholder="Dirección de facturación"
                        value={taxCreditData.address}
                        onChange={(e) =>
                          setTaxCreditData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                      />
                    </label>
                  </div>
                )}
              </div>

              <ul className="menu-cart-list">
                {cart.map((item) => (
                  <li key={item.id} className="menu-cart-item">
                    <div>
                      <strong>{item.name}</strong>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>

                    <div className="menu-qty-controls">
                      <button
                        type="button"
                        aria-label={`Restar ${item.name}`}
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus size={15} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Sumar ${item.name}`}
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus size={15} />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="menu-cart-summary">
                <div className="menu-summary-row">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                {invoiceType === 'TAX_CREDIT' && (
                  <div className="menu-summary-row">
                    <span>IVA (13%)</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="menu-summary-total">
                  <span>Total</span>
                  <strong>${total.toFixed(2)}</strong>
                </div>

                <button
                  type="button"
                  className="menu-confirm-btn"
                  onClick={handleConfirmOrder}
                  disabled={submitting || branches.length === 0 || !branchId}
                >
                  {submitting ? 'Enviando pedido...' : 'Confirmar pedido'}
                </button>
              </div>
            </>
          )}
        </aside>
      </section>
    </main>
  )
}

export default MenuPage