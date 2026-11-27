import { CookingPot, Package } from 'lucide-react'
import DetailModal from './DetailModal'

const formatMoney = value =>
  value == null ? '—' : `$${Number(value).toFixed(2)}`

function CatalogDetail({ product, onClose }) {
  if (!product) return null

  const isPackaged = product.product_type === 'PACKAGED'

  const sections = [
    {
      title: 'Información del producto',
      fields: [
        {
          label: 'Nombre',
          value: product.name,
          wide: true
        },
        {
          label: 'Tipo de producto',
          value: isPackaged ? 'Empaquetado' : 'Preparado'
        },
        {
          label: 'Precio de venta',
          value: formatMoney(product.price)
        }
      ]
    }
  ]

  if (isPackaged) {
    sections.push({
      title: 'Información de adquisición',
      fields: [
        {
          label: 'Proveedor',
          value: product.supplier_name,
          wide: true
        },
        {
          label: 'Costo unitario',
          value: formatMoney(product.unit_cost)
        },
        {
          label: 'Margen bruto unitario',
          value:
            product.unit_cost == null
              ? '—'
              : formatMoney(
                  Number(product.price) -
                  Number(product.unit_cost)
                )
        }
      ]
    })
  }

  return (
    <DetailModal
      isOpen={Boolean(product)}
      toggle={onClose}
      eyebrow="CATÁLOGO"
      title="Detalle del producto"
      description="Consultá la información comercial del producto."
      icon={isPackaged ? Package : CookingPot}
      color={isPackaged ? 'blue' : 'pink'}
      summary={{
        label: 'Producto',
        value: product.name,
        subtitle: `Precio de venta: ${formatMoney(product.price)}`,
        status: isPackaged ? 'Empaquetado' : 'Preparado',
        statusColor: isPackaged ? 'info' : 'warning'
      }}
      sections={sections}
    />
  )
}

export default CatalogDetail