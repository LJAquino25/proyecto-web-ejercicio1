import { Modal, ModalBody } from 'reactstrap'
import { ClipboardList, X } from 'lucide-react'

import '../../styles/AdminForm.css'

const formatMoney = value =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(Number(value) || 0)

const getPeriodLabel = value => {
  const dateValue = String(value || '').slice(0, 10)
  const date = new Date(`${dateValue}T00:00:00Z`)

  return Number.isNaN(date.getTime())
    ? dateValue || '—'
    : new Intl.DateTimeFormat('es-SV', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC'
      }).format(date)
}

function PayrollDetailModal({ payroll, onClose }) {
  if (!payroll) return null

  return (
    <Modal
      isOpen
      toggle={onClose}
      centered
      scrollable
      className="admin-form-modal"
    >
      <ModalBody className="admin-form-body">
        <div className="admin-form-heading">
          <span className="admin-form-icon blue">
            <ClipboardList size={28} />
          </span>
          <div>
            <span className="admin-eyebrow">PERSONAL Y PLANILLA</span>
            <h2>Detalle de planilla</h2>
          </div>
          <button
            type="button"
            className="admin-form-close"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="team-detail-grid">
          <div><span>Empleado</span><strong>{payroll.employee_name}</strong></div>
          <div><span>Sucursal</span><strong>{payroll.branch_name}</strong></div>
          <div><span>Período</span><strong>{getPeriodLabel(payroll.period)}</strong></div>
          <div>
            <span>Quincena</span>
            <strong>
              {Number(payroll.fortnight) === 1
                ? 'Primera quincena'
                : 'Segunda quincena'}
            </strong>
          </div>
          <div><span>Salario base</span><strong>{formatMoney(payroll.base_salary)}</strong></div>
          <div><span>ISSS</span><strong>{formatMoney(payroll.isss)}</strong></div>
          <div><span>AFP</span><strong>{formatMoney(payroll.afp)}</strong></div>
          <div><span>Renta (ISR)</span><strong>{formatMoney(payroll.isr)}</strong></div>
          <div><span>Total descuentos</span><strong>{formatMoney(payroll.total_deduction)}</strong></div>
          <div><span>Salario neto</span><strong>{formatMoney(payroll.net_salary)}</strong></div>
          <div><span>Registro</span><strong>Generada</strong></div>
        </div>

        <div className="admin-form-footer">
          <button
            type="button"
            className="admin-form-cancel"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </ModalBody>
    </Modal>
  )
}

export default PayrollDetailModal
