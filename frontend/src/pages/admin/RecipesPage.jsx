import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Search,
  ChevronDown,
  ChevronUp,
  CookingPot,
} from 'lucide-react'

import '../../styles/InventoryPage.css'
import '../../styles/RecipesPage.css'
import RecipeForm from '../../components/admin/RecipeForm'
import RecipePreparationForm from '../../components/admin/RecipePreparationForm'
import { getBranches, getCatalog } from '../../services/catalogService'
import {
  createInventoryRecipe,
  getInventoryRecipes,
  getInventorySupplies,
  prepareInventoryRecipe,
} from '../../services/inventoryService'

const RECIPE_COLORS = ['yellow', 'blue', 'pink']

function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRecipes, setExpandedRecipes] = useState([])
  const [recipes, setRecipes] = useState([])
  const [supplies, setSupplies] = useState([])
  const [catalog, setCatalog] = useState([])
  const [branches, setBranches] = useState([])
  const [branchesError, setBranchesError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [preparationRecipe, setPreparationRecipe] = useState(null)

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')
    try {
      const [recipeData, supplyData, catalogData] = await Promise.all([
        getInventoryRecipes(),
        getInventorySupplies(),
        getCatalog(),
      ])
      setRecipes(recipeData)
      setSupplies(supplyData)
      setCatalog(catalogData)
    } catch (error) {
      setLoadError(error.message || 'No se pudieron cargar las recetas.')
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
        if (active) setBranches(data)
      })
      .catch(error => {
        if (active) {
          setBranchesError(error.message || 'No se pudieron cargar las sucursales.')
        }
      })
    return () => {
      active = false
    }
  }, [])

  const preparedProductIds = useMemo(
    () => new Set(recipes.map(recipe => Number(recipe.product_id))),
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

  const toggleRecipe = id => {
    setExpandedRecipes(previous =>
      previous.includes(id)
        ? previous.filter(recipeId => recipeId !== id)
        : [...previous, id]
    )
  }

  const filteredRecipes = useMemo(
    () =>
      recipes.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    [recipes, searchTerm]
  )

  const handleCreateRecipe = async form => {
    await createInventoryRecipe(form)
    setIsFormOpen(false)
    await loadData()
  }

  const handlePrepareRecipe = form => prepareInventoryRecipe(form)

  const toggleForm = () => setIsFormOpen(previous => !previous)

  return (
    <section className="recipes-page">
      <Link to="/staff" className="admin-back-link">
        <ArrowLeft size={17} />
        Volver al resumen
      </Link>

      <div className="inventory-heading">
        <div>
          <span className="admin-eyebrow">INVENTARIO</span>
          <h1>Recetas</h1>
          <p>Administrá los ingredientes de cada preparación.</p>
        </div>

        <button
          type="button"
          className="inventory-primary-button"
          onClick={toggleForm}
          disabled={isLoading || preparedProducts.length === 0 || supplies.length === 0}
          title={
            !isLoading && preparedProducts.length === 0
              ? 'No hay productos preparados disponibles para asignar una receta'
              : undefined
          }
        >
          <Plus size={20} />
          Nueva receta
        </button>
      </div>

      <div className="recipes-toolbar">
        <div className="recipes-summary">
          <span className="recipes-summary-icon">
            <CookingPot size={24} />
          </span>
          <div>
            <strong>{isLoading ? '—' : recipes.length}</strong>
            <span>Recetas registradas</span>
          </div>
        </div>

        <label className="inventory-field recipes-search">
          <span>Buscar receta</span>
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
      </div>

      {loadError && <p className="inventory-empty" role="alert">{loadError}</p>}
      {branchesError && <p className="inventory-empty" role="alert">{branchesError}</p>}

      <div className="recipes-list">
        {filteredRecipes.map((recipe, index) => {
          const isExpanded = expandedRecipes.includes(recipe.id)
          const ingredients = Array.isArray(recipe.ingredients)
            ? recipe.ingredients
            : []

          return (
            <article className="recipe-card" key={recipe.id}>
              <button
                type="button"
                className="recipe-card-header"
                onClick={() => toggleRecipe(recipe.id)}
                aria-expanded={isExpanded}
              >
                <span className={`recipe-icon ${RECIPE_COLORS[index % RECIPE_COLORS.length]}`}>
                  <BookOpen size={26} />
                </span>
                <span className="recipe-card-title">
                  <strong>{recipe.name}</strong>
                  <small>{ingredients.length} ingredientes</small>
                </span>
                <span className="recipe-expand-icon">
                  {isExpanded ? <ChevronUp size={22} /> : <ChevronDown size={22} />}
                </span>
              </button>

              {isExpanded && (
                <div className="recipe-card-content">
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
                            <td><strong>{ingredient.name}</strong></td>
                            <td>{Number(ingredient.quantity_used).toLocaleString('es-SV')}</td>
                            <td>{ingredient.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="recipe-card-footer">
                    <button
                      type="button"
                      className="recipe-edit-button"
                      onClick={() => setPreparationRecipe(recipe)}
                      disabled={!branches.length}
                      title={!branches.length ? 'No hay sucursales disponibles' : undefined}
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
        {!isLoading && !loadError && filteredRecipes.length === 0 && (
          <div className="recipes-empty">
            <BookOpen size={36} />
            <h3>No se encontraron recetas</h3>
            <p>Intentá buscar con otro nombre.</p>
          </div>
        )}
      </div>

      <div className="recipes-footer">
        Mostrando {filteredRecipes.length} de {recipes.length} recetas
      </div>

      <RecipeForm
        isOpen={isFormOpen}
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
        initialBranchId={branches[0] ? String(branches[0].id) : ''}
      />
    </section>
  )
}

export default RecipesPage
