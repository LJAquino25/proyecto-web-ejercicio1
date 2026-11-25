import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Store, X, Check } from 'lucide-react'
import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  type: '',
  price: '',
  description: ''
}

function CatalogForm({ isOpen, toggle, onSubmit }) {
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
          Agregá un nuevo producto al menú de Orígenes SV.
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

            <label className="admin-form-field wide">
              <span>Descripción</span>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Escribí una breve descripción del producto..."
                rows={4}
              />
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
              Registrar producto
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default CatalogForm