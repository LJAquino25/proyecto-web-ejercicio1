import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { PackagePlus, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  unit: '',
  branch_id: '',
  quantity: '',
  min_stock: '',
  unit_cost: '',
  supplier_id: ''
}

function ProductForm({ isOpen, toggle, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (onSubmit) {
      onSubmit(form)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size="lg"
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon">
            <PackagePlus size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">INVENTARIO</span>
            <h2>Nuevo insumo</h2>
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
          Completá la información para registrar un nuevo insumo.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del insumo</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Ej. Harina de maíz"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Unidad de medida</span>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar unidad</option>
                <option value="kg">Kilogramos</option>
                <option value="g">Gramos</option>
                <option value="L">Litros</option>
                <option value="ml">Mililitros</option>
                <option value="unit">Unidades</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Sucursal</span>
              <select
                name="branch_id"
                value={form.branch_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar sucursal</option>
                <option value="1">Centro Histórico</option>
              </select>
            </label>

            <label className="admin-form-field">
              <span>Cantidad inicial</span>
              <input
                type="number"
                name="quantity"
                value={form.quantity}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Stock mínimo</span>
              <input
                type="number"
                name="min_stock"
                value={form.min_stock}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Costo unitario ($)</span>
              <input
                type="number"
                name="unit_cost"
                value={form.unit_cost}
                onChange={handleChange}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </label>

            <label className="admin-form-field">
              <span>Proveedor</span>
              <select
                name="supplier_id"
                value={form.supplier_id}
                onChange={handleChange}
                required
              >
                <option value="">Seleccionar proveedor</option>
                <option value="1">Proveedor de ejemplo</option>
              </select>
            </label>
          </div>

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
              Registrar insumo
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default ProductForm