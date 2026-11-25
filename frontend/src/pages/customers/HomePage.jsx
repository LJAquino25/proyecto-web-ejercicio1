import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight } from 'lucide-react'

import '../../styles/HomePage.css'

const images = {
  restaurant: 'https://i.pinimg.com/1200x/41/a8/d2/41a8d2472125e570cca6be8c040eac98.jpg',
  food: 'https://i.pinimg.com/736x/10/50/ad/1050ada55e841e00767cf44eb641086e.jpg',
  packaged: 'https://i.pinimg.com/736x/f0/45/c4/f045c4ec6acf887a6bca28465ea74508.jpg'
}

const categories = [
  {
    name: 'Elaborados',
    type: 'PREPARED',
    label: 'RECIÉN PREPARADOS',
    description: 'De nuestra cocina y barra, directamente a tu mesa.',
    image: images.food,
    color: 'yellow'
  },
  {
    name: 'Empaquetados',
    type: 'PACKAGED',
    label: 'LISTOS PARA DISFRUTAR',
    description: 'Bebidas y antojitos para acompañar tu pedido.',
    image: images.packaged,
    color: 'blue'
  }
]

function HomePage() {
  return (
    <main className="home-page">

      <section className="hero-section">

        <div className="hero-content">

          <span className="hero-label">
            ORÍGENES SV
          </span>

          <h1>
            ¡Qué rico<br />
            sabe<br />
            <span>lo nuestro!</span>
          </h1>

          <p>
            Platos típicos, postres y café.
            Un pedacito de El Salvador en cada bocado.
          </p>

          <span className="hero-small-text">
            HECHO AQUÍ, HECHO CON AMOR.
          </span>

        </div>

        <div className="hero-collage">

          <div className="hero-main-photo">

            <img
              src={images.restaurant}
              alt="Ambiente de restaurante salvadoreño"
            />
          </div>

          <div className="hero-stamp">
            <span>100%</span>
            SABOR LOCAL
          </div>

        </div>

      </section>

      <section className="categories-section">

        <div className="categories-heading">

          <h2>¿Qué se te antoja hoy?</h2>

          <p>
            Encontrá algo rico para cualquier momento del día.
          </p>

        </div>

        <div className="category-grid">

          {categories.map((category) => (

            <Link
              to={`/menu?type=${category.type}`}
              key={category.type}
              className={`category-card ${category.color}`}
            >

              <div className="category-image-wrapper">

                <img
                  src={category.image}
                  alt={category.name}
                  loading="lazy"
                />

                <span className="category-tag">
                  {category.label}
                </span>

              </div>

              <div className="category-content">

                <h3>{category.name}</h3>

                <p>{category.description}</p>

                <div className="category-action">

                  <span>Ver productos</span>

                  <span className="category-arrow">
                    <ArrowUpRight size={24} />
                  </span>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </section>

      <section className="home-closing">

        <div className="closing-checker" />

        <div className="closing-content">

          <span>DE NUESTRA TIERRA, PARA TU MESA</span>

          <h2>
            Los buenos momentos<br />
            empiezan con algo rico.
          </h2>

          <Link to="/menu" className="closing-button">
            Ver menú completo
            <ArrowRight size={20} />
          </Link>

        </div>

        <div className="closing-checker" />

      </section>

    </main>
  )
}

export default HomePage