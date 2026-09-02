import { useEffect, useState } from 'react'

// Sexta copia de la URL base.
const API = 'http://localhost:3401'

export default function BarraLateral() {
  const [categorias, setCategorias] = useState([])
  const [etiquetas, setEtiquetas] = useState([])
  const [recientes, setRecientes] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState(null)

  useEffect(() => {
    fetch(API + '/categorias')
      .then((r) => r.json())
      .then((d) => setCategorias(d.datos || []))
      .catch(() => {})
    fetch(API + '/etiquetas')
      .then((r) => r.json())
      .then((d) => setEtiquetas(d.datos || []))
      .catch(() => {})
    fetch(API + '/posts/recientes')
      .then((r) => r.json())
      .then((d) => setRecientes(d.datos || []))
      .catch(() => {})
  }, [])

  function buscar(evento) {
    evento.preventDefault()
    fetch(API + '/posts?q=' + encodeURIComponent(busqueda))
      .then((r) => r.json())
      .then((d) => setResultados(d.datos || []))
      .catch(() => setResultados([]))
  }

  return (
    <aside className="lateral">
      <section className="bloque">
        <h3>Buscar</h3>
        <form onSubmit={buscar}>
          <input
            placeholder="¿Qué buscas?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <button type="submit">Buscar</button>
        </form>
        {resultados && (
          <ul className="resultados">
            {resultados.length === 0 && <li>Sin resultados</li>}
            {resultados.map((p, index) => (
              <li key={index}>
                <a href={'#/post/' + p.slug}>{p.titulo}</a>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="bloque">
        <h3>Categorías</h3>
        <ul className="lista-categorias">
          {categorias.map((c, index) => (
            <li key={index}>
              <a href={'#/?categoria=' + encodeURIComponent(c.nombre)}>{c.nombre}</a>
              <span>{c.num_posts}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque">
        <h3>Posts recientes</h3>
        <ul className="lista-recientes">
          {recientes.map((p, index) => (
            <li key={index}>
              <img src={p.imagen_portada} alt={p.titulo} />
              <a href={'#/post/' + p.slug}>{p.titulo}</a>
            </li>
          ))}
        </ul>
      </section>

      <section className="bloque">
        <h3>Etiquetas</h3>
        <div className="nube">
          {etiquetas.map((e, index) => (
            <a className="etiqueta" key={index} href={'#/?etiqueta=' + encodeURIComponent(e.nombre)}>
              {e.nombre} ({e.num_posts})
            </a>
          ))}
        </div>
      </section>

      <section className="bloque">
        <h3>Galería</h3>
        <div className="galeria">
          {recientes.map((p, index) => (
            <a key={index} href={'#/post/' + p.slug}>
              <img src={p.imagen_portada} alt={p.titulo} />
            </a>
          ))}
        </div>
      </section>
    </aside>
  )
}
