import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  DollarSign,
  Clock,
  Receipt,
  Search,
  Eye
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'
import OrderForm from '../../components/admin/OrderForm'
import InvoiceForm from '../../components/admin/InvoiceForm'

const ORDERS = [
  {
    id: 1,
    customer: 'Consumidor final',
    date: '2026-11-25',
    total: 12.50,
    status: 'COMPLETED'
  },
  {
    id: 2,
    customer: 'María López',
    date: '2026-11-25',
    total: 8.75,
    status: 'PENDING'
  },
  {
    id: 3,
    customer: 'Carlos Pérez',
    date: '2026-11-25',
    total: 24.00,
    status: 'PREPARING'
  },
  {
    id: 4,
    customer: 'Consumidor final',
    date: '2026-11-25',
    total: 6.50,
    status: 'COMPLETED'
  }
]

const INVOICES = [
  {
    id: 1,
    customer: 'Consumidor final',
    type: 'CF',
    date: '2026-11-25',
    total: 12.50
  },
  {
    id: 2,
    customer: 'Empresa de ejemplo',
    type: 'CCF',
    date: '2026-11-25',
    total: 24.00
  },
  {
    id: 3,
    customer: 'Consumidor final',
    type: 'CF',
    date: '2026-11-25',
    total: 6.50
  }
]

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  PREPARING: 'En preparación',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado'
}

const INVOICE_LABELS = {
  CF: 'Consumidor final',
  CCF: 'Crédito fiscal'
}

function SalesPage() {
  const [activeTab, setActiveTab] = useState('orders')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const totalSales = INVOICES.reduce(
    (total, invoice) => total + invoice.total,
    0
  )

  const pendingOrders = ORDERS.filter(
    order => order.status === 'PENDING'
  ).length


  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false)

const toggleOrderForm = () => {
  setIsOrderFormOpen(previous => !previous)
}

        const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false)

const toggleInvoiceForm = () => {
  setIsInvoiceFormOpen(previous => !previous)
}
  const statistics = [
    {
      label: 'Pedidos registrados',
      value: ORDERS.length,
      icon: ShoppingCart,
      color: 'blue'
    },
    {
      label: 'Total facturado',
      value: `$${totalSales.toFixed(2)}`,
      icon: DollarSign,
      color: 'yellow'
    },
    {
      label: 'Pedidos pendientes',
      value: pendingOrders,
      icon: Clock,
      color: 'pink'
    }
  ]

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStatusFilter('ALL')
    setTypeFilter('ALL')
  }

  const formatId = id => `#${String(id).padStart(3, '0')}`

  const filteredOrders = ORDERS.filter(order => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      order.customer.toLowerCase().includes(search) ||
      formatId(order.id).includes(search)

    const matchesStatus =
      statusFilter === 'ALL' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const filteredInvoices = INVOICES.filter(invoice => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      invoice.customer.toLowerCase().includes(search) ||
      formatId(invoice.id).includes(search)

    const matchesType =
      typeFilter === 'ALL' || invoice.type === typeFilter

    return matchesSearch && matchesType
  })

  return (
    <section className="sales-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">OPERACIONES</span>
          <h1>Ventas y facturación</h1>
          <p>
            Administrá los pedidos y comprobantes del restaurante.
          </p>
        </div>

            <button
  type="button"
  className="inventory-primary-button"
  onClick={
    activeTab === 'orders'
      ? toggleOrderForm
      : toggleInvoiceForm
  }
>
  <Plus size={20} />
  {activeTab === 'orders' ? 'Nuevo pedido' : 'Nueva factura'}
</button>
      </div>

      <div className="inventory-stats">
        {statistics.map(stat => {
          const StatIcon = stat.icon

          return (
            <article
              className="inventory-stat-card"
              key={stat.label}
            >
              <span className={`inventory-stat-icon ${stat.color}`}>
                <StatIcon size={24} />
              </span>

              <div>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="sales-tabs">
        <button
          type="button"
          className={`sales-tab ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => changeTab('orders')}
        >
          <ShoppingCart size={20} />
          Pedidos
        </button>

        <button
          type="button"
          className={`sales-tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => changeTab('invoices')}
        >
          <Receipt size={20} />
          Facturas
        </button>
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>
            {activeTab === 'orders'
              ? 'Registro de pedidos'
              : 'Registro de facturas'}
          </h2>

          <p>
            {activeTab === 'orders'
              ? 'Consultá los pedidos y su estado actual.'
              : 'Consultá los comprobantes emitidos.'}
          </p>
        </div>

        <div className="inventory-filters sales-filters">
          <label className="inventory-field">
            <span>Buscar registro</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar por número o cliente..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          {activeTab === 'orders' ? (
            <label className="inventory-field">
              <span>Estado del pedido</span>

              <select
                value={statusFilter}
                onChange={event => setStatusFilter(event.target.value)}
              >
                <option value="ALL">Todos los estados</option>

                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <label className="inventory-field">
              <span>Tipo de comprobante</span>

              <select
                value={typeFilter}
                onChange={event => setTypeFilter(event.target.value)}
              >
                <option value="ALL">Todos los tipos</option>
                <option value="CF">Consumidor final</option>
                <option value="CCF">Crédito fiscal</option>
              </select>
            </label>
          )}
        </div>

        <div className="inventory-table-wrapper">
          {activeTab === 'orders' ? (
            <table className="inventory-table sales-table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{formatId(order.id)}</strong>
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.date}</td>
                    <td className="sales-total">
                      ${order.total.toFixed(2)}
                    </td>
                    <td>
                      <span className={`sales-status ${order.status.toLowerCase()}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sales-detail-button"
                        title="Ver pedido"
                        aria-label="Ver pedido"
                        disabled
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron pedidos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="inventory-table sales-table">
              <thead>
                <tr>
                  <th>Factura</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id}>
                    <td>
                      <strong>{formatId(invoice.id)}</strong>
                    </td>
                    <td>{invoice.customer}</td>
                    <td>
                      <span className={`sales-invoice-type ${invoice.type.toLowerCase()}`}>
                        {INVOICE_LABELS[invoice.type]}
                      </span>
                    </td>
                    <td>{invoice.date}</td>
                    <td className="sales-total">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="sales-detail-button"
                        title="Ver factura"
                        aria-label="Ver factura"
                        disabled
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="inventory-empty">
                      No se encontraron facturas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

                       <div className="inventory-panel-footer">
          {activeTab === 'orders'
            ? `Mostrando ${filteredOrders.length} de ${ORDERS.length} pedidos`
            : `Mostrando ${filteredInvoices.length} de ${INVOICES.length} facturas`}
        </div>
      </section>

      <OrderForm
        isOpen={isOrderFormOpen}
        toggle={toggleOrderForm}
      />

      <InvoiceForm
        isOpen={isInvoiceFormOpen}
        toggle={toggleInvoiceForm}
      />
    </section>
  )
}

export default SalesPage