import { Receipt } from 'lucide-react'

import DetailModal from './DetailModal'

const formatMoney = value =>
  `$${Number(value).toFixed(2)}`

const formatDate = value => {
  if (!value) return 'No registrado'

  const [year, month, day] = value.split('-')

  return `${day}/${month}/${year}`
}

function ExpenseDetail({
  expense,
  branchName,
  categoryName,
  onClose
}) {
  if (!expense) return null

  const sections = [
    {
      title: 'Información del gasto',
      fields: [
        {
          label: 'Concepto',
          value: expense.description,
          wide: true
        },
        {
          label: 'Categoría',
          value: categoryName
        },
        {
          label: 'Sucursal',
          value: branchName
        },
        {
          label: 'Fecha del gasto',
          value: formatDate(expense.date)
        },
        {
          label: 'Monto',
          value: formatMoney(expense.amount)
        }
      ]
    },
    {
      title: 'Información adicional',
      fields: [
        {
          label: 'Observaciones',
          value: expense.notes || 'Sin observaciones',
          wide: true
        }
      ]
    }
  ]

  return (
    <DetailModal
      isOpen={Boolean(expense)}
      toggle={onClose}
      eyebrow="ADMINISTRACIÓN"
      title="Detalle del gasto"
      description="Consultá la información del gasto registrado."
      icon={Receipt}
      color="yellow"
      summary={{
        label: 'Monto del gasto',
        value: formatMoney(expense.amount),
        subtitle: expense.description
      }}
      sections={sections}
    />
  )
}

export default ExpenseDetail