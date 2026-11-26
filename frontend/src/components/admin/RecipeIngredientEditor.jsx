import { useEffect, useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import '../../styles/RecipeForm.css'

function RecipeIngredientEditor({
  ingredients,
  supplies,
  onChange,
  disabled = false,
}) {
  const nextId = useRef(2)

  useEffect(() => {
    const largestId = ingredients.reduce(
      (largest, ingredient) => Math.max(largest, ingredient.rowId || 0),
      0
    )
    nextId.current = Math.max(nextId.current, largestId + 1)
  }, [ingredients])

  const updateIngredient = (rowId, field, value) => {
    onChange(
      ingredients.map(ingredient =>
        ingredient.rowId === rowId
          ? { ...ingredient, [field]: value }
          : ingredient
      )
    )
  }

  const addIngredient = () => {
    onChange([
      ...ingredients,
      { rowId: nextId.current++, supply_id: '', quantity: '' },
    ])
  }

  const removeIngredient = rowId => {
    if (ingredients.length > 1) {
      onChange(ingredients.filter(ingredient => ingredient.rowId !== rowId))
    }
  }

  return (
    <>
      <div className="recipe-form-section-heading">
        <h3>Ingredientes por preparación</h3>
        <span>{ingredients.length} ingredientes</span>
      </div>

      <div className="recipe-form-ingredients">
        {ingredients.map((ingredient, index) => {
          const selectedSupply = supplies.find(
            supply => Number(supply.id) === Number(ingredient.supply_id)
          )

          return (
            <div className="recipe-form-ingredient" key={ingredient.rowId}>
              <div className="recipe-form-ingredient-heading">
                <span>INGREDIENTE {index + 1}</span>
                <button
                  type="button"
                  className="recipe-form-remove"
                  onClick={() => removeIngredient(ingredient.rowId)}
                  disabled={disabled || ingredients.length === 1}
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
                    value={ingredient.supply_id}
                    onChange={event =>
                      updateIngredient(
                        ingredient.rowId,
                        'supply_id',
                        event.target.value
                      )
                    }
                    required
                    disabled={disabled}
                  >
                    <option value="">Seleccionar insumo</option>
                    {supplies.map(supply => (
                      <option
                        key={supply.id}
                        value={supply.id}
                        disabled={ingredients.some(
                          other =>
                            other.rowId !== ingredient.rowId &&
                            Number(other.supply_id) === Number(supply.id)
                        )}
                      >
                        {supply.name}
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
                        ingredient.rowId,
                        'quantity',
                        event.target.value
                      )
                    }
                    min="0.001"
                    step="0.001"
                    placeholder="0.000"
                    required
                    disabled={disabled}
                  />
                  {selectedSupply && (
                    <small className="recipe-unit-note">
                      Unidad: {selectedSupply.unit}
                    </small>
                  )}
                </label>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        className="recipe-form-add"
        onClick={addIngredient}
        disabled={disabled || supplies.length === 0}
      >
        <Plus size={20} />
        Agregar ingrediente
      </button>
    </>
  )
}

export default RecipeIngredientEditor
