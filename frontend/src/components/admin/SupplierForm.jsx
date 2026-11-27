import { useState, useEffect } from 'react'
import { Modal, ModalBody } from 'reactstrap'
import { Truck, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'

const INITIAL_FORM = {
  name: '',
  phone: ''
}

function SupplierForm({ isOpen, toggle, onSubmit, supplier = null }) {
  const [form, setForm] = useState(INITIAL_FORM)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = Boolean(supplier)

  useEffect(() => {
    if (isOpen) {
      setForm({
        name: supplier?.name || '',
        phone: supplier?.phone || ''
      })
      setError('')
    }
  }, [isOpen, supplier])

  const handleChange = event => {
    const { name, value } = event.target

    setForm(previous => ({
      ...previous,
      [name]: value
    }))

    setError('')
  }

  const handleClose = () => {
    if (isSubmitting) return

    setForm({ ...INITIAL_FORM })
    setError('')
    toggle()
  }

  const handleSubmit = async event => {
    event.preventDefault()

    if (!onSubmit || isSubmitting) return

    if (!form.name.trim()) {
      setError('Ingresá el nombre del proveedor.')
      return
    }

    if (isEditing && supplier.phone && !form.phone.trim()) {
      setError('Por el momento no se puede eliminar un teléfono registrado.')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await onSubmit({
        name: form.name.trim(),
        phone: form.phone.trim() || null
      })

      setForm({ ...INITIAL_FORM })
    } catch (error) {
      setError(
        error.status === 409
          ? 'Ya existe un proveedor con ese nombre.'
          : error.message || 'No se pudo guardar el proveedor.'
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
      className="admin-form-modal"
      backdrop={isSubmitting ? 'static' : true}
      keyboard={!isSubmitting}
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

            <h2>
              {isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
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
            ? 'Actualizá la información del proveedor.'
            : 'Registrá un nuevo proveedor para el abastecimiento del restaurante.'}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
              />

              {isEditing && supplier.phone && (
                <small>
                  Podés modificar el teléfono registrado.
                </small>
              )}
            </label>
          </div>

          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
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
                isSubmitting ||
                !form.name.trim()
              }
            >
              <Check size={18} />

              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Guardar proveedor'}
            </button>
          </div>
        </form>
      </ModalBody>
    </Modal>
  )
}

export default SupplierForm