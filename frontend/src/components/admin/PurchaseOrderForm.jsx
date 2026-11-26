import { useState, useRef } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  ClipboardList,
  X,
  Check,
  Plus,
  Trash2
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'
import '../../styles/OrderForm.css'
import '../../styles/PurchaseOrderForm.css'

const SUPPLIERS = [
  { id: 1, name: 'Distribuidora La Central' },
  { id: 2, name: 'Lácteos del Valle' },
  { id: 3, name: 'Café de Occidente' }
]

const BRANCHES = [
  { id: 1, name: 'Centro Histórico' },
  { id: 2, name: 'Escalón' },
  { id: 3, name: 'Santa Elena' }
]

const PRODUCTS = [
  { id: 1, name: 'Harina de maíz', unit: 'kg' },
  { id: 2, name: 'Queso', unit: 'kg' },
  { id: 3, name: 'Crema', unit: 'L' },
  { id: 4, name: 'Café molido', unit: 'kg' },
  { id: 5, name: 'Aceite', unit: 'L' },
  { id: 6, name: 'Azúcar', unit: 'kg' }
]

const createItem = id => ({
  id,
  product_id: '',
  quantity: '',
  unit_cost: ''
})

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function PurchaseOrderForm({ isOpen, toggle, onSubmit }) {
  const [supplierId, setSupplierId] = useState('')
  const [branchId, setBranchId] = useState('')
  const [date, setDate] = useState(getToday)
  const [items, setItems] = useState([createItem(1)])

  const nextId = useRef(2)

  const addItem = () => {
    const id = nextId.current++

    setItems(previous => [
      ...previous,
      createItem(id)
    ])
  }

  const removeItem = id => {
    setItems(previous =>
      previous.length > 1
        ? previous.filter(item => item.id !== id)
        : previous
    )
  }

  const updateItem = (id, field, value) => {
    setItems(previous =>
      previous.map(item =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    )
  }

  const getProduct = id =>
    PRODUCTS.find(product => product.id === Number(id))

  const getItemTotal = item =>
    Math.round(
      Number(item.quantity) * Number(item.unit_cost) * 100
    ) / 100

  const total = items.reduce(
    (sum, item) => sum + getItemTotal(item),
    0
  )

  const isValid =
    supplierId !== '' &&
    branchId !== '' &&
    date !== '' &&
    items.every(item =>
      item.product_id !== '' &&
      Number(item.quantity) > 0 &&
      Number(item.unit_cost) > 0
    )

  const handleClose = () => {
    setSupplierId('')
    setBranchId('')
    setDate(getToday())
    setItems([createItem(1)])
    nextId.current = 2
    toggle()
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !isValid) return

    onSubmit({
      supplier_id: Number(supplierId),
      branch_id: Number(branchId),
      date,
      items: items.map(item => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost)
      }))
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      scrollable
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <ClipboardList size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              COMPRAS Y PROVEEDORES
            </span>

            <h2>Nueva orden de compra</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Seleccioná el proveedor y los insumos que
          necesitás solicitar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Proveedor</span>

              <select
                value={supplierId}
                onChange={event =>
                  setSupplierId(event.target.value)
                }
                required
              >
                <option value="">
                  Seleccioná un proveedor
                </option>

                {SUPPLIERS.map(supplier => (
                  <option
                    key={supplier.id}
                    value={supplier.id}
                  >
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field">
              <span>Sucursal</span>

              <select
                value={branchId}
                onChange={event =>
                  setBranchId(event.target.value)
                }
                required
              >
                <option value="">
                  Seleccioná una sucursal
                </option>

                {BRANCHES.map(branch => (
                  <option
                    key={branch.id}
                    value={branch.id}
                  >
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="admin-form-field wide">
              <span>Fecha de solicitud</span>

              <input
                type="date"
                value={date}
                onChange={event =>
                  setDate(event.target.value)
                }
                required
              />
            </label>
          </div>

          <div className="recipe-form-section-heading">
            <h3>Insumos de la compra</h3>
            <span>{items.length} insumos</span>
          </div>

          <div className="recipe-form-ingredients">
            {items.map((item, index) => {
              const product = getProduct(item.product_id)

              return (
                <article
                  className="recipe-form-ingredient"
                  key={item.id}
                >
                  <div className="recipe-form-ingredient-heading">
                    <strong>Insumo {index + 1}</strong>

                    <button
                      type="button"
                      className="recipe-form-remove"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      aria-label="Eliminar insumo"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="purchase-order-item-grid">
                    <label className="admin-form-field purchase-order-product">
                      <span>Insumo</span>

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
                        <option value="">
                          Seleccioná un insumo
                        </option>

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
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-form-field">
                      <span>
                        Cantidad {product ? `(${product.unit})` : ''}
                      </span>

                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        placeholder="0"
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

                    <label className="admin-form-field">
                      <span>Costo unitario ($)</span>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        placeholder="0.00"
                        value={item.unit_cost}
                        onChange={event =>
                          updateItem(
                            item.id,
                            'unit_cost',
                            event.target.value
                          )
                        }
                        required
                      />
                    </label>
                  </div>

                  <div className="purchase-order-subtotal">
                    <span>Subtotal</span>

                    <strong>
                      ${getItemTotal(item).toFixed(2)}
                    </strong>
                  </div>
                </article>
              )
            })}
          </div>

          <button
            type="button"
            className="recipe-form-add"
            onClick={addItem}
            disabled={items.length >= PRODUCTS.length}
          >
            <Plus size={19} />
            Agregar insumo
          </button>

          <div className="order-summary">
            <div className="purchase-order-total">
              <span>Total de la orden</span>

              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit || !isValid}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              Crear orden
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PurchaseOrderForm