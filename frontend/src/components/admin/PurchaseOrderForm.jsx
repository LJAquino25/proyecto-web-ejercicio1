import { useState, useRef, useEffect } from 'react'
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

import { getSuppliers } from '../../services/purchasesService'
import { getBranches } from '../../services/catalogService'
import { getInventorySupplies, getPackagedProducts } from '../../services/inventoryService'

const roundMoney = value => Number(value.toFixed(2))

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
  const submitLock = useRef(false)
  const [suppliers, setSuppliers] = useState([])
  const [branches, setBranches] = useState([])
  const [supplies, setSupplies] = useState([])
  const [packagedProducts, setPackagedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setLoading(true)
    setLoadError('')
    setError('')
    setSupplierId('')
    setBranchId('')
    setDate(getToday())
    setItems([createItem(1)])
    nextId.current = 2
    Promise.all([
  getSuppliers(),
  getBranches(),
  getInventorySupplies(), getPackagedProducts()
])
  .then(([supplierData, branchData, supplyData, packagedData]) => {
    if (!active) return
    setSuppliers(supplierData)
    setBranches(branchData)
    setSupplies(supplyData)
    setPackagedProducts(packagedData)
  })
      .catch(err => {
        if (active) setLoadError(err.message || 'No se pudieron cargar los datos.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [isOpen])

  const products = supplierId ? [
    ...supplies.filter(supply => String(supply.supplier_id) === supplierId)
      .map(supply => ({ ...supply, key: `SUPPLY:${supply.id}`, type: 'SUPPLY' })),
    ...packagedProducts.filter(product => String(product.supplier_id) === supplierId)
      .map(product => ({ ...product, key: `PACKAGED:${product.id}`, type: 'PACKAGED' }))
  ] : []

  const addItem = () => {
    if (items.length >= products.length) return
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
          ? field === 'product_id'
            ? { ...item, product_id: value, quantity: '', unit_cost: String(products.find(product => product.key === value)?.unit_cost ?? '') }
            : { ...item, [field]: value }
          : item
      )
    )
  }

  const getProduct = key => products.find(product => product.key === key)

  const getItemTotal = item => roundMoney(Number(item.quantity) * Number(item.unit_cost))
  const subtotal = roundMoney(items.reduce((sum, item) => sum + getItemTotal(item), 0))
  const tax = roundMoney(subtotal * 0.13)
  const total = roundMoney(subtotal + tax)

  const isValid = !loading && !loadError &&
    suppliers.some(supplier => String(supplier.id) === supplierId) &&
    branches.some(branch => String(branch.id) === branchId) &&
    date >= getToday() &&
    items.every(item => {
      const product = getProduct(item.product_id)
      const quantity = Number(item.quantity)
      const cost = Number(item.unit_cost)
      return product && Number.isFinite(quantity) && quantity > 0 &&
        (product.unit !== 'UNIT' || Number.isInteger(quantity)) &&
        item.unit_cost !== '' && Number.isFinite(cost) && cost >= 0
    })

  const handleClose = () => {
    if (!submitLock.current) toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!onSubmit || !isValid || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    setError('')
    try {
      await onSubmit({
        supplier_id: Number(supplierId),
        branch_id: Number(branchId),
        expected_date: date,
        items: items.map(item => {
          const product = getProduct(item.product_id)
          return {
            [product.type === 'SUPPLY' ? 'supply_id' : 'packaged_product_id']: Number(product.id),
            quantity: Number(item.quantity),
            unit_cost: Number(item.unit_cost)
          }
        })
      })
    } catch (err) {
      setError(err.message || 'No se pudo registrar la orden.')
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      backdrop={submitting ? "static" : true}
      keyboard={!submitting}
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
          Seleccioná el proveedor y los artículos que
          necesitás solicitar.
        </p>

        <form onSubmit={handleSubmit}>
          {loading && <p role="status">Cargando datos...</p>}
          {loadError && <p role="alert">{loadError}</p>}
          {error && <p role="alert">{error}</p>}
          <fieldset disabled={loading || Boolean(loadError) || submitting} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Proveedor</span>

              <select
                value={supplierId}
                onChange={event =>
                  {
                    setSupplierId(event.target.value)
                    setItems([createItem(1)])
                    nextId.current = 2
                  }
                }
                required
              >
                <option value="">
                  Seleccioná un proveedor
                </option>

                {suppliers.map(supplier => (
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

                {branches.map(branch => (
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
              <span>Fecha esperada de entrega</span>

              <input
                type="date"
                min={getToday()}
                value={date}
                onChange={event =>
                  setDate(event.target.value)
                }
                required
              />
            </label>
          </div>

          <div className="recipe-form-section-heading">
            <h3>Artículos de la compra</h3>
            <span>{items.length} artículos</span>
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
                    <strong>Artículo {index + 1}</strong>

                    <button
                      type="button"
                      className="recipe-form-remove"
                      onClick={() => removeItem(item.id)}
                      disabled={items.length === 1}
                      aria-label="Eliminar artículo"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>

                  <div className="purchase-order-item-grid">
                    <label className="admin-form-field purchase-order-product">
                      <span>Artículo</span>

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
                          Seleccioná un artículo
                        </option>

                        {products.map(product => (
                          <option
                            key={product.key}
                            value={product.key}
                            disabled={items.some(
                              other =>
                                other.id !== item.id &&
                                other.product_id === product.key
                            )}
                          >
                            {product.name} ({product.type === 'SUPPLY' ? 'Insumo' : 'Empaquetado'})
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
                        min={product?.unit === 'UNIT' ? 1 : 0.001}
                        step={product?.unit === 'UNIT' ? 1 : 0.001}
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
                        min="0"
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
            disabled={items.length >= products.length}
          >
            <Plus size={19} />
            Agregar artículo
          </button>

          <p>
  Únicamente se pueden solicitar insumos y productos empaquetados
  asociados al proveedor seleccionado.
</p>
          <div className="order-summary">
            <div className="purchase-order-total"><span>Subtotal</span><strong>${subtotal.toFixed(2)}</strong></div>
            <div className="purchase-order-total"><span>IVA (13 %)</span><strong>${tax.toFixed(2)}</strong></div>
            <div className="purchase-order-total">
              <span>Total de la orden</span>

              <strong>${total.toFixed(2)}</strong>
            </div>
          </div>

          </fieldset>
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
              disabled={!onSubmit || !isValid || submitting}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              {submitting ? 'Registrando...' : 'Crear orden'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PurchaseOrderForm