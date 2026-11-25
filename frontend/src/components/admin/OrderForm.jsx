import { useState, useRef } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  ShoppingCart,
  X,
  Check,
  Plus,
  Trash2
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'
import '../../styles/OrderForm.css'

const PRODUCTS = [
  { id: 1, name: 'Pupusa revuelta', price: 1.25 },
  { id: 2, name: 'Café de olla', price: 1.50 },
  { id: 3, name: 'Quesadilla', price: 2.00 },
  { id: 4, name: 'Tamales de pollo', price: 1.50 },
  { id: 5, name: 'Agua embotellada', price: 0.75 },
  { id: 6, name: 'Gaseosa', price: 1.00 }
]

const BRANCHES = [
  { id: 1, name: 'Centro Histórico' },
  { id: 2, name: 'Escalón' },
  { id: 3, name: 'Santa Elena' }
]

function OrderForm({ isOpen, toggle, onSubmit }) {
  const [branchId, setBranchId] = useState('')
  const [invoiceType, setInvoiceType] = useState('CF')
  const nextId = useRef(2)

  const [items, setItems] = useState([
    { id: 1, product_id: '', quantity: 1 }
  ])

  const addItem = () => {
    const id = nextId.current++

    setItems(previous => [
      ...previous,
      { id, product_id: '', quantity: 1 }
    ])
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
        item.id === id
          ? { ...item, [name]: value }
          : item
      )
    )
  }

  const getProduct = productId => {
    return PRODUCTS.find(
      product => product.id === Number(productId)
    )
  }

  const getItemTotal = item => {
    const product = getProduct(item.product_id)

    return (product?.price || 0) * Number(item.quantity)
  }

  const total = items.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  )

  const subtotal = total / 1.13
  const tax = total - subtotal

  const handleSubmit = event => {
    event.preventDefault()

    if (onSubmit) {
      onSubmit({
        branch_id: Number(branchId),
        invoice_type: invoiceType,
        orderItems: items.map(item => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity)
        }))
      })
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
          Seleccioná los productos y cantidades del pedido.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Sucursal</span>

              <select
                value={branchId}
                onChange={event => setBranchId(event.target.value)}
                required
              >
                <option value="">Seleccionar sucursal</option>

                {BRANCHES.map(branch => (
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
                <option value="CF">Consumidor final</option>
                <option value="CCF">Crédito fiscal</option>
              </select>
            </label>
          </div>

          <div className="recipe-form-section-heading">
            <h3>Productos del pedido</h3>
            <span>{items.length} productos</span>
          </div>

          <div className="recipe-form-ingredients">
            {items.map((item, index) => (
              <div
                className="recipe-form-ingredient"
                key={item.id}
              >
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
                        updateItem(
                          item.id,
                          'product_id',
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">Seleccionar producto</option>

                      {PRODUCTS.map(product => (
                        <option
                          key={product.id}
                          value={product.id}
                          disabled={items.some(
                            other =>
                              other.id !== item.id &&
                              Number(other.product_id) === product.id
                          )}
                        >
                          {product.name} - ${product.price.toFixed(2)}
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
                        updateItem(
                          item.id,
                          'quantity',
                          event.target.value
                        )
                      }
                      required
                    />
                  </label>

                  <div className="order-item-subtotal">
                    <span>Subtotal</span>
                    <strong>
                      ${getItemTotal(item).toFixed(2)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="recipe-form-add"
            onClick={addItem}
            disabled={items.length >= PRODUCTS.length}
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
              <span>IVA (13%)</span>
              <strong>${tax.toFixed(2)}</strong>
            </div>

            <div className="order-summary-total">
              <span>Total del pedido</span>
              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={toggle}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              Registrar pedido
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default OrderForm