import { useState } from 'react'
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

const RECIPES = [
  {
    id: 1,
    name: 'Pupusa revuelta',
    color: 'yellow',
    ingredients: [
      { id: 1, name: 'Harina de maíz', quantity: 100, unit: 'g' },
      { id: 2, name: 'Queso', quantity: 40, unit: 'g' },
      { id: 3, name: 'Frijoles', quantity: 30, unit: 'g' },
      { id: 4, name: 'Chicharrón', quantity: 30, unit: 'g' }
    ]
  },
  {
    id: 2,
    name: 'Café de olla',
    color: 'blue',
    ingredients: [
      { id: 1, name: 'Café molido', quantity: 15, unit: 'g' },
      { id: 2, name: 'Agua', quantity: 250, unit: 'ml' },
      { id: 3, name: 'Azúcar', quantity: 10, unit: 'g' }
    ]
  },
  {
    id: 3,
    name: 'Quesadilla',
    color: 'pink',
    ingredients: [
      { id: 1, name: 'Harina de arroz', quantity: 100, unit: 'g' },
      { id: 2, name: 'Queso', quantity: 50, unit: 'g' },
      { id: 3, name: 'Azúcar', quantity: 30, unit: 'g' }
    ]
  }
]

function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRecipes, setExpandedRecipes] = useState([1])

  const [isFormOpen, setIsFormOpen] = useState(false)

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

  const filteredRecipes = RECIPES.filter(recipe =>
    recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <p>
            Administrá los ingredientes de cada preparación.
          </p>
        </div>

        <button
  type="button"
  className="inventory-primary-button"
  onClick={toggleForm}
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
            <strong>{RECIPES.length}</strong>
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

      <div className="recipes-list">
        {filteredRecipes.map(recipe => {
          const isExpanded = expandedRecipes.includes(recipe.id)

          return (
            <article className="recipe-card" key={recipe.id}>
              <button
                type="button"
                className="recipe-card-header"
                onClick={() => toggleRecipe(recipe.id)}
                aria-expanded={isExpanded}
              >
                <span className={`recipe-icon ${recipe.color}`}>
                  <BookOpen size={26} />
                </span>

                <span className="recipe-card-title">
                  <strong>{recipe.name}</strong>
                  <small>
                    {recipe.ingredients.length} ingredientes
                  </small>
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
                        {recipe.ingredients.map(ingredient => (
                          <tr key={ingredient.id}>
                            <td>
                              <strong>{ingredient.name}</strong>
                            </td>
                            <td>{ingredient.quantity}</td>
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
                      disabled
                    >
                      <Pencil size={16} />
                      Editar receta
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}

        {filteredRecipes.length === 0 && (
          <div className="recipes-empty">
            <BookOpen size={36} />
            <h3>No se encontraron recetas</h3>
            <p>Intentá buscar con otro nombre.</p>
          </div>
        )}
      </div>

      <div className="recipes-footer">
        Mostrando {filteredRecipes.length} de {RECIPES.length} recetas
      </div>

       <RecipeForm
        isOpen={isFormOpen}
        toggle={toggleForm}
      />
    </section>
  )
}

export default RecipesPage