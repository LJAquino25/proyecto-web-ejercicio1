import { useState, useEffect, useRef } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Receipt, X, Check, Banknote, CalendarClock } from 'lucide-react'
import { getPurchaseOrders } from '../../services/purchasesService'
import { getBranches } from '../../services/catalogService'
import '../../styles/AdminForm.css'
import '../../styles/OrderForm.css'
import '../../styles/PurchaseInvoiceForm.css'

const PAYMENT_CONDITIONS = [
  { id: 'CASH', label: 'Al contado', description: 'Pago inmediato', icon: Banknote },
  { id: 'CREDIT', label: 'Al crédito', description: 'Pago posterior', icon: CalendarClock }
]

const getToday = () => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const createInitialForm = () => ({
  purchase_order_id: '',
  invoice_number: '',
  issue_date: getToday(),
  payment_condition: 'CASH',
  due_date: ''
})

function PurchaseInvoiceForm({ isOpen, toggle, onSubmit }) {
  const [form, setForm] = useState(createInitialForm)
  const [orders, setOrders] = useState([])
  const [branches, setBranches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)

  useEffect(() => {
    if (!isOpen) return
    let active = true
    setForm(createInitialForm())
    setOrders([])
    setBranches([])
    setLoading(true)
    setLoadError('')
    setError('')
    Promise.all([getPurchaseOrders('PENDING'), getBranches()])
      .then(([data, branchData]) => {
        if (!active) return
        setOrders(data.filter(order => order.order_status === 'PENDING'))
        setBranches(branchData)
      })
      .catch(err => {
        if (active) setLoadError(err.message || 'No se pudieron cargar las órdenes.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [isOpen])

  const updateField = (field, value) => {
    setError('')
    setForm(previous => ({ ...previous, [field]: value }))
  }

  const selectedOrder = orders.find(order => Number(order.id) === Number(form.purchase_order_id))

  const branch = branches.find(item => Number(item.id) === Number(selectedOrder?.branch_id))

  const total = Number(selectedOrder?.total || 0)

  const items = selectedOrder?.items || []

  const isCredit = form.payment_condition === 'CREDIT'

  const documentNum = form.invoice_number.trim()

  const validItems = Array.isArray(items) && items.length > 0 && items.every(item => {
    const quantity = Number(item.quantity)
    const cost = Number(item.unit_cost)
    return Boolean(item.supply_id) !== Boolean(item.packaged_product_id) &&
      Number.isFinite(quantity) && quantity > 0 &&
      item.unit_cost != null && Number.isFinite(cost) && cost >= 0 &&
      (!item.packaged_product_id || Number.isInteger(quantity))
  })

  const isValid = !loading && !loadError && Boolean(selectedOrder) && validItems &&
    Number(selectedOrder?.supplier_id) > 0 && Boolean(branch) &&
    Number.isFinite(total) && documentNum.length > 0 && documentNum.length <= 60 &&
    !/^ORD-/i.test(documentNum) && Boolean(form.issue_date) &&
    (!isCredit || (form.due_date !== '' && form.due_date >= form.issue_date))

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
        purchase_order_id: Number(selectedOrder.id),
        supplier_id: Number(selectedOrder.supplier_id),
        branch_id: Number(selectedOrder.branch_id),
        document_num: documentNum,
        issue_date: form.issue_date,
        payment_terms: form.payment_condition,
        due_date: isCredit ? form.due_date : null,
        items: items.map(item => ({
          supply_id: item.supply_id ? Number(item.supply_id) : null,
          packaged_product_id: item.packaged_product_id ? Number(item.packaged_product_id) : null,
          quantity: Number(item.quantity),
          unit_cost: Number(item.unit_cost)
        }))
      })
      setOrders(previous => previous.filter(order => Number(order.id) !== Number(selectedOrder.id)))
      setForm(createInitialForm())
    } catch (err) {
      setError(err.message || 'No se pudo registrar la factura.')
    } finally {
      submitLock.current = false
      setSubmitting(false)
    }
  }

  return (
    <Modal isOpen={isOpen} toggle={handleClose} centered scrollable size="lg" className="admin-form-modal" backdrop={submitting ? 'static' : true} keyboard={!submitting}>
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon pink"><Receipt size={28} /></span>
          <div>
            <span className="admin-eyebrow">COMPRAS Y PROVEEDORES</span>
            <h2>Nueva factura de compra</h2>
          </div>
          <button type="button" className="admin-form-close" onClick={handleClose} disabled={submitting} aria-label="Cerrar"><X size={24} /></button>
        </div>
        <p className="admin-form-description">Registrá la factura recibida y las condiciones de pago de la compra.</p>
        {loadError && <p role="alert">{loadError}</p>}
        {error && <p role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <fieldset disabled={submitting}>
            <div className="admin-form-grid">
              <label className="admin-form-field wide">
                <span>Orden de compra</span>
                <select value={form.purchase_order_id} onChange={event => updateField('purchase_order_id', event.target.value)} required disabled={loading || Boolean(loadError)}>
                  <option value="">{loading ? 'Cargando órdenes...' : orders.length ? 'Seleccioná una orden de compra' : 'No hay órdenes pendientes'}</option>
                  {orders.map(order => <option key={order.id} value={order.id}>{order.document_num} - {order.supplier_name}</option>)}
                </select>
              </label>
              {selectedOrder && (
                <div className="purchase-invoice-information">
                  <div><span>Proveedor</span><strong>{selectedOrder.supplier_name}</strong></div>
                  <div><span>Sucursal</span><strong>{branch?.name || `Sucursal ${selectedOrder.branch_id}`}</strong></div>
                </div>
              )}
              <label className="admin-form-field">
                <span>Número de factura</span>
                <input type="text" placeholder="FAC-004" maxLength={60} value={form.invoice_number} onChange={event => updateField('invoice_number', event.target.value)} required />
              </label>
              <label className="admin-form-field">
                <span>Fecha de emisión</span>
                <input type="date" value={form.issue_date} onChange={event => updateField('issue_date', event.target.value)} required />
              </label>
            </div>
            {/^ORD-/i.test(documentNum) && <p role="alert">El número de factura no puede comenzar con ORD-.</p>}
            {selectedOrder && (
              <section className="purchase-invoice-section">
                <h3>Artículos de la orden</h3>
                <p>Se registrará la recepción completa de estos artículos.</p>
                {Array.isArray(items) && items.map((item, index) => (
                  <div className="order-summary-row" key={item.detail_id ?? index}>
                    <span>{item.item_name} × {item.quantity}</span>
                    <strong>${Number(item.line_subtotal).toFixed(2)}</strong>
                  </div>
                ))}
                {!validItems && <p role="alert">La orden contiene artículos inválidos o cantidades fraccionarias de productos empaquetados.</p>}
              </section>
            )}
            <section className="purchase-invoice-section">
              <h3>Condición de pago</h3>
              <div className="purchase-payment-options">
                {PAYMENT_CONDITIONS.map(condition => {
                  const PaymentIcon = condition.icon
                  const isSelected = form.payment_condition === condition.id
                  return (
                    <button key={condition.id} type="button" className={`purchase-payment-option ${isSelected ? 'selected' : ''}`} onClick={() => updateField('payment_condition', condition.id)} aria-pressed={isSelected}>
                      <PaymentIcon size={28} />
                      <strong>{condition.label}</strong>
                      <small>{condition.description}</small>
                      <span className="purchase-payment-indicator">{isSelected && <Check size={14} />}</span>
                    </button>
                  )
                })}
              </div>
            </section>
            {isCredit && (
              <div className="purchase-credit-section">
                <label className="admin-form-field">
                  <span>Fecha límite de pago</span>
                  <input type="date" min={form.issue_date} value={form.due_date} onChange={event => updateField('due_date', event.target.value)} required />
                </label>
                <p>Esta compra generará una cuenta por pagar cuando se registre correctamente.</p>
              </div>
            )}
            <div className="order-summary">
              <div className="order-summary-row"><span>Subtotal de la orden</span><strong>${Number(selectedOrder?.subtotal || 0).toFixed(2)}</strong></div>
              <div className="order-summary-row"><span>IVA (13 %)</span><strong>${Number(selectedOrder?.tax || 0).toFixed(2)}</strong></div>
              <div className="order-summary-total"><span>Total estimado de la factura</span><strong>${total.toFixed(2)}</strong></div>
              <div className="order-summary-row"><span>{isCredit ? 'Saldo pendiente' : 'Pago inmediato'}</span><strong>${total.toFixed(2)}</strong></div>
            </div>
          </fieldset>
          <div className="admin-form-footer">
            <button type="button" className="admin-form-cancel" onClick={handleClose} disabled={submitting}>Cancelar</button>
            <button type="submit" className="admin-form-submit" disabled={!onSubmit || !isValid || submitting} title={!onSubmit ? 'Pendiente de conexión' : undefined}>
              <Check size={18} />{submitting ? 'Registrando...' : 'Registrar factura'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default PurchaseInvoiceForm
