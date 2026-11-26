import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import { Link } from 'react-router-dom'

import {
  ArrowLeft,
  Plus,
  Package,
  ShoppingBag,
  CheckCircle2,
  TriangleAlert,
  Search
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'

import ProductForm from '../../components/admin/ProductForm'

import { getBranches } from '../../services/catalogService'

import {
  addInventorySupply,
  getBranchInventory,
  getSuppliers
} from '../../services/inventoryService'

const UNIT_LABELS = {
  G: 'Gramos',
  ML: 'Mililitros',
  KG: 'Kilogramos',
  L: 'Litros',
  UNIT: 'Unidades'
}

const formatQuantity = value =>
  new Intl.NumberFormat('es-SV', {
    maximumFractionDigits: 3
  }).format(Number(value))

function InventoryPage() {
  const [activeTab, setActiveTab] = useState('supplies')
  const [searchTerm, setSearchTerm] = useState('')
  const [branchId, setBranchId] = useState('')
  const [stockFilter, setStockFilter] = useState('ALL')

  const [branches, setBranches] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [products, setProducts] = useState([])

  const [branchError, setBranchError] = useState('')
  const [supplierError, setSupplierError] = useState('')
  const [loadError, setLoadError] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [isFormOpen, setIsFormOpen] = useState(false)

  const inventoryRequestId = useRef(0)

  const isSupplies = activeTab === 'supplies'

  const loadInventory = useCallback(async selectedBranchId => {
    const requestId = ++inventoryRequestId.current

    setIsLoading(true)
    setLoadError('')
    setProducts([])

    try {
      const inventory = await getBranchInventory(selectedBranchId)

      if (requestId === inventoryRequestId.current) {
        setProducts(inventory)
      }
    } catch (error) {
      if (requestId === inventoryRequestId.current) {
        setLoadError(
          error.message ||
          'No se pudo cargar el inventario.'
        )
      }
    } finally {
      if (requestId === inventoryRequestId.current) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    let active = true

    getBranches()
      .then(data => {
        if (!active) return

        setBranches(data)

        if (data.length) {
          setBranchId(String(data[0].id))
        } else {
          setBranchError('No hay sucursales registradas.')
        }
      })
      .catch(error => {
        if (active) {
          setBranchError(
            error.message ||
            'No se pudieron cargar las sucursales.'
          )
        }
      })

    getSuppliers()
      .then(data => {
        if (active) {
          setSuppliers(data)
        }
      })
      .catch(error => {
        if (active) {
          setSupplierError(
            error.message ||
            'No se pudieron cargar los proveedores.'
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (branchId) {
      loadInventory(branchId)
    } else {
      inventoryRequestId.current += 1
      setProducts([])
      setIsLoading(false)
      setLoadError('')
    }
  }, [branchId, loadInventory])

  const toggleForm = () => {
    setIsFormOpen(previous => !previous)
  }

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStockFilter('ALL')
  }

  const handleAddSupply = async form => {
    await addInventorySupply(form)

    setIsFormOpen(false)

    const newBranchId = String(form.branch_id)

    if (newBranchId !== branchId) {
      setBranchId(newBranchId)
    } else {
      await loadInventory(newBranchId)
    }
  }

  const lowStock = products.filter(
    product =>
      Number(product.quantity) <= Number(product.min_stock)
  ).length

  const statistics = [
    {
      label: isSupplies
        ? 'Total de insumos'
        : 'Total de productos',
      value: products.length,
      icon: isSupplies ? Package : ShoppingBag,
      color: 'blue'
    },
    {
      label: 'Stock disponible',
      value: products.length - lowStock,
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
    return products.filter(product => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase())

      const isLowStock =
        Number(product.quantity) <= Number(product.min_stock)

      const matchesStock =
        stockFilter === 'ALL' ||
        (stockFilter === 'LOW' && isLowStock) ||
        (stockFilter === 'AVAILABLE' && !isLowStock)

      return matchesSearch && matchesStock
    })
  }, [products, searchTerm, stockFilter])

  return (
    <section className="inventory-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">
            INVENTARIO
          </span>

          <h1>Existencias</h1>

          <p>
            Consultá y administrá las existencias
            de cada sucursal.
          </p>
        </div>

        {isSupplies && (
          <button
            type="button"
            className="inventory-primary-button"
            onClick={toggleForm}
            disabled={!branches.length}
          >
            <Plus size={20} />
            Agregar insumo
          </button>
        )}
      </div>

      {branchError && (
        <p className="inventory-empty" role="alert">
          {branchError}
        </p>
      )}

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
                  {!isSupplies || isLoading || loadError || !branchId
                    ? '—'
                    : stat.value}
                </strong>

                <span>{stat.label}</span>
              </div>
            </article>
          )
        })}
      </div>

      <div className="sales-tabs inventory-tabs">
        <button
          type="button"
          className={`sales-tab ${isSupplies ? 'active' : ''}`}
          onClick={() => changeTab('supplies')}
        >
          <Package size={20} />
          Insumos
        </button>

        <button
          type="button"
          className={`sales-tab ${!isSupplies ? 'active' : ''}`}
          onClick={() => changeTab('packaged')}
        >
          <ShoppingBag size={20} />
          Productos empaquetados
        </button>
      </div>

      <section className="inventory-panel">
        <div className="inventory-panel-heading">
          <h2>
            {isSupplies
              ? 'Inventario de insumos'
              : 'Inventario de productos empaquetados'}
          </h2>

          <p>
            {isSupplies
              ? 'Consultá las existencias de los ingredientes utilizados en las recetas.'
              : 'Consultá las existencias de los productos de venta directa.'}
          </p>
        </div>

        <div className="inventory-filters">
          <label className="inventory-field">
            <span>Sucursal</span>

            <select
              value={branchId}
              onChange={event =>
                setBranchId(event.target.value)
              }
              disabled={!branches.length}
            >
              <option value="">
                Seleccionar sucursal
              </option>

              {branches.map(branch => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </label>

          <label className="inventory-field">
            <span>
              {isSupplies
                ? 'Buscar insumo'
                : 'Buscar producto'}
            </span>

            <div className="inventory-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Buscar por nombre..."
                value={searchTerm}
                onChange={event =>
                  setSearchTerm(event.target.value)
                }
                disabled={!isSupplies}
              />
            </div>
          </label>

          <label className="inventory-field">
            <span>Estado</span>

            <select
              value={stockFilter}
              onChange={event =>
                setStockFilter(event.target.value)
              }
              disabled={!isSupplies}
            >
              <option value="ALL">Todos</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="LOW">Stock bajo</option>
            </select>
          </label>
        </div>

        {isSupplies && loadError && (
          <p className="inventory-empty" role="alert">
            {loadError}
          </p>
        )}

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>
                  {isSupplies ? 'Insumo' : 'Producto'}
                </th>
                <th>Existencia</th>
                <th>Unidad</th>
                <th>Stock mínimo</th>
                <th>Estado</th>
              </tr>
            </thead>

            <tbody>
              {isSupplies && filteredProducts.map(product => {
                const isLowStock =
                  Number(product.quantity) <=
                  Number(product.min_stock)

                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>

                    <td>
                      {formatQuantity(product.quantity)}
                    </td>

                    <td>
                      {UNIT_LABELS[
                        String(product.unit).toUpperCase()
                      ] || product.unit}
                    </td>

                    <td>
                      {formatQuantity(product.min_stock)}
                    </td>

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

                        {isLowStock
                          ? 'Stock bajo'
                          : 'Disponible'}
                      </span>
                    </td>
                  </tr>
                )
              })}

              {isSupplies && isLoading && (
                <tr>
                  <td colSpan={5} className="inventory-empty">
                    Cargando existencias...
                  </td>
                </tr>
              )}

              {isSupplies &&
                !isLoading &&
                !loadError &&
                filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="inventory-empty">
                      {branchId
                        ? 'No se encontraron insumos para esta sucursal.'
                        : 'Seleccioná una sucursal.'}
                    </td>
                  </tr>
                )}

              {!isSupplies && (
                <tr>
                  <td colSpan={5} className="inventory-empty">
                    La consulta de existencias de productos
                    empaquetados está pendiente de conexión.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          {isSupplies
            ? `Mostrando ${filteredProducts.length} de ${products.length} insumos`
            : 'Consulta de existencias pendiente'}
        </div>
      </section>

      <ProductForm
        isOpen={isFormOpen}
        toggle={toggleForm}
        onSubmit={handleAddSupply}
        branches={branches}
        suppliers={suppliers}
        suppliersError={supplierError}
        initialBranchId={branchId}
      />
    </section>
  )
}

export default InventoryPage