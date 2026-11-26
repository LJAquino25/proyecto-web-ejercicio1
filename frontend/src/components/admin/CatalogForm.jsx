import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Store, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'
import RecipeIngredientEditor from './RecipeIngredientEditor'

const INITIAL_FORM = {
  name: '',
  type: '',
  price: '',
  supplier_id: '',
  unit_cost: '',
}

function CatalogForm({
  isOpen,
  toggle,
  onSubmit,
  suppliers,
  suppliersError,
  supplies,
  suppliesError,
}) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [ingredients, setIngredients] = useState([
    { rowId: 1, supply_id: '', quantity: '' },
  ])
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setForm(INITIAL_FORM)
      setIngredients([{ rowId: 1, supply_id: '', quantity: '' }])
      setError('')
    }
  }, [isOpen])

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
        name: form.name.trim(),
        price: Number(form.price),
        productType: form.type,
        supplierId: form.type === 'PACKAGED' ? Number(form.supplier_id) : null,
        unitCost: form.type === 'PACKAGED' ? Number(form.unit_cost) : null,
        ingredients:
          form.type === 'PREPARED'
            ? ingredients.map(({ supply_id, quantity }) => ({
                id: Number(supply_id),
                quantity: Number(quantity),
              }))
            : undefined,
      })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo registrar el producto.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isPackaged = form.type === 'PACKAGED'

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
          <span className="admin-form-icon pink">
            <Store size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">CATÁLOGO</span>
            <h2>Nuevo producto</h2>
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
          Los productos preparados requieren receta; los empaquetados requieren proveedor y costo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del producto</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Pupusa revuelta"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Tipo de producto</span>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar tipo</option>
                <option value="PREPARED">Preparado</option>
                <option value="PACKAGED">Empaquetado</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Precio de venta ($)</span>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
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
                    placeholder="0.00"
                    min="0.01"
                    step="0.01"
                    required
                  />
                </label>
              </>
            )}
          </div>

          {form.type === 'PREPARED' && (
            <RecipeIngredientEditor
              ingredients={ingredients}
              supplies={supplies}
              onChange={setIngredients}
              disabled={isSubmitting}
            />
          )}

          {form.type === 'PREPARED' && suppliesError && (
            <p className="admin-form-error" role="alert">{suppliesError}</p>
          )}
          {form.type === 'PREPARED' && !suppliesError && supplies.length === 0 && (
            <p className="admin-form-error" role="alert">
              Registrá insumos en el inventario antes de crear productos preparados.
            </p>
          )}
          {isPackaged && suppliersError && (
            <p className="admin-form-error" role="alert">{suppliersError}</p>
          )}
          {isPackaged && !suppliersError && suppliers.length === 0 && (
            <p className="admin-form-error" role="alert">
              Registrá un proveedor antes de crear productos empaquetados.
            </p>
          )}
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
              disabled={
                isSubmitting ||
                (isPackaged && !suppliers.length) ||
                (form.type === 'PREPARED' && (!supplies.length || suppliesError))
              }
            >
              <Check size={18} />
              {isSubmitting ? 'Guardando...' : 'Registrar producto'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default CatalogForm
