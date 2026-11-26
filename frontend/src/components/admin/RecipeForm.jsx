import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import {
  BookOpen,
  Info,
  X,
  Check
} from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'

import RecipeIngredientEditor from './RecipeIngredientEditor'

function RecipeForm({
  isOpen,
  toggle,
  onSubmit,
  preparedProducts = [],
  supplies = []
}) {
  const [productId, setProductId] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [ingredients, setIngredients] = useState([
    { rowId: 1, supply_id: '', quantity: '' }
  ])

  useEffect(() => {
    if (isOpen) {
      setProductId('')
      setIngredients([
        { rowId: 1, supply_id: '', quantity: '' }
      ])
      setError('')
    }
  }, [isOpen])

  const selectedProduct = preparedProducts.find(
    product => Number(product.id) === Number(productId)
  )

  const hasValidIngredients =
    ingredients.length > 0 &&
    ingredients.every(ingredient =>
      supplies.some(
        supply =>
          Number(supply.id) === Number(ingredient.supply_id)
      ) &&
      Number.isFinite(Number(ingredient.quantity)) &&
      Number(ingredient.quantity) > 0
    ) &&
    new Set(
      ingredients.map(ingredient => Number(ingredient.supply_id))
    ).size === ingredients.length

  const isValid =
    Boolean(selectedProduct) &&
    supplies.length > 0 &&
    hasValidIngredients

  const handleClose = () => {
    if (!isSubmitting) {
      toggle()
    }
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || !isValid || isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      await onSubmit({
        product_id: Number(productId),
        name: selectedProduct.name,
        ingredients: ingredients.map(({ supply_id, quantity }) => ({
          id: Number(supply_id),
          quantity: Number(quantity)
        }))
      })
    } catch (submitError) {
      setError(
        submitError.message ||
        'No se pudo registrar la receta.'
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
          <span className="admin-form-icon blue">
            <BookOpen size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              RECETAS
            </span>

            <h2>Nueva receta</h2>
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
          Definí los ingredientes y cantidades necesarios
          para elaborar un producto.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Producto preparado</span>

              <select
                value={productId}
                onChange={event =>
                  setProductId(event.target.value)
                }
                disabled={isSubmitting}
                required
              >
                <option value="">
                  Seleccionar producto
                </option>

                {preparedProducts.map(product => (
                  <option
                    key={product.id}
                    value={product.id}
                  >
                    {product.name}
                  </option>
                ))}
              </select>

              {preparedProducts.length === 0 && (
                <small>
                  No hay productos preparados sin receta registrada.
                </small>
              )}
            </label>

            <label className="admin-form-field wide">
              <span>Nombre de la receta</span>

              <input
                value={selectedProduct?.name || ''}
                placeholder="Se asignará automáticamente"
                readOnly
              />
            </label>
          </div>

          <RecipeIngredientEditor
            ingredients={ingredients}
            supplies={supplies}
            onChange={setIngredients}
            disabled={isSubmitting}
          />

          <div className="recipe-form-notice">
            <Info size={21} />

            <div>
              <strong>Unidad de medida automática</strong>

              <p>
                Cada ingrediente utiliza la unidad de medida
                registrada en el inventario. Las cantidades
                corresponden a una preparación del producto.
              </p>
            </div>
          </div>

          {supplies.length === 0 && (
            <p className="admin-form-error" role="alert">
              Registrá insumos en el inventario antes
              de crear recetas.
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
                : 'Registrar receta'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default RecipeForm