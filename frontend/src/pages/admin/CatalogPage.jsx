import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Store,
  CookingPot,
  Package,
  Search,
  Eye,
  Pencil,
  Trash2
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/CatalogPage.css'

import CatalogForm from '../../components/admin/CatalogForm'
import CatalogDetail from '../../components/admin/CatalogDetail'

import { getCatalog } from '../../services/catalogService'

import {
  addCatalogProduct,
  getInventorySupplies,
  getSuppliers
} from '../../services/inventoryService'

function CatalogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('ALL')

  const [products, setProducts] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [supplies, setSupplies] = useState([])

  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [supplierError, setSupplierError] = useState('')
  const [suppliesError, setSuppliesError] = useState('')

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    setProducts([])

    try {
      setProducts(await getCatalog())
    } catch (error) {
      setLoadError(
        error.message || 'No se pudo cargar el catálogo.'
      )
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProducts()

    getSuppliers()
      .then(setSuppliers)
      .catch(error => {
        setSupplierError(
          error.message ||
          'No se pudieron cargar los proveedores.'
        )
      })

    getInventorySupplies()
      .then(setSupplies)
      .catch(error => {
        setSuppliesError(
          error.message ||
          'No se pudieron cargar los insumos.'
        )
      })
  }, [loadProducts])

  const preparedCount = products.filter(
    product => product.product_type === 'PREPARED'
  ).length

  const packagedCount = products.filter(
    product => product.product_type === 'PACKAGED'
  ).length

  const statistics = [
    {
      label: 'Total de productos',
      value: products.length,
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
    return products.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())

      const matchesType =
        typeFilter === 'ALL' ||
        product.product_type === typeFilter

      return matchesSearch && matchesType
    })
  }, [products, searchTerm, typeFilter])

  const handleAddProduct = async form => {
    await addCatalogProduct(form)
    setIsFormOpen(false)
    await loadProducts()
  }

  const toggleForm = () => {
    setIsFormOpen(previous => !previous)
  }

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
                <strong>
                  {isLoading ? '—' : stat.value}
                </strong>
                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>Productos del menú</h2>

          <p>
            Consultá los productos, sus precios y tipos.
          </p>
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
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Tipo de producto</span>

            <select
              value={typeFilter}
              onChange={event =>
                setTypeFilter(event.target.value)
              }
            >
              <option value="ALL">Todos los tipos</option>
              <option value="PREPARED">Preparados</option>
              <option value="PACKAGED">Empaquetados</option>
            </select>
          </label>
        </div>

        {loadError && (
          <p className="inventory-empty" role="alert">
            {loadError}
          </p>
        )}

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
                      className={`catalog-type ${
                        product.product_type.toLowerCase()
                      }`}
                    >
                      {product.product_type === 'PREPARED' ? (
                        <CookingPot size={15} />
                      ) : (
                        <Package size={15} />
                      )}

                      {product.product_type === 'PREPARED'
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

                      {product.product_type === 'PACKAGED' && (
                        <button
                          type="button"
                          className="catalog-action view"
                          title="Ver detalle"
                          aria-label={`Ver detalle de ${product.name}`}
                          onClick={() => setSelectedProduct(product)}
                        >
                          <Eye size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {isLoading && (
                <tr>
                  <td colSpan={4} className="inventory-empty">
                    Cargando catálogo...
                  </td>
                </tr>
              )}

              {!isLoading &&
                !loadError &&
                filteredProducts.length === 0 && (
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
          Mostrando {filteredProducts.length} de {products.length} productos
        </div>
      </section>

      <CatalogForm
        isOpen={isFormOpen}
        toggle={toggleForm}
        onSubmit={handleAddProduct}
        suppliers={suppliers}
        suppliersError={supplierError}
        supplies={supplies}
        suppliesError={suppliesError}
      />

      <CatalogDetail
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </section>
  )
}

export default CatalogPage