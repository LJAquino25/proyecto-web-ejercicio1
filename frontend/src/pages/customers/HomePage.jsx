import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Flower2,
  Sparkles,
  Coffee,
  Utensils,
  CakeSlice,
  Heart
} from 'lucide-react'

import '../../styles/HomePage.css'

const categories = [
  {
    name: 'Café',
    description: 'Tenemos muchos tipos diferentes.',
    icon: Coffee,
    color: 'yellow'
  },
  {
    name: 'Comida típica',
    description: 'Con el sabor de nuestra tierra.',
    icon: Utensils,
    color: 'blue'
  },
  {
    name: 'Postres',
    description: 'No se q poner aquí.',
    icon: CakeSlice,
    color: 'pink'
  }
]

function HomePage() {
  return (
    <main className="home-page">

      <section className="hero-section">

        <Flower2 className="hero-flower" size={180} />
        <Sparkles className="hero-sparkles" size={65} />

        <div className="hero-content">

          <span className="hero-label">
            <Flower2 size={18} />
            RESTAURANTE SALVADOREÑO
          </span>

          <h1>
            ¡La mejor <br />
            comida<br />
            <span>salvadoreña!</span>
          </h1>

          <p>
            Contamos con variedad de platos típicos, postres y café de diferentes tipos.
          </p>

          <Link to="/menu" className="hero-button">
            Explorá el menú
            <ArrowRight size={22} />
          </Link>

        </div>

        <div className="hero-image-wrapper">

          <img
            className="hero-image"
            src="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&q=85"
            alt="Ambiente de cafetería"
          />

          <div className="hero-stamp">
            <Flower2 size={30} />
            <span>100%</span>
            SABOR LOCAL
          </div>

        </div>

      </section>

      <section className="decorative-banner">
        <Flower2 />
        <span>HECHO CON AMOR</span>
        <Sparkles />
        <span>SABOR DE CASA</span>
        <Flower2 />
        <span>ORGULLO SALVADOREÑO</span>
        <Sparkles />
      </section>

      <section className="categories-section">

        <span className="section-label">
          PARA TODOS LOS GUSTOS
        </span>

        <h2>¿Qué se te antoja hoy?</h2>

        <div className="category-grid">

          {categories.map((category) => {
            const CategoryIcon = category.icon

            return (
              <Link
                to="/menu"
                key={category.name}
                className={`category-card ${category.color}`}
              >
                <Sparkles className="category-decoration" />

                <CategoryIcon size={65} strokeWidth={1.5} />

                <h3>{category.name}</h3>
                <p>{category.description}</p>

                <span className="category-arrow">
                  <ArrowRight />
                </span>
              </Link>
            )
          })}

        </div>

      </section>

    </main>
  )
}

export default HomePage