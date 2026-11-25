import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Package,
  CheckCircle2,
  TriangleAlert,
  Search
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import ProductForm from '../../components/admin/ProductForm'

const PRODUCTS = [
  { id: 1, name: 'Harina de maíz', quantity: 45, unit: 'kg', min_stock: 10 },
  { id: 2, name: 'Queso', quantity: 3, unit: 'kg', min_stock: 5 },
  { id: 3, name: 'Café molido', quantity: 18, unit: 'kg', min_stock: 5 },
  { id: 4, name: 'Aceite', quantity: 2, unit: 'L', min_stock: 5 },
  { id: 5, name: 'Azúcar', quantity: 25, unit: 'kg', min_stock: 8 }
]

function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [branchId, setBranchId] = useState('1')
  const [stockFilter, setStockFilter] = useState('ALL')
  const [isFormOpen, setIsFormOpen] = useState(false)

const toggleForm = () => {
  setIsFormOpen(previous => !previous)
}

  const lowStock = PRODUCTS.filter(
    product => product.quantity <= product.min_stock
  ).length

  const statistics = [
    {
      label: 'Total de insumos',
      value: PRODUCTS.length,
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Stock disponible',
      value: PRODUCTS.length - lowStock,
      icon: CheckCircle2,
      color: 'yellow'
    },
    {
      label: 'Stock bajo',
      value: lowStock,
      icon: TriangleAlert,
      color: 'pink'
    }
  ]

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const isLowStock = product.quantity <= product.min_stock

      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && isLowStock) ||
        (stockFilter === 'AVAILABLE' && !isLowStock)

      return matchesSearch && matchesStock
    })
  }, [searchTerm, stockFilter])

  return (
    <section className="inventory-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">INVENTARIO</span>
          <h1>Existencias</h1>
          <p>
            Consultá y administrá los insumos de cada sucursal.
          </p>
        </div>

        <button
  type="button"
  className="inventory-primary-button"
  onClick={toggleForm}
>
  <Plus size={20} />
  Agregar insumo
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

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Inventario de insumos</h2>
          <p>Consultá las cantidades y niveles de existencias.</p>
        </div>

        <div className="inventory-filters">
          <label className="inventory-field">
            <span>Sucursal</span>

            <select
              value={branchId}
              onChange={event => setBranchId(event.target.value)}
            >
              <option value="1">Sucursal Centro Histórico</option>
            </select>
          </label>

          <label className="inventory-field">
            <span>Buscar insumo</span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Estado</span>

            <select
              value={stockFilter}
              onChange={event => setStockFilter(event.target.value)}
            >
              <option value="ALL">Todos</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="LOW">Stock bajo</option>
            </select>
          </label>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Insumo</th>
                <th>Existencia</th>
                <th>Unidad</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(product => {
                const isLowStock =
                  product.quantity <= product.min_stock

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>{product.quantity}</td>
                    <td>{product.unit}</td>
                    <td>{product.min_stock}</td>

                    <td>
                      <span
                        className={`inventory-status ${
                          isLowStock ? 'low' : 'available'
                        }`}
                      >
                        {isLowStock ? (
                          <TriangleAlert size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}

                        {isLowStock ? 'Stock bajo' : 'Disponible'}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="inventory-empty">
                    No se encontraron insumos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          Mostrando {filteredProducts.length} de {PRODUCTS.length} insumos
        </div>
      </section>
      <ProductForm
  isOpen={isFormOpen}
  toggle={toggleForm}
/>
    </section>
  )
}

export default InventoryPage