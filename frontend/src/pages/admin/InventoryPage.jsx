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
  Package,
  ShoppingBag,
  CheckCircle2,
  TriangleAlert,
  Search,
  Truck,
  Plus
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/SalesPage.css'

import { getBranches } from '../../services/catalogService'
import { getSession } from '../../services/authService'
import {
  addInventorySupply,
  getBranchInventory,
  getBranchPackagedInventory
} from '../../services/inventoryService'
import InventorySupplyForm from '../../components/admin/InventorySupplyForm'

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
  const session = getSession()
  const canChooseBranch = String(session?.role || '').toUpperCase() === 'GERENTE'
  const assignedBranchId = session?.branchId ? String(session.branchId) : ''
  const [activeTab, setActiveTab] = useState('supplies')
  const [searchTerm, setSearchTerm] = useState('')
  const [branchId, setBranchId] = useState(
    canChooseBranch ? '' : assignedBranchId
  )
  const [stockFilter, setStockFilter] = useState('ALL')

  const [branches, setBranches] = useState([])
  const [products, setProducts] = useState([])

  const [branchError, setBranchError] = useState('')
  const [loadError, setLoadError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSupplyFormOpen, setIsSupplyFormOpen] = useState(false)

  const inventoryRequestId = useRef(0)

  const isSupplies = activeTab === 'supplies'

  const loadInventory = useCallback(async (selectedBranchId, suppliesTab) => {
    const requestId = ++inventoryRequestId.current

    setIsLoading(true)
    setLoadError('')
    setProducts([])

    try {
      const inventory = await (suppliesTab
        ? getBranchInventory(selectedBranchId)
        : getBranchPackagedInventory(selectedBranchId))

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

        const availableBranches = canChooseBranch
          ? data
          : data.filter(branch => String(branch.id) === assignedBranchId)
        setBranches(availableBranches)

        if (availableBranches.length) {
          setBranchId(
            canChooseBranch
              ? String(availableBranches[0].id)
              : assignedBranchId
          )
        } else {
          setBranchError(
            canChooseBranch
              ? 'No hay sucursales registradas.'
              : 'No se encontró la sucursal asignada a tu cuenta.'
          )
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

    return () => {
      active = false
    }
  }, [assignedBranchId, canChooseBranch])

  useEffect(() => {
    if (branchId) {
      loadInventory(branchId, isSupplies)
    } else {
      inventoryRequestId.current += 1
      setProducts([])
      setIsLoading(false)
      setLoadError('')
    }

    return () => {
      inventoryRequestId.current += 1
    }
  }, [branchId, isSupplies, loadInventory])

  const changeTab = tab => {
    setActiveTab(tab)
    setSearchTerm('')
    setStockFilter('ALL')
  }

  const handleAddSupply = async form => {
    await addInventorySupply({
      ...form,
      branch_id: Number(branchId)
    })
    setIsSupplyFormOpen(false)
    await loadInventory(branchId, true)
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
            Consultá y controlá las existencias
            de cada sucursal.
          </p>
        </div>

        <div className="inventory-heading-actions">
          {canChooseBranch && isSupplies && (
            <button
              type="button"
              className="inventory-primary-button"
              onClick={() => setIsSupplyFormOpen(true)}
              disabled={!branchId || Boolean(branchError)}
            >
              <Plus size={20} />
              Agregar insumo
            </button>
          )}
          <Link
            to="/staff/purchases"
            className="inventory-primary-button inventory-purchases-link"
          >
            <Truck size={20} />
            Ir a compras
          </Link>
        </div>
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
                  {isLoading || loadError || !branchId
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
              disabled={!canChooseBranch || !branches.length}
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
                disabled={!branchId || isLoading || Boolean(loadError)}
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
              disabled={!branchId || isLoading || Boolean(loadError)}
            >
              <option value="ALL">Todos</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="LOW">Stock bajo</option>
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
              {!isLoading && !loadError && filteredProducts.map(product => {
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

              {isLoading && (
                <tr>
                  <td colSpan={5} className="inventory-empty">
                    Cargando existencias...
                  </td>
                </tr>
              )}

              {!isLoading &&
                !loadError &&
                filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="inventory-empty">
                      {branchId
                        ? (isSupplies ? 'No se encontraron insumos.' : 'No se encontraron productos empaquetados.')
                        : 'Seleccioná una sucursal.'}
                    </td>
                  </tr>
                )}
            </tbody>
          </table>
        </div>

        <div className="inventory-panel-footer">
          {isLoading
            ? 'Cargando inventario...'
            : loadError
              ? 'Inventario no disponible'
              : `Mostrando ${filteredProducts.length} de ${products.length} ${isSupplies ? 'insumos' : 'productos'}`}
        </div>
      </section>

      <InventorySupplyForm
        isOpen={isSupplyFormOpen}
        toggle={() => setIsSupplyFormOpen(false)}
        branchName={branches.find(branch => String(branch.id) === branchId)?.name}
        onSubmit={handleAddSupply}
      />
    </section>
  )
}

export default InventoryPage