import { useState, useEffect } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  PackagePlus,
  Package,
  Warehouse,
  X,
  Check
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/ProductForm.css'

const INITIAL_FORM = {
  name: '',
  unit: '',
  supplier_id: '',
  branch_id: '',
  quantity: '',
  min_stock: ''
}

function ProductForm({
  isOpen,
  toggle,
  onSubmit,
  branches = [],
  suppliers = [],
  suppliersError,
  initialBranchId
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm({
        ...INITIAL_FORM,
        branch_id: String(initialBranchId || '')
      })

      setError('')
    }
  }, [isOpen, initialBranchId])

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleClose = () => {
    if (!isSubmitting) {
      toggle()
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || isSubmitting) return

    setError('')

    if (!form.name.trim()) {
      setError('Ingresá el nombre del insumo.')
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        name: form.name.trim(),
        unit: form.unit,
        branch_id: Number(form.branch_id),
        supplier_id: Number(form.supplier_id),
        quantity: Number(form.quantity),
        min_stock: Number(form.min_stock)
      })
    } catch (submitError) {
      setError(
        submitError.message ||
        'No se pudo registrar el insumo.'
      )
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
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <PackagePlus size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              INVENTARIO
            </span>

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
          Registrá un insumo o agregá existencias
          en la sucursal seleccionada.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="product-form-section-heading">
            <span className="product-form-section-icon blue">
              <Package size={20} />
            </span>

            <div>
              <h3>Información del insumo</h3>
              <p>Datos generales del ingrediente.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del insumo</span>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Harina de maíz"
                maxLength={100}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Unidad de medida</span>

              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                <option value="">
                  Seleccionar unidad
                </option>

                <option value="kg">Kilogramos</option>
                <option value="g">Gramos</option>
                <option value="L">Litros</option>
                <option value="ml">Mililitros</option>
                <option value="unit">Unidades</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Proveedor</span>

              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                disabled={isSubmitting}
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

              {suppliersError ? (
                <small className="admin-form-error">
                  {suppliersError}
                </small>
              ) : suppliers.length === 0 ? (
                <small>
                  No hay proveedores registrados.
                </small>
              ) : null}
            </label>
          </div>

          <div className="product-form-section-heading separated">
            <span className="product-form-section-icon pink">
              <Warehouse size={20} />
            </span>

            <div>
              <h3>Existencias por sucursal</h3>
              <p>Configuración del inventario.</p>
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Sucursal</span>

              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                disabled={isSubmitting}
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
              <span>Cantidad a ingresar</span>

              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0.00"
                min="0.001"
                step="0.001"
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                required
              />
            </label>
          </div>

          <div className="product-form-notice">
            <strong>Alerta de existencias</strong>

            <p>
              Cuando la cantidad disponible sea igual o inferior
              al stock mínimo, el insumo aparecerá con una alerta
              de stock bajo.
            </p>
          </div>

          {error && (
            <p className="admin-form-error" role="alert">
              {error}
            </p>
          )}

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
                isSubmitting ||
                !branches.length ||
                !suppliers.length ||
                Boolean(suppliersError)
              }
            >
              <Check size={18} />

              {isSubmitting
                ? 'Guardando...'
                : 'Registrar insumo'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ProductForm