import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Store,
  CookingPot,
  Package,
  Search,
  Pencil,
  Trash2
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/CatalogPage.css'
import CatalogForm from '../../components/admin/CatalogForm'

const PRODUCTS = [
  { id: 1, name: 'Pupusa revuelta', type: 'PREPARED', price: 1.25 },
  { id: 2, name: 'Café de olla', type: 'PREPARED', price: 1.50 },
  { id: 3, name: 'Quesadilla', type: 'PREPARED', price: 2.00 },
  { id: 4, name: 'Tamales de pollo', type: 'PREPARED', price: 1.50 },
  { id: 5, name: 'Agua embotellada', type: 'PACKAGED', price: 0.75 },
  { id: 6, name: 'Gaseosa', type: 'PACKAGED', price: 1.00 }
]

function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const preparedCount = PRODUCTS.filter(
    product => product.type === 'PREPARED'
  ).length

  const packagedCount = PRODUCTS.filter(
    product => product.type === 'PACKAGED'
  ).length

  const [isFormOpen, setIsFormOpen] = useState(false)

const toggleForm = () => {
  setIsFormOpen(previous => !previous)
}

  const statistics = [
    {
      label: 'Total de productos',
      value: PRODUCTS.length,
      icon: Store,
      color: 'blue'
    },
    {
      label: 'Preparados',
      value: preparedCount,
      icon: CookingPot,
      color: 'yellow'
    },
    {
      label: 'Empaquetados',
      value: packagedCount,
      icon: Package,
      color: 'pink'
    }
  ]

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase())

      const matchesType =
        typeFilter === 'ALL' || product.type === typeFilter

      return matchesSearch && matchesType
    })
  }, [searchTerm, typeFilter])

  return (
    <section className="catalog-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">INVENTARIO</span>
          <h1>Catálogo de productos</h1>
          <p>Administrá los productos disponibles para la venta.</p>
        </div>

        <button
  type="button"
  className="inventory-primary-button"
  onClick={toggleForm}
>
  <Plus size={20} />
  Nuevo producto
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
          <h2>Productos del menú</h2>
          <p>Consultá los productos, sus precios y categorías.</p>
        </div>

        <div className="inventory-filters catalog-filters">
          <label className="inventory-field">
            <span>Buscar producto</span>

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
            <span>Tipo de producto</span>

            <select
              value={typeFilter}
              onChange={event => setTypeFilter(event.target.value)}
            >
              <option value="ALL">Todos los tipos</option>
              <option value="PREPARED">Preparados</option>
              <option value="PACKAGED">Empaquetados</option>
            </select>
          </label>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Precio de venta</th>
                <th>Acciones</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <strong>{product.name}</strong>
                  </td>

                  <td>
                    <span
                      className={`catalog-type ${product.type.toLowerCase()}`}
                    >
                      {product.type === 'PREPARED' ? (
                        <CookingPot size={15} />
                      ) : (
                        <Package size={15} />
                      )}

                      {product.type === 'PREPARED'
                        ? 'Preparado'
                        : 'Empaquetado'}
                    </span>
                  </td>

                  <td className="catalog-price">
                    ${Number(product.price).toFixed(2)}
                  </td>

                  <td>
                    <div className="catalog-actions">
                      <button
                        type="button"
                        className="catalog-action edit"
                        title="Editar producto"
                        aria-label="Editar producto"
                        disabled
                      >
                        <Pencil size={17} />
                      </button>

                      <button
                        type="button"
                        className="catalog-action delete"
                        title="Eliminar producto"
                        aria-label="Eliminar producto"
                        disabled
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="inventory-empty">
                    No se encontraron productos.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          Mostrando {filteredProducts.length} de {PRODUCTS.length} productos
        </div>
      </section>

      <CatalogForm
        isOpen={isFormOpen}
        toggle={toggleForm}
      />
    </section>
  )
}

export default CatalogPage