import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { PackagePlus, X, Check } from 'lucide-react'
import { getSuppliers } from '../../services/inventoryService'
import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  supplier_id: '',
  unit: 'G',
  quantity: '',
  min_stock: '0'
}

function InventorySupplyForm({
  isOpen,
  toggle,
  branchName,
  onSubmit
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [suppliers, setSuppliers] = useState([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    let active = true
    setForm(INITIAL_FORM)
    setError('')
    setLoadError('')
    setLoadingSuppliers(true)

    getSuppliers()
      .then(data => {
        if (active) setSuppliers(data)
      })
      .catch(loadError => {
        if (active) {
          setLoadError(loadError.message || 'No se pudieron cargar los proveedores.')
          setSuppliers([])
        }
      })
      .finally(() => {
        if (active) setLoadingSuppliers(false)
      })

    return () => {
      active = false
    }
  }, [isOpen])

  const handleChange = event => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
    setError('')
  }

  const handleClose = () => {
    if (!isSubmitting) toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!onSubmit || isSubmitting) return

    setError('')
    setIsSubmitting(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        supplier_id: Number(form.supplier_id),
        unit: form.unit,
        quantity: Number(form.quantity),
        min_stock: Number(form.min_stock)
      })
      toggle()
    } catch (submitError) {
      setError(submitError.message || 'No se pudo agregar el insumo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      scrollable
      className="admin-form-modal"
      backdrop={isSubmitting ? 'static' : true}
      keyboard={!isSubmitting}
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            <PackagePlus size={28} />
          </span>
          <div>
            <span className="admin-eyebrow">INVENTARIO</span>
            <h2>Agregar insumo</h2>
          </div>
          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            disabled={isSubmitting}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Registrá un insumo nuevo o agregá existencias. La cantidad se sumará al stock de {branchName || 'la sucursal seleccionada'}.
        </p>

        {loadError && <p className="admin-form-error" role="alert">{loadError}</p>}
        {error && <p className="admin-form-error" role="alert">{error}</p>}

        <form onSubmit={handleSubmit}>
          <fieldset
            disabled={loadingSuppliers || Boolean(loadError) || isSubmitting}
            style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}
          >
            <div className="admin-form-grid">
              <label className="admin-form-field wide">
                <span>Nombre del insumo</span>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  autoComplete="off"
                />
              </label>

              <label className="admin-form-field">
                <span>Proveedor</span>
                <select
                  name="supplier_id"
                  value={form.supplier_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {loadingSuppliers ? 'Cargando proveedores...' : 'Seleccionar proveedor'}
                  </option>
                  {suppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </option>
                  ))}
                </select>
                {!loadingSuppliers && !loadError && suppliers.length === 0 && (
                  <small>Primero registrá un proveedor en Compras.</small>
                )}
              </label>

              <label className="admin-form-field">
                <span>Unidad de medida</span>
                <select name="unit" value={form.unit} onChange={handleChange} required>
                  <option value="G">Gramos (g)</option>
                  <option value="KG">Kilogramos (kg)</option>
                  <option value="ML">Mililitros (ml)</option>
                  <option value="L">Litros (l)</option>
                  <option value="UNIT">Unidades</option>
                </select>
              </label>

              <label className="admin-form-field">
                <span>Cantidad que ingresa</span>
                <input
                  name="quantity"
                  type="number"
                  min={form.unit === 'UNIT' ? '1' : '0.001'}
                  step={form.unit === 'UNIT' ? '1' : '0.001'}
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </label>

              <label className="admin-form-field">
                <span>Stock mínimo para alertas</span>
                <input
                  name="min_stock"
                  type="number"
                  min="0"
                  step={form.unit === 'UNIT' ? '1' : '0.001'}
                  value={form.min_stock}
                  onChange={handleChange}
                  required
                />
              </label>
            </div>
          </fieldset>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="admin-form-submit"
              disabled={
                !onSubmit ||
                loadingSuppliers ||
                Boolean(loadError) ||
                suppliers.length === 0 ||
                isSubmitting
              }
            >
              <Check size={18} />
              {isSubmitting ? 'Guardando...' : 'Agregar al inventario'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default InventorySupplyForm
