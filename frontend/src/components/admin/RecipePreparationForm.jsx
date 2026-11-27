import { useEffect, useMemo, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { CookingPot, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'
import '../../styles/RecipeForm.css'
import { getBranchInventory } from '../../services/inventoryService'

function RecipePreparationForm({
  isOpen,
  toggle,
  onSubmit,
  recipe,
  branches,
  initialBranchId,
  allowBranchSelection = false,
}) {
  const [branchId, setBranchId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [branchInventory, setBranchInventory] = useState([])
  const [isLoadingStock, setIsLoadingStock] = useState(false)
  const [stockError, setStockError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setBranchId(initialBranchId || (branches[0] ? String(branches[0].id) : ''))
      setQuantity('1')
      setError('')
      setResult(null)
    }
  }, [isOpen, initialBranchId, branches])

  useEffect(() => {
    if (!isOpen || !branchId) {
      setBranchInventory([])
      setStockError('')
      setIsLoadingStock(false)
      return undefined
    }

    let active = true
    setBranchInventory([])
    setIsLoadingStock(true)
    setStockError('')

    getBranchInventory(branchId)
      .then(inventory => {
        if (active) setBranchInventory(inventory)
      })
      .catch(loadError => {
        if (active) {
          setBranchInventory([])
          setStockError(loadError.message || 'No se pudo consultar el stock de la sucursal.')
        }
      })
      .finally(() => {
        if (active) setIsLoadingStock(false)
      })

    return () => {
      active = false
    }
  }, [isOpen, branchId])

  const ingredientStock = useMemo(() => {
    const stockBySupply = new Map(
      branchInventory.map(item => [Number(item.id), Number(item.quantity)])
    )
    return (recipe?.ingredients || []).map(ingredient => ({
      ...ingredient,
      available: stockBySupply.get(Number(ingredient.supply_id)) || 0,
      required: Number(ingredient.quantity_used) * Number(quantity),
    }))
  }, [branchInventory, quantity, recipe])

  const hasInsufficientStock = ingredientStock.some(
    ingredient => ingredient.available < ingredient.required
  )

  const handleSubmit = async event => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await onSubmit({
        id: Number(recipe.id),
        quantity: Number(quantity),
        branch_id: Number(branchId),
      })
      setResult(response)
    } catch (submitError) {
      setError(submitError.message || 'No se pudo registrar la preparación.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const alerts = Array.isArray(result?.alerts) ? result.alerts : []

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            <CookingPot size={28} />
          </span>
          <div>
            <span className="admin-eyebrow">PRODUCCIÓN</span>
            <h2>Preparar {recipe?.name}</h2>
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
          Se descontarán de la sucursal elegida los insumos de la receta multiplicados por la cantidad a preparar.
        </p>

        {result ? (
          <div>
            <p className="admin-form-success" role="status">
              Preparación registrada. Se descontaron {quantity} unidades de {recipe?.name}.
            </p>
            {alerts.length > 0 ? (
              <div className="admin-form-stock-alerts">
                <strong>Insumos que quedaron en stock mínimo o bajo:</strong>
                <ul>
                  {alerts.map(alert => (
                    <li key={alert.supply_id}>
                      {alert.name}: {alert.quantity} {alert.unit || ''} (mínimo {alert.min_stock})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="admin-form-description">
                Los insumos de esta sucursal permanecen sobre el stock mínimo.
              </p>
            )}
            <div className="admin-form-footer">
              <button
                type="button"
                className="admin-form-submit"
                onClick={toggle}
              >
                Listo
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="admin-form-grid">
              <label className="admin-form-field">
                <span>Sucursal</span>
                <select
                  value={branchId}
                  onChange={event => setBranchId(event.target.value)}
                  disabled={!allowBranchSelection}
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
                <span>Cantidad a preparar</span>
                <input
                  type="number"
                  value={quantity}
                  onChange={event => setQuantity(event.target.value)}
                  min="1"
                  step="1"
                  required
                />
              </label>
            </div>

            <div className="admin-form-stock-alerts" aria-live="polite">
              <strong>Stock de insumos en esta sucursal</strong>
              {isLoadingStock ? (
                <p>Consultando existencias...</p>
              ) : stockError ? (
                <p className="admin-form-error" role="alert">{stockError}</p>
              ) : (
                <ul>
                  {ingredientStock.map(ingredient => (
  <li
    key={ingredient.supply_id}
    className="recipe-stock-item"
  >
    <strong>{ingredient.name}</strong>

    <div>
      Proveedor: {ingredient.supplier_name || 'No identificado'}
    </div>

    <div>
      Disponible: {ingredient.available} {ingredient.unit}
    </div>

    <div>
      Necesario: {ingredient.required} {ingredient.unit}
    </div>

    {ingredient.available < ingredient.required ? (
      <div className="recipe-stock-missing">
        Faltan {Number(
          (ingredient.required - ingredient.available).toFixed(3)
        )} {ingredient.unit}
      </div>
    ) : (
      <div className="recipe-stock-available">
        Stock suficiente
      </div>
    )}
  </li>
))}
                </ul>
              )}
            </div>

            {branches.length === 0 && (
              <p className="admin-form-error" role="alert">
                No hay sucursales disponibles para preparar este producto.
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
                  !branches.length ||
                  isLoadingStock ||
                  Boolean(stockError) ||
                  hasInsufficientStock
                }
              >
                <Check size={18} />
                {isSubmitting ? 'Descontando...' : 'Confirmar preparación'}
              </button>
            </div>
          </form>
        )}
      </ModalBody>
    </Modal>
  )
}

export default RecipePreparationForm
