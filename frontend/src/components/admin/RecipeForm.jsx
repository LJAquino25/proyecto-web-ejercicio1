import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { BookOpen, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'
import RecipeIngredientEditor from './RecipeIngredientEditor'

function RecipeForm({
  isOpen,
  toggle,
  onSubmit,
  preparedProducts,
  supplies,
}) {
  const [productId, setProductId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ingredients, setIngredients] = useState([
    { rowId: 1, supply_id: '', quantity: '' },
  ])

  useEffect(() => {
    if (isOpen) {
      setProductId('')
      setIngredients([{ rowId: 1, supply_id: '', quantity: '' }])
      setError('')
    }
  }, [isOpen])

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    const product = preparedProducts.find(
      item => Number(item.id) === Number(productId)
    )

    try {
      if (!product) {
        throw new Error('Seleccioná un producto preparado válido.')
      }
      await onSubmit({
        product_id: Number(productId),
        name: product.name,
        ingredients: ingredients.map(({ supply_id, quantity }) => ({
          id: Number(supply_id),
          quantity: Number(quantity),
        })),
      })
    } catch (submitError) {
      setError(submitError.message || 'No se pudo registrar la receta.')
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <span className="admin-form-icon blue">
            <BookOpen size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">RECETAS</span>
            <h2>Nueva receta</h2>
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
          Definí las cantidades de insumos necesarias para cada preparación.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="admin-form-field">
            <span>Producto preparado</span>
            <select
              value={productId}
              onChange={event => setProductId(event.target.value)}
              required
            >
              <option value="">Seleccionar producto</option>
              {preparedProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
            {preparedProducts.length === 0 && (
              <small>No hay productos preparados sin receta registrada.</small>
            )}
          </label>

          <RecipeIngredientEditor
            ingredients={ingredients}
            supplies={supplies}
            onChange={setIngredients}
            disabled={isSubmitting}
          />

          {supplies.length === 0 && (
            <p className="admin-form-error" role="alert">
              Registrá insumos en el inventario antes de crear recetas.
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
                preparedProducts.length === 0 ||
                supplies.length === 0
              }
            >
              <Check size={18} />
              {isSubmitting ? 'Guardando...' : 'Registrar receta'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default RecipeForm
