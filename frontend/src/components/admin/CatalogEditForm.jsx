import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Pencil, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'

// Se monta con key={product.id}: cada producto inicia con sus datos actuales
function CatalogEditForm({
  product,
  toggle,
  onSubmit,
  suppliers = [],
  suppliersError
}) {
  const [form, setForm] = useState({
    name: product.name,
    price: String(product.price),
    supplier_id: String(product.supplier_id ?? ''),
    unit_cost: String(product.unit_cost ?? '')
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPackaged = product.product_type === 'PACKAGED'

  const isValid =
    form.name.trim() !== '' &&
    Number(form.price) >= 0.01 &&
    (!isPackaged ||
      (form.supplier_id !== '' && Number(form.unit_cost) >= 0.01))

  const handleChange = event => {
    const { name, value } = event.target
    setForm(previous => ({ ...previous, [name]: value }))
  }

  const handleClose = () => {
    if (!isSubmitting) toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit(product.id, {
        name: form.name.trim(),
        price: Number(form.price),
        ...(isPackaged
          ? {
              supplierId: Number(form.supplier_id),
              unitCost: Number(form.unit_cost)
            }
          : {})
      })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo actualizar el producto.')
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen
      toggle={handleClose}
      centered
      scrollable
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon pink">
            <Pencil size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">CATÁLOGO</span>
            <h2>Editar producto</h2>
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
          Producto {isPackaged ? 'empaquetado' : 'preparado'}. El tipo no se
          puede cambiar.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del producto</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                disabled={isSubmitting}
                required
              />
            </label>

            <label className="admin-form-field wide">
              <span>Precio de venta ($)</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
                required
              />
            </label>

            {isPackaged && (
              <>
                <label className="admin-form-field">
                  <span>Proveedor</span>
                  <select
                    name="supplier_id"
                    value={form.supplier_id}
                    onChange={handleChange}
                    disabled={isSubmitting}
                    required
                  >
                    <option value="">Seleccionar proveedor</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="admin-form-field">
                  <span>Costo unitario ($)</span>
                  <input
                    type="number"
                    name="unit_cost"
                    value={form.unit_cost}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    disabled={isSubmitting}
                    required
                  />
                </label>
              </>
            )}
          </div>

          {isPackaged && suppliersError && (
            <p className="admin-form-error" role="alert">
              {suppliersError}
            </p>
          )}

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
              disabled={!isValid || isSubmitting}
            >
              <Check size={18} />
              {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default CatalogEditForm
