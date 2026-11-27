import { useState, useRef, useEffect } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  ShoppingCart,
  X,
  Check,
  Plus,
  Trash2,
  Banknote,
  CalendarClock,
  Info
} from 'lucide-react'

import { getSuppliers } from '../../services/purchasesService'
import { getBranches } from '../../services/catalogService'
import { getInventorySupplies, getPackagedProducts } from '../../services/inventoryService'

import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'
import '../../styles/OrderForm.css'
import '../../styles/PurchaseOrderForm.css'
import '../../styles/PurchaseInvoiceForm.css'
import '../../styles/PurchaseForm.css'

const UNIT_LABELS = {
  G: 'Gramos',
  KG: 'Kilogramos',
  ML: 'Mililitros',
  L: 'Litros',
  UNIT: 'Unidades'
}

const PAYMENT_TERMS = [
  {
    id: 'CASH',
    label: 'Al contado',
    description: 'Pago inmediato',
    icon: Banknote
  },
  {
    id: 'CREDIT',
    label: 'Al crédito',
    description: 'Pago posterior',
    icon: CalendarClock
  }
]

const getToday = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const createInitialForm = () => ({
  supplier_id: '',
  branch_id: '',
  document_num: '',
  issue_date: getToday(),
  payment_terms: 'CASH',
  due_date: ''
})

const createItem = id => ({
  id,
  item_type: 'SUPPLY',
  item_id: '',
  quantity: '',
  unit_cost: ''
})

const roundMoney = value =>
  Math.round((value + Number.EPSILON) * 100) / 100

const formatMoney = value =>
  `$${Number(value).toFixed(2)}`

function PurchaseForm({
  isOpen,
  toggle,
  onSubmit
}) {
  const [form, setForm] = useState(createInitialForm)
  const [items, setItems] = useState([createItem(1)])
  const [suppliers, setSuppliers] = useState([])
  const [branches, setBranches] = useState([])
  const [supplies, setSupplies] = useState([])
  const [packagedProducts, setPackagedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const nextId = useRef(2)
  const submitLock = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setForm(createInitialForm())
    setItems([createItem(1)])
    nextId.current = 2
    setError('')
    setLoadError('')
    setLoading(true)
    Promise.all([getSuppliers(), getBranches(), getInventorySupplies(), getPackagedProducts()])
      .then(([supplierData, branchData, supplyData, packagedData]) => {
        if (!active) return
        setSuppliers(supplierData)
        setBranches(branchData)
        setSupplies(supplyData)
        setPackagedProducts(packagedData)
      })
      .catch(err => { if (active) setLoadError(err.message || 'No se pudieron cargar los datos.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [isOpen])

  const availableSupplies = form.supplier_id ? supplies.filter(
    supply =>
      Number(supply.supplier_id) ===
      Number(form.supplier_id)
  ) : []

  const availablePackagedProducts = form.supplier_id
    ? packagedProducts.filter(product => String(product.supplier_id) === form.supplier_id)
    : []

  const availableItemsCount =
    availableSupplies.length +
    availablePackagedProducts.length

  const isCredit = form.payment_terms === 'CREDIT'

  const updateField = (field, value) => {
    setForm(previous => ({
      ...previous,
      [field]: value,
      ...(field === 'payment_terms' && value === 'CASH'
        ? { due_date: '' }
        : {})
    }))
  }

  const changeSupplier = value => {
    updateField('supplier_id', value)
    setItems([createItem(1)])
    nextId.current = 2
  }

  const getAvailableItems = type =>
    type === 'SUPPLY'
      ? availableSupplies
      : availablePackagedProducts

  const getSelectedItem = item =>
    getAvailableItems(item.item_type).find(
      product => Number(product.id) === Number(item.item_id)
    )

  const addItem = () => {
    if (items.length >= availableItemsCount) return

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
      previous.map(item => {
        if (item.id !== id) return item

        if (field === 'item_type') {
          return {
            ...createItem(id),
            item_type: value
          }
        }

        if (field === 'item_id') {
          const selected = getAvailableItems(
            item.item_type
          ).find(
            product => Number(product.id) === Number(value)
          )

          return {
            ...item,
            item_id: value,
            quantity: '',
            unit_cost: selected?.unit_cost != null
              ? String(selected.unit_cost)
              : ''
          }
        }

        return {
          ...item,
          [field]: value
        }
      })
    )
  }

  const getItemTotal = item =>
    roundMoney(
      Number(item.quantity) * Number(item.unit_cost)
    )

  const subtotal = roundMoney(
    items.reduce(
      (sum, item) => sum + getItemTotal(item),
      0
    )
  )

  const tax = roundMoney(subtotal * 0.13)

  const total = roundMoney(subtotal + tax)

  const isValid =
    !loading && !loadError &&
    form.document_num.trim() !== '' &&
    form.document_num.trim().length <= 60 &&
    !form.document_num.trim().toUpperCase().startsWith('ORD-') &&
    suppliers.some(
      supplier =>
        Number(supplier.id) === Number(form.supplier_id)
    ) &&
    branches.some(
      branch =>
        Number(branch.id) === Number(form.branch_id)
    ) &&
    form.issue_date !== '' &&
    items.every(item => {
      const selected = getSelectedItem(item)
      const quantity = Number(item.quantity)
      const cost = Number(item.unit_cost)

      return (
        Boolean(selected) &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        item.unit_cost !== '' &&
        Number.isFinite(cost) &&
        cost >= 0 &&
        (
          selected?.unit !== 'UNIT' ||
          Number.isInteger(quantity)
        )
      )
    }) &&
    (
      !isCredit ||
      (
        form.due_date !== '' &&
        form.due_date >= form.issue_date
      )
    )

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || !isValid || submitLock.current) return
    submitLock.current = true
    setSubmitting(true)
    setError('')
    try {

    await onSubmit({
      supplier_id: Number(form.supplier_id),
      branch_id: Number(form.branch_id),
      document_num: form.document_num.trim(),
      issue_date: form.issue_date,
      payment_terms: form.payment_terms,
      due_date: isCredit ? form.due_date : null,
      subtotal,
      tax,
      total,
      items: items.map(item => ({
        supply_id:
          item.item_type === 'SUPPLY'
            ? Number(item.item_id)
            : null,
        packaged_product_id:
          item.item_type === 'PACKAGED'
            ? Number(item.item_id)
            : null,
        quantity: Number(item.quantity),
        unit_cost: Number(item.unit_cost),
        line_subtotal: getItemTotal(item)
      }))
    })
    } catch (err) {
      setError(err.message || 'No se pudo registrar la compra.')
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  const handleClose = () => { if (!submitLock.current) toggle() }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      backdrop={submitting ? 'static' : true}
      keyboard={!submitting}
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
            <span className="admin-eyebrow">
              COMPRAS Y PROVEEDORES
            </span>

            <h2>Nueva compra</h2>
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
          Registrá los artículos adquiridos y las
          condiciones de pago de la compra.
        </p>

        <form onSubmit={handleSubmit}>
          {loading && <p role="status">Cargando datos de compra...</p>}
          {loadError && <p role="alert">{loadError}</p>}
          {error && <p role="alert">{error}</p>}
          <fieldset disabled={loading || submitting || Boolean(loadError)} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          <div className="admin-form-grid">
            <label className="admin-form-field">
              <span>Proveedor</span>

              <select
                value={form.supplier_id}
                onChange={event =>
                  changeSupplier(event.target.value)
                }
                required
              >
                <option value="">
                  Seleccionar proveedor
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
                value={form.branch_id}
                onChange={event =>
                  updateField(
                    'branch_id',
                    event.target.value
                  )
                }
                required
              >
                <option value="">
                  Seleccionar sucursal
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

            <label className="admin-form-field">
              <span>Número de documento</span>

              <input
                type="text"
                placeholder="FAC-004"
                maxLength={60}
                required
                value={form.document_num}
                onChange={event =>
                  updateField(
                    'document_num',
                    event.target.value
                  )
                }
              />
            </label>

            <label className="admin-form-field">
              <span>Fecha de emisión</span>

              <input
                type="date"
                value={form.issue_date}
                onChange={event =>
                  updateField(
                    'issue_date',
                    event.target.value
                  )
                }
                required
              />
            </label>
          </div>

          <div className="recipe-form-section-heading">
            <h3>Artículos de la compra</h3>

            <span>
              {items.length}{' '}
              {items.length === 1
                ? 'artículo'
                : 'artículos'}
            </span>
          </div>

          {!form.supplier_id && (
            <div className="purchase-form-notice">
              <Info size={20} />

              <p>
                Seleccioná un proveedor para consultar
                los artículos disponibles.
              </p>
            </div>
          )}

          {form.supplier_id &&
            availableItemsCount === 0 && (
              <div className="purchase-form-notice">
                <Info size={20} />

                <p>
                  Este proveedor no tiene artículos
                  asociados.
                </p>
              </div>
            )}

          <div className="recipe-form-ingredients">
            {items.map((item, index) => {
              const selectedItem = getSelectedItem(item)

              const availableItems = getAvailableItems(
                item.item_type
              )

              const isUnit =
                selectedItem?.unit === 'UNIT'

              return (
                <article
                  className="recipe-form-ingredient"
                  key={item.id}
                >
                  <div className="recipe-form-ingredient-heading">
                    <span>ARTÍCULO {index + 1}</span>

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
                      <span>Tipo de artículo</span>

                      <select
                        value={item.item_type}
                        onChange={event =>
                          updateItem(
                            item.id,
                            'item_type',
                            event.target.value
                          )
                        }
                        disabled={!form.supplier_id}
                      >
                        <option value="SUPPLY">
                          Insumo
                        </option>
                        <option value="PACKAGED">Producto empaquetado</option>
                      </select>
                    </label>

                    <label className="admin-form-field purchase-order-product">
                      <span>
                        {item.item_type === 'SUPPLY'
                          ? 'Insumo'
                          : 'Producto empaquetado'}
                      </span>

                      <select
                        value={item.item_id}
                        onChange={event =>
                          updateItem(
                            item.id,
                            'item_id',
                            event.target.value
                          )
                        }
                        disabled={!form.supplier_id}
                        required
                      >
                        <option value="">
                          Seleccionar artículo
                        </option>

                        {availableItems.map(product => (
                          <option
                            key={product.id}
                            value={product.id}
                            disabled={items.some(
                              other =>
                                other.id !== item.id &&
                                other.item_type ===
                                  item.item_type &&
                                Number(other.item_id) ===
                                  Number(product.id)
                            )}
                          >
                            {product.name}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="admin-form-field">
                      <span>Cantidad</span>

                      <input
                        type="number"
                        min={isUnit ? '1' : '0.001'}
                        step={isUnit ? '1' : '0.001'}
                        placeholder="0"
                        value={item.quantity}
                        onChange={event =>
                          updateItem(
                            item.id,
                            'quantity',
                            event.target.value
                          )
                        }
                        disabled={!selectedItem}
                        required
                      />
                    </label>

                    <label className="admin-form-field">
                      <span>Unidad de medida</span>

                      <input
                        className="purchase-form-unit"
                        value={
                          UNIT_LABELS[selectedItem?.unit] ||
                          selectedItem?.unit ||
                          ''
                        }
                        placeholder="Automática"
                        readOnly
                      />
                    </label>

                    <label className="admin-form-field purchase-order-product">
                      <span>Costo unitario sin IVA ($)</span>

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
                        disabled={!selectedItem}
                        required
                      />

                      {selectedItem && (
                        <small className="purchase-cost-help">
                          Costo por cada unidad de medida
                          registrada en el inventario.
                        </small>
                      )}
                    </label>
                  </div>

                  <div className="purchase-order-subtotal">
                    <span>Subtotal del artículo</span>

                    <strong>
                      {formatMoney(getItemTotal(item))}
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
            disabled={
              !form.supplier_id ||
              items.length >= availableItemsCount
            }
          >
            <Plus size={20} />
            Agregar artículo
          </button>

          <section className="purchase-invoice-section">
            <h3>Condición de pago</h3>

            <div className="purchase-payment-options">
              {PAYMENT_TERMS.map(condition => {
                const PaymentIcon = condition.icon

                const isSelected =
                  form.payment_terms === condition.id

                return (
                  <button
                    key={condition.id}
                    type="button"
                    className={`purchase-payment-option ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() =>
                      updateField(
                        'payment_terms',
                        condition.id
                      )
                    }
                    aria-pressed={isSelected}
                  >
                    <PaymentIcon size={28} />

                    <strong>{condition.label}</strong>

                    <small>{condition.description}</small>

                    <span className="purchase-payment-indicator">
                      {isSelected && <Check size={14} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </section>

          {isCredit && (
            <div className="purchase-credit-section">
              <label className="admin-form-field">
                <span>Fecha límite de pago</span>

                <input
                  type="date"
                  min={form.issue_date}
                  value={form.due_date}
                  onChange={event =>
                    updateField(
                      'due_date',
                      event.target.value
                    )
                  }
                  required
                />
              </label>

              <p>
                La compra deberá registrarse como una
                obligación pendiente con el proveedor.
              </p>
            </div>
          )}

          <div className="order-summary">
            <div className="order-summary-row">
              <span>Subtotal</span>
              <strong>{formatMoney(subtotal)}</strong>
            </div>

            <div className="order-summary-row">
              <span>IVA (13%)</span>
              <strong>{formatMoney(tax)}</strong>
            </div>

            <div className="order-summary-total">
              <span>Total de la compra</span>
              <strong>{formatMoney(total)}</strong>
            </div>

            <div className="order-summary-row">
              <span>
                {isCredit
                  ? 'Saldo pendiente'
                  : 'Pago inmediato'}
              </span>

              <strong>{formatMoney(total)}</strong>
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
              title={
                !onSubmit
                  ? 'Pendiente de conexión'
                  : undefined
              }
            >
              <Check size={18} />
              {submitting ? 'Registrando...' : 'Registrar compra'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PurchaseForm