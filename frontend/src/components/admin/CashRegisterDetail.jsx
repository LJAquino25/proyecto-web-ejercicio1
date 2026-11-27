import { Wallet } from 'lucide-react'
import DetailModal from './DetailModal'

import '../../styles/CashRegisterDetail.css'

const formatMoney = value =>
  value == null ? '—' : `$${Number(value).toFixed(2)}`

const formatDate = value => {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date)
}

function CashRegisterDetail({
  register,
  branchName,
  onClose
}) {
  if (!register) return null

  const isOpen = register.status === 'OPEN'

  const difference =
    register.difference == null
      ? null
      : Number(register.difference)

  const differenceStatus =
    difference === 0
      ? 'balanced'
      : difference < 0
        ? 'shortage'
        : 'surplus'

  const sections = [
    {
      title: 'Información del turno',
      fields: [
        {
          label: 'Responsable',
          value: register.cashier
        },
        {
          label: 'Sucursal',
          value: branchName
        },
        {
          label: 'Fecha de apertura',
          value: formatDate(register.openedAt)
        },
        {
          label: 'Monto de apertura',
          value: formatMoney(register.openingAmount)
        }
      ]
    },
    {
      title: 'Ingresos por método de pago',
      fields: [
        {
          label: 'Efectivo',
          value: formatMoney(register.salesByMethod?.cash)
        },
        {
          label: 'Tarjeta',
          value: formatMoney(register.salesByMethod?.card)
        },
        {
          label: 'Pagos digitales / transferencia',
          value: formatMoney(
            register.salesByMethod?.bitcoinChivo
          ),
          wide: true
        }
      ]
    },
    {
      title: 'Cuadre de efectivo',
      fields: [
        {
          label: 'Efectivo esperado',
          value: formatMoney(register.expectedCash)
        },
        {
          label: 'Efectivo contado',
          value: formatMoney(register.countedCash)
        }
      ]
    }
  ]

  return (
    <DetailModal
      isOpen={Boolean(register)}
      toggle={onClose}
      eyebrow="CONTROL DE CAJA"
      title="Detalle del turno"
      description="Consultá los ingresos y el cuadre del turno seleccionado."
      icon={Wallet}
      color="blue"
      summary={{
        label: 'Turno de caja',
        value: `#${String(register.id).padStart(3, '0')}`,
        subtitle: branchName,
        status: isOpen ? 'Abierta' : 'Cerrada',
        statusColor: isOpen ? 'success' : 'neutral'
      }}
      sections={sections}
    >
      {!isOpen && difference !== null && (
        <div
          className={`cash-detail-difference ${differenceStatus}`}
        >
          <div className="cash-detail-difference-heading">
            <span>Diferencia de caja</span>

            <strong>
              {difference > 0 ? '+' : difference < 0 ? '-' : ''}
              ${Math.abs(difference).toFixed(2)}
            </strong>
          </div>

          <p>
            {difference === 0
              ? 'La caja está cuadrada.'
              : difference < 0
                ? 'Existe un faltante de efectivo.'
                : 'Existe un sobrante de efectivo.'}
          </p>
        </div>
      )}

      <section className="detail-section">
        <h3>Observaciones</h3>

        <div className="detail-field">
          <div className="detail-field-value">
            {register.notes || 'Sin observaciones.'}
          </div>
        </div>
      </section>
    </DetailModal>
  )
}

export default CashRegisterDetail