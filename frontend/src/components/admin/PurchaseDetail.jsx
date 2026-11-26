import {
  Truck,
  ShoppingCart,
  Wallet
} from 'lucide-react'

import DetailModal from './DetailModal'
import '../../styles/PurchasesPage.css'

const STATUS_LABELS = {
  RECORDED: 'Registrada',
  VOID: 'Anulada',
  PENDING: 'Pendiente',
  PARTIAL: 'Pago parcial',
  PAID: 'Pagada'
}

const STATUS_COLORS = {
  RECORDED: 'success',
  VOID: 'pending',
  PENDING: 'pending',
  PARTIAL: 'warning',
  PAID: 'success'
}

const PAYMENT_TERMS = {
  CASH: 'Al contado',
  CREDIT: 'Al crédito'
}

const PAYMENT_METHODS = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta'
}

const UNIT_LABELS = {
  G: 'g',
  KG: 'kg',
  ML: 'ml',
  L: 'L',
  UNIT: 'unidades'
}

const formatMoney = value =>
  value == null
    ? 'No registrado'
    : `$${Number(value).toFixed(2)}`

const formatUnitCost = value =>
  value == null
    ? 'No registrado'
    : `$${Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 6
      })}`

const formatDate = value => {
  if (!value) return 'No registrado'

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-')
    return `${day}/${month}/${year}`
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('es-SV', {
    timeZone: 'America/El_Salvador'
  })
}

function PurchaseDetail({ selection, onClose }) {
  if (!selection) return null

  const { type, record } = selection

  const status = {
    status:
      STATUS_LABELS[record.status] || record.status,
    statusColor:
      STATUS_COLORS[record.status] || 'neutral'
  }

  const totalAmount = Number(record.total_amount || 0)

  const pendingBalance = Number(
    record.pending_balance || 0
  )

  const paidAmount = totalAmount - pendingBalance

  const paymentProgress =
    totalAmount > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (paidAmount / totalAmount) * 100
          )
        )
      : record.status === 'PAID'
        ? 100
        : 0

  const configurations = {
    suppliers: {
      title: 'Detalle del proveedor',
      description:
        'Consultá la información del proveedor seleccionado.',
      icon: Truck,
      color: 'blue',
      summary: {
        label: 'Proveedor',
        value: record.name,
        subtitle: `Proveedor #${record.id}`
      },
      sections: [
        {
          title: 'Información del proveedor',
          fields: [
            {
              label: 'Nombre',
              value: record.name
            },
            {
              label: 'Teléfono',
              value: record.phone
            }
          ]
        }
      ]
    },

    purchases: {
      title: 'Detalle de la compra',
      description:
        'Consultá los artículos adquiridos y las condiciones de pago.',
      icon: ShoppingCart,
      color: 'yellow',
      summary: {
        label: 'Documento de compra',
        value:
          record.document_num ||
          `Compra #${record.id}`,
        subtitle: record.supplier,
        ...status
      },
      sections: [
        {
          title: 'Información de la compra',
          fields: [
            {
              label: 'Proveedor',
              value: record.supplier
            },
            {
              label: 'Sucursal',
              value: record.branch
            },
            {
              label: 'Fecha de emisión',
              value: formatDate(record.issue_date)
            },
            {
              label: 'Condición de pago',
              value:
                PAYMENT_TERMS[record.payment_terms] ||
                record.payment_terms
            },
            {
              label: 'Estado',
              value: STATUS_LABELS[record.status]
            },
            ...(record.payment_terms === 'CREDIT'
              ? [
                  {
                    label: 'Fecha límite de pago',
                    value: formatDate(record.due_date)
                  }
                ]
              : [])
          ]
        }
      ]
    },

    payables: {
      title: 'Detalle de la cuenta por pagar',
      description:
        'Consultá el estado de la deuda con el proveedor.',
      icon: Wallet,
      color: 'blue',
      summary: {
        label: 'Saldo pendiente',
        value: formatMoney(pendingBalance),
        subtitle: record.supplier,
        ...status
      },
      sections: [
        {
          title: 'Información de la cuenta',
          fields: [
            {
              label: 'Documento de compra',
              value: record.document_num
            },
            {
              label: 'Proveedor',
              value: record.supplier
            },
            {
              label: 'Fecha de vencimiento',
              value: formatDate(record.due_date)
            },
            {
              label: 'Estado',
              value: STATUS_LABELS[record.status]
            }
          ]
        },
        {
          title: 'Resumen de pagos',
          fields: [
            {
              label: 'Monto original',
              value: formatMoney(totalAmount)
            },
            {
              label: 'Monto pagado',
              value: formatMoney(paidAmount)
            }
          ]
        }
      ]
    }
  }

  const configuration = configurations[type]

  if (!configuration) return null

  return (
    <DetailModal
      isOpen={Boolean(selection)}
      toggle={onClose}
      eyebrow="COMPRAS Y PROVEEDORES"
      {...configuration}
    >
      {type === 'purchases' && (
        <>
          <section className="detail-section">
            <h3>Artículos adquiridos</h3>

            {record.items?.length > 0 ? (
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Artículo</th>
                      <th>Tipo</th>
                      <th>Cantidad</th>
                      <th>Costo unitario</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {record.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>
                          {item.name || 'No registrado'}
                        </td>

                        <td>
                          {item.supply_id != null
                            ? 'Insumo'
                            : item.packaged_product_id != null
                              ? 'Empaquetado'
                              : 'No registrado'}
                        </td>

                        <td>
                          {item.quantity}{' '}
                          {UNIT_LABELS[item.unit] ||
                            item.unit ||
                            ''}
                        </td>

                        <td>
                          {formatUnitCost(item.unit_cost)}
                        </td>

                        <td>
                          {formatMoney(
                            item.line_subtotal ??
                              item.quantity * item.unit_cost
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="purchase-detail-empty">
                No hay información disponible sobre
                los artículos de esta compra.
              </div>
            )}
          </section>

          <div className="order-summary">
            <div className="order-summary-row">
              <span>Subtotal</span>

              <strong>
                {formatMoney(record.subtotal)}
              </strong>
            </div>

            <div className="order-summary-row">
              <span>IVA</span>

              <strong>
                {formatMoney(record.tax)}
              </strong>
            </div>

            <div className="order-summary-total">
              <span>Total de la compra</span>

              <strong>
                {formatMoney(record.total)}
              </strong>
            </div>
          </div>
        </>
      )}

      {type === 'payables' && (
        <>
          <div className="purchase-payment-progress">
            <div className="purchase-progress-heading">
              <span>Progreso del pago</span>

              <strong>
                {paymentProgress.toFixed(1)}%
              </strong>
            </div>

            <div
              className="purchase-progress-track"
              role="progressbar"
              aria-label="Progreso del pago"
              aria-valuenow={paymentProgress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="purchase-progress-fill"
                style={{
                  width: `${paymentProgress}%`
                }}
              />
            </div>
          </div>

          <div className="detail-total">
            <span>Saldo pendiente</span>

            <strong>
              {formatMoney(pendingBalance)}
            </strong>
          </div>

          <section className="detail-section">
            <h3>Historial de pagos</h3>

            {record.payments?.length > 0 ? (
              <div className="detail-table-wrapper">
                <table className="detail-table">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Método</th>
                      <th>Referencia</th>
                      <th>Monto</th>
                    </tr>
                  </thead>

                  <tbody>
                    {record.payments.map(
                      (payment, index) => (
                        <tr key={payment.id || index}>
                          <td>
                            {formatDate(payment.paid_at)}
                          </td>

                          <td>
                            {PAYMENT_METHODS[payment.method] ||
                              payment.method}
                          </td>

                          <td>
                            {payment.reference ||
                              'Sin referencia'}
                          </td>

                          <td>
                            {formatMoney(payment.amount)}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="purchase-detail-empty">
                No hay un historial de pagos disponible.
              </div>
            )}
          </section>
        </>
      )}
    </DetailModal>
  )
}

export default PurchaseDetail