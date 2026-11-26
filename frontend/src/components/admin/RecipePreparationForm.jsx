import { useEffect, useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { CookingPot, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'

function RecipePreparationForm({
  isOpen,
  toggle,
  onSubmit,
  recipe,
  branches,
  initialBranchId,
}) {
  const [branchId, setBranchId] = useState('')
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setBranchId(initialBranchId || (branches[0] ? String(branches[0].id) : ''))
      setQuantity('1')
      setError('')
      setResult(null)
    }
  }, [isOpen, initialBranchId, branches])

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
                disabled={isSubmitting || !branches.length}
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
