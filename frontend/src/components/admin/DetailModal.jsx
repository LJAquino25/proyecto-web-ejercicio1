import { Modal, ModalBody } from 'reactstrap'
import { Eye, X, Check } from 'lucide-react'

import '../../styles/AdminForm.css'
import '../../styles/DetailModal.css'

function DetailModal({
  isOpen,
  toggle,
  eyebrow = 'INFORMACIÓN',
  title = 'Detalle',
  description,
  icon: Icon = Eye,
  color = 'blue',
  summary,
  sections = [],
  children
}) {
  return (
    <Modal
  isOpen={isOpen}
  toggle={toggle}
  centered
  scrollable
  size="lg"
  className="admin-form-modal detail-modal"
  modalClassName="detail-modal-overlay"
  backdrop={true}
  fade={false}
  zIndex={2000}
>
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className={`admin-form-icon ${color}`}>
            <Icon size={28} />
          </span>

          <div>
            <span className="admin-eyebrow">
              {eyebrow}
            </span>

            <h2>{title}</h2>
          </div>

          <button
            type="button"
            className="admin-form-close"
            onClick={toggle}
            aria-label="Cerrar detalle"
          >
            <X size={24} />
          </button>
        </div>

        {description && (
          <p className="admin-form-description">
            {description}
          </p>
        )}

        {summary && (
          <div className="detail-summary">
            <div>
              <span className="detail-summary-label">
                {summary.label}
              </span>

              <h3>{summary.value}</h3>

              {summary.subtitle && (
                <p>{summary.subtitle}</p>
              )}
            </div>

            {summary.status && (
              <span
                className={`detail-status ${
                  summary.statusColor || 'neutral'
                }`}
              >
                {summary.status}
              </span>
            )}
          </div>
        )}

        {sections.map((section, index) => (
          <section
            className="detail-section"
            key={index}
          >
            <h3>{section.title}</h3>

            <div className="detail-grid">
              {section.fields.map((field, fieldIndex) => (
                <div
                  key={fieldIndex}
                  className={`detail-field ${
                    field.wide ? 'wide' : ''
                  }`}
                >
                  <span className="detail-field-label">
                    {field.label}
                  </span>

                  <div className="detail-field-value">
                    {field.value === null ||
                    field.value === undefined ||
                    field.value === ''
                      ? 'No registrado'
                      : field.value}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {children}

        <div className="admin-form-footer">
          <button
            type="button"
            className="admin-form-submit"
            onClick={toggle}
          >
            <Check size={18} />
            Cerrar detalle
          </button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default DetailModal