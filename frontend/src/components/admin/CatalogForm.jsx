import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  Store,
  CookingPot,
  Package,
  Truck,
  Info,
  Circle,
  CheckCircle2,
  X,
  Check
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/CatalogForm.css'

import RecipeIngredientEditor from './RecipeIngredientEditor'

const PRODUCT_TYPES = [
  {
    value: 'PREPARED',
    label: 'Preparado',
    description: 'Elaborado en el restaurante',
    icon: CookingPot
  },
  {
    value: 'PACKAGED',
    label: 'Empaquetado',
    description: 'Producto de venta directa',
    icon: Package
  }
]

const INITIAL_FORM = {
  name: '',
  type: '',
  price: '',
  supplier_id: '',
  unit_cost: ''
}

function CatalogForm({
  isOpen,
  toggle,
  onSubmit,
  suppliers = [],
  suppliersError,
  supplies = [],
  suppliesError
}) {
  const [form, setForm] = useState(INITIAL_FORM)

  const [ingredients, setIngredients] = useState([
    { rowId: 1, supply_id: '', quantity: '' }
  ])

  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPackaged = form.type === 'PACKAGED'
  const isPrepared = form.type === 'PREPARED'

  useEffect(() => {
    if (isOpen) {
      setForm({ ...INITIAL_FORM })
      setIngredients([
        { rowId: 1, supply_id: '', quantity: '' }
      ])
      setError('')
    }
  }, [isOpen])

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const changeType = type => {
    setForm(previous => ({
      ...previous,
      type,
      supplier_id: '',
      unit_cost: ''
    }))

    setError('')
  }

  const handleClose = () => {
    if (!isSubmitting) {
      toggle()
    }
  }

  const hasValidIngredients =
    ingredients.length > 0 &&
    ingredients.every(ingredient =>
      ingredient.supply_id !== '' &&
      Number(ingredient.supply_id) > 0 &&
      Number.isFinite(Number(ingredient.quantity)) &&
      Number(ingredient.quantity) > 0
    )

  const isValid =
    form.name.trim() !== '' &&
    form.type !== '' &&
    form.price !== '' &&
    Number.isFinite(Number(form.price)) &&
    Number(form.price) >= 0.01 &&
    (
      isPackaged
        ? !suppliersError &&
          suppliers.length > 0 &&
          form.supplier_id !== '' &&
          form.unit_cost !== '' &&
          Number.isFinite(Number(form.unit_cost)) &&
          Number(form.unit_cost) >= 0.01
        : !suppliesError &&
          supplies.length > 0 &&
          hasValidIngredients
    )

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || !isValid || isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        name: form.name.trim(),
        price: Number(form.price),
        productType: form.type,
        supplierId: isPackaged
          ? Number(form.supplier_id)
          : null,
        unitCost: isPackaged
          ? Number(form.unit_cost)
          : null,
        ingredients: isPrepared
          ? ingredients.map(({ supply_id, quantity }) => ({
              id: Number(supply_id),
              quantity: Number(quantity)
            }))
          : undefined
      })
    } catch (submitError) {
      setError(
        submitError.message ||
        'No se pudo registrar el producto.'
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
          <span className="admin-form-icon pink">
            <Store size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              CATÁLOGO
            </span>

            <h2>Nuevo producto</h2>
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
          Agregá un nuevo producto al menú de Orígenes SV.
          Los productos preparados requieren ingredientes
          y los empaquetados requieren proveedor y costo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="catalog-form-type-section">
            <span className="catalog-form-label">
              Tipo de producto
            </span>

            <div className="catalog-form-types">
              {PRODUCT_TYPES.map(type => {
                const TypeIcon = type.icon
                const isSelected = form.type === type.value

                return (
                  <button
                    key={type.value}
                    type="button"
                    className={`catalog-form-type ${
                      isSelected ? 'selected' : ''
                    }`}
                    onClick={() => changeType(type.value)}
                    aria-pressed={isSelected}
                    disabled={isSubmitting}
                  >
                    <div className="catalog-form-type-heading">
                      <TypeIcon size={28} />

                      {isSelected ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Circle size={20} />
                      )}
                    </div>

                    <strong>{type.label}</strong>
                    <span>{type.description}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del producto</span>

              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={
                  isPackaged
                    ? 'Ej. Agua embotellada'
                    : 'Ej. Pupusa revuelta'
                }
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
                placeholder="0.00"
                min="0.01"
                step="0.01"
                disabled={isSubmitting}
                required
              />
            </label>
          </div>

          {isPackaged && (
            <section className="catalog-form-supplier">
              <div className="catalog-form-section-heading">
                <span className="catalog-form-section-icon">
                  <Truck size={22} />
                </span>

                <div>
                  <h3>Información del proveedor</h3>
                  <p>Datos de adquisición del producto.</p>
                </div>
              </div>

              <div className="admin-form-grid">
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
                    disabled={isSubmitting}
                    required
                  />
                </label>
              </div>

              <div className="catalog-form-notice">
                <Info size={21} />

                <div>
                  <strong>Producto empaquetado</strong>

                  <p>
                    Sus cantidades disponibles se consultarán
                    desde el módulo de Existencias.
                  </p>
                </div>
              </div>
            </section>
          )}

          {isPrepared && (
            <>
              <div className="catalog-form-notice">
                <Info size={21} />

                <div>
                  <strong>Producto preparado</strong>

                  <p>
                    Seleccioná los insumos y las cantidades
                    necesarias para elaborar este producto.
                  </p>
                </div>
              </div>

              <RecipeIngredientEditor
                ingredients={ingredients}
                supplies={supplies}
                onChange={setIngredients}
                disabled={isSubmitting}
              />
            </>
          )}

          {isPrepared && suppliesError && (
            <p className="admin-form-error" role="alert">
              {suppliesError}
            </p>
          )}

          {isPrepared &&
            !suppliesError &&
            supplies.length === 0 && (
              <p className="admin-form-error" role="alert">
                Registrá insumos en el inventario antes
                de crear productos preparados.
              </p>
            )}

          {isPackaged && suppliersError && (
            <p className="admin-form-error" role="alert">
              {suppliersError}
            </p>
          )}

          {isPackaged &&
            !suppliersError &&
            suppliers.length === 0 && (
              <p className="admin-form-error" role="alert">
                Registrá un proveedor antes de crear
                productos empaquetados.
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
              disabled={
                !onSubmit ||
                !isValid ||
                isSubmitting
              }
            >
              <Check size={18} />

              {isSubmitting
                ? 'Guardando...'
                : 'Registrar producto'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default CatalogForm