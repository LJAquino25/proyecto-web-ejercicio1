import { useState } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Truck, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  phone: ''
}

function SupplierForm({ isOpen, toggle, onSubmit }) {
  const [form, setForm] = useState(INITIAL_FORM)

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))
  }

  const handleClose = () => {
    setForm({ ...INITIAL_FORM })
    toggle()
  }

  const handleSubmit = event => {
    event.preventDefault()

    if (!onSubmit || !form.name.trim()) return

    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim() || null
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      toggle={handleClose}
      centered
      scrollable
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            <Truck size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              PROVEEDORES
            </span>

            <h2>Nuevo proveedor</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <p className="admin-form-description">
          Registrá un nuevo proveedor para el abastecimiento
          del restaurante.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            <label className="admin-form-field wide">
              <span>Nombre del proveedor</span>

              <input
                type="text"
                name="name"
                placeholder="Nombre de la empresa o proveedor"
                value={form.name}
                onChange={handleChange}
                maxLength={100}
                required
              />
            </label>

            <label className="admin-form-field wide">
              <span>Teléfono (opcional)</span>

              <input
                type="tel"
                name="phone"
                placeholder="0000-0000"
                value={form.phone}
                onChange={handleChange}
                maxLength={20}
              />
            </label>
          </div>

          <div className="admin-form-footer">
            <button
              type="button"
              className="admin-form-cancel"
              onClick={handleClose}
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
              Guardar proveedor
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default SupplierForm