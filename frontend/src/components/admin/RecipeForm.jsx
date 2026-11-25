import { useState, useRef } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { BookOpen, X, Check, Plus, Trash2 } from 'lucide-react'
import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'

const PREPARED_PRODUCTS = [
  { id: 1, name: 'Pupusa revuelta' },
  { id: 2, name: 'Café de olla' },
  { id: 3, name: 'Quesadilla' },
  { id: 4, name: 'Tamales de pollo' }
]

const INGREDIENTS = [
  { id: 1, name: 'Harina de maíz' },
  { id: 2, name: 'Queso' },
  { id: 3, name: 'Frijoles' },
  { id: 4, name: 'Chicharrón' },
  { id: 5, name: 'Café molido' },
  { id: 6, name: 'Azúcar' },
  { id: 7, name: 'Agua' },
  { id: 8, name: 'Harina de arroz' }
]

function RecipeForm({ isOpen, toggle, onSubmit }) {
  const [productId, setProductId] = useState('')
  const nextId = useRef(2)

  const [ingredients, setIngredients] = useState([
    {
      id: 1,
      ingredient_id: '',
      quantity: '',
      unit: ''
    }
  ])

  const addIngredient = () => {
    const id = nextId.current++

    setIngredients(previous => [
      ...previous,
      {
        id,
        ingredient_id: '',
        quantity: '',
        unit: ''
      }
    ])
  }

  const removeIngredient = id => {
    setIngredients(previous =>
      previous.length > 1
        ? previous.filter(ingredient => ingredient.id !== id)
        : previous
    )
  }

  const updateIngredient = (id, name, value) => {
    setIngredients(previous =>
      previous.map(ingredient =>
        ingredient.id === id
          ? { ...ingredient, [name]: value }
          : ingredient
      )
    )
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (onSubmit) {
      onSubmit({
        product_id: Number(productId),
        ingredients: ingredients.map(ingredient => ({
          ingredient_id: Number(ingredient.ingredient_id),
          quantity: Number(ingredient.quantity),
          unit: ingredient.unit
        }))
      })
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
          Definí los ingredientes y cantidades necesarios
          para cada preparación.
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

              {PREPARED_PRODUCTS.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </label>

          <div className="recipe-form-section-heading">
            <h3>Ingredientes</h3>
            <span>{ingredients.length} ingredientes</span>
          </div>

          <div className="recipe-form-ingredients">
            {ingredients.map((ingredient, index) => (
              <div
                className="recipe-form-ingredient"
                key={ingredient.id}
              >
                <div className="recipe-form-ingredient-heading">
                  <span>INGREDIENTE {index + 1}</span>

                  <button
                    type="button"
                    className="recipe-form-remove"
                    onClick={() => removeIngredient(ingredient.id)}
                    disabled={ingredients.length === 1}
                    title="Eliminar ingrediente"
                    aria-label="Eliminar ingrediente"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="recipe-form-ingredient-grid">
                  <label className="admin-form-field">
                    <span>Insumo</span>

                    <select
                      value={ingredient.ingredient_id}
                      onChange={event =>
                        updateIngredient(
                          ingredient.id,
                          'ingredient_id',
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">Seleccionar insumo</option>

                      {INGREDIENTS.map(item => (
                        <option
                          key={item.id}
                          value={item.id}
                          disabled={ingredients.some(
                            other =>
                              other.id !== ingredient.id &&
                              Number(other.ingredient_id) === item.id
                          )}
                        >
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="admin-form-field">
                    <span>Cantidad</span>

                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={event =>
                        updateIngredient(
                          ingredient.id,
                          'quantity',
                          event.target.value
                        )
                      }
                      min="0.001"
                      step="0.001"
                      placeholder="0.00"
                      required
                    />
                  </label>

                  <label className="admin-form-field">
                    <span>Unidad</span>

                    <select
                      value={ingredient.unit}
                      onChange={event =>
                        updateIngredient(
                          ingredient.id,
                          'unit',
                          event.target.value
                        )
                      }
                      required
                    >
                      <option value="">Seleccionar</option>
                      <option value="g">Gramos</option>
                      <option value="kg">Kilogramos</option>
                      <option value="ml">Mililitros</option>
                      <option value="L">Litros</option>
                      <option value="unit">Unidades</option>
                    </select>
                  </label>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            className="recipe-form-add"
            onClick={addIngredient}
          >
            <Plus size={20} />
            Agregar ingrediente
          </button>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={toggle}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="admin-form-submit"
              disabled={!onSubmit}
              title={!onSubmit ? 'Pendiente de conexión' : undefined}
            >
              <Check size={18} />
              Registrar receta
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default RecipeForm