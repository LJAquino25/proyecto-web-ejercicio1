import { useEffect, useRef, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  ShoppingCart,
  X,
  Check,
  Plus,
  Trash2
} from 'lucide-react'

import { getBranches, getCatalog } from '../../services/catalogService'
import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'
import '../../styles/OrderForm.css'

function OrderForm({ isOpen, toggle, onSubmit }) {
  const [products, setProducts] = useState([])
  const [branches, setBranches] = useState([])
  const [branchId, setBranchId] = useState('')
  const [invoiceType, setInvoiceType] = useState('NORMAL')
  const [items, setItems] = useState([{ id: 1, product_id: '', quantity: 1 }])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const nextId = useRef(2)

  useEffect(() => {
    if (!isOpen) return undefined

    let active = true
    setLoading(true)
    setError('')
    setBranchId('')
    setInvoiceType('NORMAL')
    setItems([{ id: 1, product_id: '', quantity: 1 }])
    nextId.current = 2

    Promise.all([getCatalog(), getBranches()])
      .then(([catalog, availableBranches]) => {
        if (active) {
          setProducts(Array.isArray(catalog) ? catalog : [])
          setBranches(availableBranches)
        }
      })
      .catch(loadError => {
        if (active) {
          setError(loadError.message || 'No se pudieron cargar los datos.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [isOpen])

  const addItem = () => {
    const id = nextId.current++
    setItems(previous => [...previous, { id, product_id: '', quantity: 1 }])
  }

  const removeItem = id => {
    setItems(previous =>
      previous.length > 1
        ? previous.filter(item => item.id !== id)
        : previous
    )
  }

  const updateItem = (id, name, value) => {
    setItems(previous =>
      previous.map(item =>
        item.id === id ? { ...item, [name]: value } : item
      )
    )
  }

  const getProduct = productId =>
    products.find(product => Number(product.id) === Number(productId))

  const getItemTotal = item =>
    Number(getProduct(item.product_id)?.price || 0) * Number(item.quantity || 0)

  const total = Number(
    items.reduce((sum, item) => sum + getItemTotal(item), 0).toFixed(2)
  )
  const tax = Number(((total * 13) / 113).toFixed(2))
  const subtotal = Number((total - tax).toFixed(2))

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await onSubmit({
        branchId: Number(branchId),
        invoiceType,
        orderItems: items.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo registrar el pedido.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      scrollable
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <ShoppingCart size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">VENTAS</span>
            <h2>Nuevo pedido</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={toggle}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Seleccioná la sucursal, el tipo de comprobante y los productos.
        </p>

        {error && <p className="sales-form-feedback" role="alert">{error}</p>}
        {loading && <p className="sales-form-feedback">Cargando catálogo y sucursales...</p>}

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Sucursal</span>
              <select
                value={branchId}
                onChange={event => setBranchId(event.target.value)}
                required
                disabled={loading}
              >
                <option value="">Seleccionar sucursal</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Tipo de comprobante</span>
              <select
                value={invoiceType}
                onChange={event => setInvoiceType(event.target.value)}
                required
              >
                <option value="NORMAL">Consumidor final</option>
                <option value="TAX_CREDIT">Crédito fiscal</option>
              </select>
            </label>
          </div>

          <div className="recipe-form-section-heading">
            <h3>Productos del pedido</h3>
            <span>{items.length} productos</span>
          </div>

          <div className="recipe-form-ingredients">
            {items.map((item, index) => (
              <div className="recipe-form-ingredient" key={item.id}>
                <div className="recipe-form-ingredient-heading">
                  <span>PRODUCTO {index + 1}</span>
                  <button
                    type="button"
                    className="recipe-form-remove"
                    onClick={() => removeItem(item.id)}
                    disabled={items.length === 1}
                    aria-label="Eliminar producto"
                    title="Eliminar producto"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="order-form-item-grid">
                  <label className="admin-form-field">
                    <span>Producto</span>
                    <select
                      value={item.product_id}
                      onChange={event =>
                        updateItem(item.id, 'product_id', event.target.value)
                      }
                      required
                      disabled={loading || products.length === 0}
                    >
                      <option value="">Seleccionar producto</option>
                      {products.map(product => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={items.some(
                            other =>
                              other.id !== item.id &&
                              Number(other.product_id) === Number(product.id)
                          )}
                        >
                          {product.name} - ${Number(product.price).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-form-field">
                    <span>Cantidad</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={event =>
                        updateItem(item.id, 'quantity', event.target.value)
                      }
                      required
                    />
                  </label>

                  <div className="order-item-subtotal">
                    <span>Subtotal</span>
                    <strong>${getItemTotal(item).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="recipe-form-add"
            onClick={addItem}
            disabled={items.length >= products.length || loading}
          >
            <Plus size={20} />
            Agregar producto
          </button>

          <div className="order-summary">
            <div className="order-summary-row">
              <span>Subtotal sin IVA</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </div>
            <div className="order-summary-row">
              <span>IVA incluido (13%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>
            <div className="order-summary-total">
              <span>Total del pedido</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-form-footer">
            <button type="button" className="admin-form-cancel" onClick={toggle}>
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit || loading || submitting || products.length === 0}
            >
              <Check size={18} />
              {submitting ? 'Registrando...' : 'Registrar pedido'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default OrderForm
