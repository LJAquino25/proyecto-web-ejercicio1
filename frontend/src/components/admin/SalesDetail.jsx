import { ShoppingCart, Receipt } from 'lucide-react'
import DetailModal from './DetailModal'

import '../../styles/SalesDetail.css'

const STATUS_LABELS = {
  CART: 'Pendiente',
  PAID: 'Pagado',
  IN_PREPARATION: 'En preparación',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado'
}

const STATUS_COLORS = {
  CART: 'pending',
  PAID: 'info',
  IN_PREPARATION: 'warning',
  DELIVERED: 'success',
  CANCELLED: 'neutral'
}

const INVOICE_LABELS = {
  NORMAL: 'Consumidor final',
  TAX_CREDIT: 'Crédito fiscal'
}

const formatMoney = value =>
  value == null ? '—' : `$${Number(value).toFixed(2)}`

const formatId = id =>
  id == null ? '—' : `#${String(id).padStart(3, '0')}`

const formatCustomer = customerId =>
  customerId ? `Cliente #${customerId}` : 'Consumidor final'

const formatDate = value => {
  if (!value) return '—'

  const date = new Date(value)

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/El_Salvador'
      }).format(date)
}

function SalesDetail({ selection, orders = [], onClose }) {
  if (!selection) return null

  const { type, data } = selection
  const isOrder = type === 'order'

  const associatedOrder = isOrder
    ? data
    : orders.find(
        order => Number(order.id) === Number(data.orderId)
      )

  const items = associatedOrder?.items || []
  const fiscalData = data.taxCreditData

  const sections = [
    {
      title: isOrder
        ? 'Información del pedido'
        : 'Información del comprobante',
      fields: [
        {
          label: 'Cliente',
          value: formatCustomer(data.customerId)
        },
        {
          label: isOrder ? 'Fecha del pedido' : 'Fecha de emisión',
          value: formatDate(
            isOrder ? data.createdAt : data.issuedAt
          )
        },
        {
          label: isOrder ? 'Estado' : 'Tipo de comprobante',
          value: isOrder
            ? STATUS_LABELS[data.status] || data.status
            : INVOICE_LABELS[data.documentType] || data.documentType
        },
        {
          label: isOrder ? 'Número de pedido' : 'Pedido asociado',
          value: formatId(
            isOrder ? data.id : data.orderId
          )
        }
      ]
    }
  ]

  if (!isOrder && fiscalData) {
    sections.push({
      title: 'Información fiscal',
      fields: [
        {
          label: 'Razón social',
          value: fiscalData.institutionName,
          wide: true
        },
        {
          label: 'NIT',
          value: fiscalData.nit
        },
        {
          label: 'NRC',
          value: fiscalData.nrc
        }
      ]
    })
  }

  return (
    <DetailModal
      isOpen={Boolean(selection)}
      toggle={onClose}
      eyebrow="VENTAS Y FACTURACIÓN"
      title={isOrder ? 'Detalle del pedido' : 'Detalle de la factura'}
      description={
        isOrder
          ? 'Consultá la información y los productos del pedido.'
          : 'Consultá la información del comprobante emitido.'
      }
      icon={isOrder ? ShoppingCart : Receipt}
      color={isOrder ? 'blue' : 'pink'}
      summary={{
        label: isOrder ? 'Número de pedido' : 'Número de factura',
        value: formatId(
          isOrder ? data.id : data.documentNumber
        ),
        subtitle: formatCustomer(data.customerId),
        status: isOrder
          ? STATUS_LABELS[data.status] || data.status
          : INVOICE_LABELS[data.documentType] || data.documentType,
        statusColor: isOrder
          ? STATUS_COLORS[data.status] || 'neutral'
          : 'info'
      }}
      sections={sections}
    >
      <section className="detail-section">
        <h3>Productos</h3>

        {items.length > 0 ? (
          <div className="detail-table-wrapper">
            <table className="detail-table sales-detail-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Precio unitario</th>
                  <th>Importe</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item, index) => (
                  <tr key={`${item.productId}-${index}`}>
                    <td>
                      <strong>{item.productName}</strong>
                    </td>

                    <td>{item.quantity}</td>

                    <td>{formatMoney(item.unitPrice)}</td>

                    <td>
                      <strong>
                        {formatMoney(
                          Number(item.unitPrice) *
                          Number(item.quantity)
                        )}
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="sales-detail-empty">
            No hay información de productos disponible.
          </p>
        )}
      </section>

      <div className="sales-detail-total">
        {data.subtotal != null && (
          <div className="sales-detail-total-row">
            <span>Subtotal</span>
            <strong>{formatMoney(data.subtotal)}</strong>
          </div>
        )}

        {data.tax != null && (
          <div className="sales-detail-total-row">
            <span>IVA</span>
            <strong>{formatMoney(data.tax)}</strong>
          </div>
        )}

        <div className="sales-detail-final-total">
          <span>
            {isOrder ? 'Total del pedido' : 'Total facturado'}
          </span>

          <strong>{formatMoney(data.total)}</strong>
        </div>
      </div>
    </DetailModal>
  )
}

export default SalesDetail