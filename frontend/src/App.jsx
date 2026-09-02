import { useEffect, useState } from 'react'
import ListaPosts from './componentes/ListaPosts.jsx'
import DetallePost from './componentes/DetallePost.jsx'
import BarraLateral from './componentes/BarraLateral.jsx'

// La URL de la API, repetida en este archivo y en todos los componentes.
const API = 'http://localhost:3401'

export default function App() {
  const [ruta, setRuta] = useState(window.location.hash)
  const [salud, setSalud] = useState(null)

  useEffect(() => {
    const alCambiar = () => setRuta(window.location.hash)
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  useEffect(() => {
    fetch(API + '/')
      .then((r) => r.json())
      .then((d) => setSalud(d.estado))
      .catch(() => setSalud('caído'))
  }, [])

  const slug = ruta.indexOf('#/post/') === 0 ? ruta.substring(7) : null

  return (
    <div className="envoltorio">
      <header className="cabecera">
        <a className="marca" href="#/">
          Corriente
        </a>
        <nav className="menu">
          <a href="#/">Portada</a>
          <a href="#/?categoria=Tendencias">Tendencias</a>
          <a href="#/?categoria=Inspiración">Inspiración</a>
          <a href="#/?categoria=Consejos">Consejos</a>
        </nav>
        <span className={'salud ' + (salud === 'ok' ? 'viva' : 'muerta')}>api: {salud || '…'}</span>
      </header>

      <main className="columnas">
        <div className="principal">
          {slug ? <DetallePost slug={decodeURIComponent(slug)} /> : <ListaPosts ruta={ruta} />}
        </div>
        <BarraLateral />
      </main>

      <footer className="pie">
        <p>Corriente — revista de diseño. Material didáctico del curso Lidr AI4Devs.</p>
      </footer>
    </div>
  )
}
