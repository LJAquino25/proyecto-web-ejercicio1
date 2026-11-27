import { useEffect, useMemo, useState } from 'react'
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

const NEW_PRODUCT = 'NEW_PRODUCT'

function RecipeForm({
  isOpen,
  toggle,
  onSubmit,
  preparedProducts = [],
  supplies = [],
  recipe = null,
  productName = ''
}) {
  const isEditing = Boolean(recipe)

  const [productId, setProductId] = useState('')
  const [newProductName, setNewProductName] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [ingredients, setIngredients] = useState([
    { rowId: 1, supply_id: '', quantity: '' }
  ])

  useEffect(() => {
    if (!isOpen) return

    setError('')
    setNewProductName('')
    setNewProductPrice('')

    if (recipe) {
      setProductId(String(recipe.product_id))

      setIngredients(
        recipe.ingredients?.length
          ? recipe.ingredients.map((ingredient, index) => ({
              rowId: index + 1,
              supply_id: String(ingredient.supply_id),
              quantity: String(ingredient.quantity_used)
            }))
          : [{ rowId: 1, supply_id: '', quantity: '' }]
      )
    } else {
      setProductId('')
      setIngredients([
        { rowId: 1, supply_id: '', quantity: '' }
      ])
    }
  }, [isOpen, recipe])

  const availableSupplies = useMemo(() => {
    const supplyMap = new Map(
      supplies.map(supply => [Number(supply.id), supply])
    )

    if (recipe) {
      for (const ingredient of recipe.ingredients || []) {
        const id = Number(ingredient.supply_id)

        if (!supplyMap.has(id)) {
          supplyMap.set(id, {
            id,
            name: ingredient.name,
            unit: ingredient.unit,
            supplier_id: ingredient.supplier_id
          })
        }
      }
    }

    return Array.from(supplyMap.values())
  }, [supplies, recipe])

  const selectedProduct = preparedProducts.find(
    product => Number(product.id) === Number(productId)
  )

  const isNewProduct =
    !isEditing && productId === NEW_PRODUCT

  const hasValidProduct =
    isEditing ||
    Boolean(selectedProduct) ||
    (
      isNewProduct &&
      Boolean(newProductName.trim()) &&
      Number.isFinite(Number(newProductPrice)) &&
      Number(newProductPrice) > 0
    )

  const hasValidIngredients =
    ingredients.length > 0 &&
    ingredients.every(ingredient => {
      const supply = availableSupplies.find(
        item => Number(item.id) === Number(ingredient.supply_id)
      )

      const quantity = Number(ingredient.quantity)

      return (
        Boolean(supply) &&
        Number.isFinite(quantity) &&
        quantity > 0 &&
        Number(quantity.toFixed(3)) === quantity &&
        (
          supply.unit !== 'UNIT' ||
          Number.isInteger(quantity)
        )
      )
    }) &&
    new Set(
      ingredients.map(ingredient => Number(ingredient.supply_id))
    ).size === ingredients.length

  const isValid =
    hasValidProduct &&
    availableSupplies.length > 0 &&
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
      const recipeIngredients = ingredients.map(
        ({ supply_id, quantity }) => ({
          id: Number(supply_id),
          quantity: Number(quantity)
        })
      )

      if (isEditing) {
        await onSubmit({
          recipeId: Number(recipe.id),
          ingredients: recipeIngredients
        })
      } else if (isNewProduct) {
        await onSubmit({
          newProductName: newProductName.trim(),
          price: Number(newProductPrice),
          ingredients: recipeIngredients
        })
      } else {
        await onSubmit({
          product_id: Number(productId),
          name: selectedProduct.name,
          ingredients: recipeIngredients
        })
      }
    } catch (submitError) {
      setError(
        submitError.message ||
        (
          isEditing
            ? 'No se pudo actualizar la receta.'
            : 'No se pudo registrar la receta.'
        )
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
      backdrop={isSubmitting ? 'static' : true}
      keyboard={!isSubmitting}
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

            <h2>
              {isEditing ? 'Editar receta' : 'Nueva receta'}
            </h2>
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
          {isEditing
            ? 'Modificá los ingredientes y cantidades de esta preparación.'
            : 'Definí los ingredientes y cantidades necesarios para elaborar un producto.'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {isEditing ? (
              <>
                <label className="admin-form-field wide">
                  <span>Producto preparado</span>
                  <input
                    value={productName || recipe.name}
                    readOnly
                  />
                </label>

                <label className="admin-form-field wide">
                  <span>Nombre de la receta</span>
                  <input
                    value={recipe.name}
                    readOnly
                  />
                </label>
              </>
            ) : (
              <>
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

                    <option value={NEW_PRODUCT}>
                      Crear producto preparado nuevo
                    </option>
                  </select>

                  {preparedProducts.length === 0 && (
                    <small>
                      No hay productos sin receta. Podés crear un producto preparado nuevo.
                    </small>
                  )}
                </label>

                {isNewProduct ? (
                  <>
                    <label className="admin-form-field">
                      <span>Nombre del producto preparado</span>
                      <input
                        value={newProductName}
                        onChange={event =>
                          setNewProductName(event.target.value)
                        }
                        maxLength={100}
                        required
                        disabled={isSubmitting}
                      />
                    </label>

                    <label className="admin-form-field">
                      <span>Precio de venta ($)</span>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={newProductPrice}
                        onChange={event =>
                          setNewProductPrice(event.target.value)
                        }
                        required
                        disabled={isSubmitting}
                      />
                    </label>
                  </>
                ) : (
                  <label className="admin-form-field wide">
                    <span>Nombre de la receta</span>
                    <input
                      value={selectedProduct?.name || ''}
                      placeholder="Se asignará automáticamente"
                      readOnly
                    />
                  </label>
                )}
              </>
            )}
          </div>

          <RecipeIngredientEditor
            ingredients={ingredients}
            supplies={availableSupplies}
            onChange={setIngredients}
            disabled={isSubmitting}
          />

          <div className="recipe-form-notice">
            <Info size={21} />

            <div>
              <strong>
                {isEditing
                  ? 'Actualización de receta'
                  : 'Unidad de medida automática'}
              </strong>

              <p>
                {isEditing
                  ? 'Los cambios se aplicarán a las próximas preparaciones. No se modificarán las existencias actuales.'
                  : 'Cada ingrediente utiliza la unidad de medida registrada en el inventario. Las cantidades corresponden a una preparación del producto.'}
              </p>
            </div>
          </div>

          {availableSupplies.length === 0 && (
            <p className="admin-form-error" role="alert">
              No hay insumos disponibles para esta receta.
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
                : isEditing
                  ? 'Guardar cambios'
                  : 'Registrar receta'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default RecipeForm