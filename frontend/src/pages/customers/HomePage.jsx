import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Flower2,
  Coffee,
  Utensils,
  Sparkles
} from 'lucide-react'

import '../../styles/HomePage.css'

const categories = [
  {
    name: 'Producto elaborado',
    type: 'PREPARED',
    description: 'Preparados al momento en nuestra cocina y barra con ingredientes frescos.',
    icon: Utensils,
    color: 'yellow'
  },
  {
    name: 'Empaquetado',
    type: 'PACKAGED',
    description: 'Bebidas y productos listos para llevar o acompañar tu pedido.',
    icon: Coffee,
    color: 'blue'
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
            src="https://i.pinimg.com/1200x/41/a8/d2/41a8d2472125e570cca6be8c040eac98.jpg"
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

        <div className="category-grid ">

          {categories.map((category) => {
            const CategoryIcon = category.icon

            return (
              <Link
                to={`/menu?type=${category.type}`}
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