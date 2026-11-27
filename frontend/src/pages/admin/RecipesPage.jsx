import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'

import { Link } from 'react-router-dom'

import {
  ArrowLeft,
  Plus,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  Pencil,
  CookingPot
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/RecipesPage.css'

import RecipeForm from '../../components/admin/RecipeForm'
import RecipePreparationForm from '../../components/admin/RecipePreparationForm'

import {
  getBranches,
  getCatalog
} from '../../services/catalogService'
import { getSession } from '../../services/authService'

import {
  addCatalogProduct,
  createInventoryRecipe,
  getInventoryRecipes,
  getAvailableInventorySupplies,
  prepareInventoryRecipe
} from '../../services/inventoryService'

const RECIPE_COLORS = ['yellow', 'blue', 'pink']

const UNIT_LABELS = {
  G: 'Gramos',
  ML: 'Mililitros',
  KG: 'Kilogramos',
  L: 'Litros',
  UNIT: 'Unidades'
}

function RecipesPage() {
  const session = getSession()
  const role = String(session?.role || '').toUpperCase()
  const canChooseBranch = role === 'GERENTE'
  const canCreateRecipe = canChooseBranch || role === 'COCINERO'
  const assignedBranchId = session?.branchId ? String(session.branchId) : ''
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRecipes, setExpandedRecipes] = useState([])

  const [recipes, setRecipes] = useState([])
  const [supplies, setSupplies] = useState([])
  const [catalog, setCatalog] = useState([])
  const [branches, setBranches] = useState([])

  const [branchesError, setBranchesError] = useState('')
  const [loadError, setLoadError] = useState('')

  const [isLoading, setIsLoading] = useState(true)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [preparationRecipe, setPreparationRecipe] = useState(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const [recipeData, supplyData, catalogData] =
        await Promise.all([
          getInventoryRecipes(),
          getAvailableInventorySupplies(),
          getCatalog()
        ])

      setRecipes(recipeData)
      setSupplies(supplyData)
      setCatalog(catalogData)
    } catch (error) {
      setLoadError(
        error.message ||
        'No se pudieron cargar las recetas.'
      )

      setRecipes([])
      setSupplies([])
      setCatalog([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    let active = true

    getBranches()
      .then(data => {
        if (active) {
          const availableBranches = canChooseBranch
            ? data
            : data.filter(branch => String(branch.id) === assignedBranchId)
          setBranches(availableBranches)
          if (!availableBranches.length) {
            setBranchesError(
              canChooseBranch
                ? 'No hay sucursales registradas.'
                : 'No se encontró la sucursal asignada a tu cuenta.'
            )
          }
        }
      })
      .catch(error => {
        if (active) {
          setBranchesError(
            error.message ||
            'No se pudieron cargar las sucursales.'
          )
        }
      })

    return () => {
      active = false
    }
  }, [assignedBranchId, canChooseBranch])

  const preparedProductIds = useMemo(
    () => new Set(
      recipes.map(recipe => Number(recipe.product_id))
    ),
    [recipes]
  )

  const preparedProducts = useMemo(
    () =>
      catalog.filter(
        product =>
          product.product_type === 'PREPARED' &&
          !preparedProductIds.has(Number(product.id))
      ),
    [catalog, preparedProductIds]
  )

  const productNames = useMemo(
    () =>
      new Map(
        catalog.map(product => [
          Number(product.id),
          product.name
        ])
      ),
    [catalog]
  )

  const toggleForm = () => {
    setIsFormOpen(previous => !previous)
  }

  const toggleRecipe = id => {
    setExpandedRecipes(previous =>
      previous.includes(id)
        ? previous.filter(recipeId => recipeId !== id)
        : [...previous, id]
    )
  }

  const filteredRecipes = useMemo(() => {
    const search = searchTerm.trim().toLowerCase()

    return recipes.filter(recipe => {
      const productName =
        productNames.get(Number(recipe.product_id)) ||
        recipe.product_name ||
        ''

      return (
        recipe.name.toLowerCase().includes(search) ||
        productName.toLowerCase().includes(search)
      )
    })
  }, [recipes, searchTerm, productNames])

  const handleCreateRecipe = async form => {
    if (form.newProductName) {
      await addCatalogProduct({
        name: form.newProductName,
        price: form.price,
        productType: 'PREPARED',
        ingredients: form.ingredients
      })
    } else {
      await createInventoryRecipe(form)
    }

    setIsFormOpen(false)

    await loadData()
  }

  const handlePrepareRecipe = form =>
    prepareInventoryRecipe(form)

  return (
    <section className="recipes-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">
            INVENTARIO
          </span>

          <h1>Recetas</h1>

          <p>
            Administrá los ingredientes de cada preparación.
          </p>
        </div>

        {canCreateRecipe && (
          <button
            type="button"
            className="inventory-primary-button"
            onClick={toggleForm}
            disabled={
              isLoading ||
              Boolean(loadError)
            }
            title={
              !isLoading && supplies.length === 0
                ? 'No hay insumos disponibles en tu sucursal'
                : undefined
            }
          >
            <Plus size={20} />
            Nueva receta
          </button>
        )}
      </div>

      <div className="recipes-toolbar">
        <div className="recipes-summary">
          <span className="recipes-summary-icon">
            <CookingPot size={24} />
          </span>

          <div>
            <strong>
              {isLoading || loadError
                ? '—'
                : recipes.length}
            </strong>

            <span>Recetas registradas</span>
          </div>
        </div>

        <label className="inventory-field recipes-search">
          <span>Buscar receta</span>

          <div className="inventory-search">
            <Search size={19} />

            <input
              type="search"
              placeholder="Buscar receta o producto..."
              value={searchTerm}
              onChange={event =>
                setSearchTerm(event.target.value)
              }
            />
          </div>
        </label>
      </div>

      {loadError && (
        <p className="inventory-empty" role="alert">
          {loadError}
        </p>
      )}

      {branchesError && (
        <p className="inventory-empty" role="alert">
          {branchesError}
        </p>
      )}

      <div className="recipes-list">
        {filteredRecipes.map((recipe, index) => {
          const isExpanded =
            expandedRecipes.includes(recipe.id)

          const ingredients =
            Array.isArray(recipe.ingredients)
              ? recipe.ingredients
              : []

          const productName =
            productNames.get(Number(recipe.product_id)) ||
            recipe.product_name

          const color =
            RECIPE_COLORS[index % RECIPE_COLORS.length]

          return (
            <article
              className="recipe-card"
              key={recipe.id}
            >
              <button
                type="button"
                className="recipe-card-header"
                onClick={() => toggleRecipe(recipe.id)}
                aria-expanded={isExpanded}
              >
                <span className={`recipe-icon ${color}`}>
                  <BookOpen size={26} />
                </span>

                <span className="recipe-card-title">
                  <strong>{recipe.name}</strong>

                  {productName && (
                    <small>
                      Producto: {productName}
                    </small>
                  )}

                  <span className="recipe-ingredient-count">
                    {ingredients.length}{' '}
                    {ingredients.length === 1
                      ? 'ingrediente'
                      : 'ingredientes'}
                  </span>
                </span>

                <span className="recipe-expand-icon">
                  {isExpanded ? (
                    <ChevronUp size={22} />
                  ) : (
                    <ChevronDown size={22} />
                  )}
                </span>
              </button>

              {isExpanded && (
                <div className="recipe-card-content">
                  {recipe.description && (
                    <div className="recipe-description">
                      <h3>Descripción de la receta</h3>
                      <p>{recipe.description}</p>
                    </div>
                  )}

                  <div className="recipe-content-heading">
                    <h3>Ingredientes</h3>
                    <span>Cantidad por preparación</span>
                  </div>

                  <div className="inventory-table-wrapper">
                    <table className="inventory-table recipe-table">
                      <thead>
                        <tr>
                          <th>Ingrediente</th>
                          <th>Cantidad</th>
                          <th>Unidad de medida</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ingredients.map(ingredient => (
                          <tr key={ingredient.supply_id}>
                            <td>
                              <strong>
                                {ingredient.name}
                              </strong>
                            </td>

                            <td>
                              {Number(
                                ingredient.quantity_used
                              ).toLocaleString('es-SV', {
                                maximumFractionDigits: 3
                              })}
                            </td>

                            <td>
                              {UNIT_LABELS[
                                String(
                                  ingredient.unit
                                ).toUpperCase()
                              ] || ingredient.unit}
                            </td>
                          </tr>
                        ))}

                        {ingredients.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="inventory-empty"
                            >
                              No hay ingredientes registrados.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="recipe-card-footer">
                    <button
                      type="button"
                      className="recipe-edit-button"
                      disabled
                      title="Pendiente de conexión"
                    >
                      <Pencil size={16} />
                      Editar receta
                    </button>

                    <button
                      type="button"
                      className="recipe-edit-button"
                      onClick={() =>
                        setPreparationRecipe(recipe)
                      }
                      disabled={!branches.length || ingredients.length === 0}
                      title={
                        !branches.length
                          ? 'No hay sucursales disponibles'
                          : ingredients.length === 0
                            ? 'La receta no tiene ingredientes registrados'
                          : undefined
                      }
                    >
                      <CookingPot size={16} />
                      Preparar
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}

        {isLoading && (
          <div className="recipes-empty">
            <BookOpen size={36} />
            <h3>Cargando recetas...</h3>
          </div>
        )}

        {!isLoading &&
          !loadError &&
          filteredRecipes.length === 0 && (
            <div className="recipes-empty">
              <BookOpen size={36} />

              <h3>No se encontraron recetas</h3>

              <p>
                Intentá buscar con otro nombre.
              </p>
            </div>
          )}
      </div>

      <div className="recipes-footer">
        Mostrando {filteredRecipes.length} de{' '}
        {recipes.length} recetas
      </div>

      <RecipeForm
        isOpen={canCreateRecipe && isFormOpen}
        toggle={toggleForm}
        onSubmit={handleCreateRecipe}
        preparedProducts={preparedProducts}
        supplies={supplies}
      />

      <RecipePreparationForm
        isOpen={Boolean(preparationRecipe)}
        toggle={() => setPreparationRecipe(null)}
        onSubmit={handlePrepareRecipe}
        recipe={preparationRecipe}
        branches={branches}
        allowBranchSelection={canChooseBranch}
        initialBranchId={
          branches[0]
            ? (canChooseBranch
                ? String(branches[0].id)
                : assignedBranchId)
            : ''
        }
      />
    </section>
  )
}

export default RecipesPage