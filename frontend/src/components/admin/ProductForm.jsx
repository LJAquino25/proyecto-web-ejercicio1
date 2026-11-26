import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { PackagePlus, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  unit: '',
  branch_id: '',
  quantity: '',
  min_stock: '',
  supplier_id: '',
}

function ProductForm({
  isOpen,
  toggle,
  onSubmit,
  branches,
  suppliers,
  suppliersError,
  initialBranchId,
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM, branch_id: initialBranchId || '' })
      setError('')
    }
  }, [isOpen, initialBranchId])

  const handleChange = event => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        ...form,
        branch_id: Number(form.branch_id),
        supplier_id: Number(form.supplier_id),
        quantity: Number(form.quantity),
        min_stock: Number(form.min_stock),
      })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo registrar el insumo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <PackagePlus size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">INVENTARIO</span>
            <h2>Agregar insumo</h2>
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
          Registrá un insumo o agregá existencias en la sucursal seleccionada.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del insumo</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Harina de maíz"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Unidad de medida</span>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar unidad</option>
                <option value="kg">Kilogramos</option>
                <option value="g">Gramos</option>
                <option value="L">Litros</option>
                <option value="ml">Mililitros</option>
                <option value="unit">Unidades</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Sucursal</span>
              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                required
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
              <span>Cantidad a ingresar</span>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0.00"
                min="0.001"
                step="0.001"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Stock mínimo</span>
              <input
                type="number"
                name="min_stock"
                value={form.min_stock}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.001"
                required
              />
            </label>

            <label className="admin-form-field wide">
              <span>Proveedor</span>
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar proveedor</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {suppliersError ? (
                <small className="admin-form-error">{suppliersError}</small>
              ) : suppliers.length === 0 ? (
                <small>No hay proveedores registrados.</small>
              ) : null}
            </label>
          </div>

          {error && <p className="admin-form-error" role="alert">{error}</p>}

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={toggle}
              disabled={isSubmitting}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={isSubmitting || !branches.length || !suppliers.length}
            >
              <Check size={18} />
              {isSubmitting ? 'Guardando...' : 'Registrar insumo'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ProductForm
