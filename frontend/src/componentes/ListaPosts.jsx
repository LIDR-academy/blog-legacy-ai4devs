import { useEffect, useState } from 'react'

// Otra vez la URL base, copiada a mano.
const API = 'http://localhost:3401'

export default function ListaPosts({ ruta }) {
  const [posts, setPosts] = useState([])
  const [total, setTotal] = useState(0)
  const [pagina, setPagina] = useState(1)
  const [cargando, setCargando] = useState(true)

  // El filtro de categoría se lee del hash a mano.
  const trozos = String(ruta || '').split('?')
  const consulta = trozos.length > 1 ? trozos[1] : ''
  const categoria = new URLSearchParams(consulta).get('categoria') || ''

  useEffect(() => {
    setCargando(true)
    // fetch directamente en el componente, sin capa de acceso a datos.
    fetch(API + '/posts?pagina=' + pagina + (categoria ? '&categoria=' + encodeURIComponent(categoria) : ''))
      .then((r) => r.json())
      .then((d) => {
        setPosts(d.datos || [])
        setTotal(d.total || 0)
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [pagina, categoria])

  useEffect(() => {
    setPagina(1)
  }, [categoria])

  if (cargando) return <p className="cargando">Cargando artículos…</p>

  const paginas = Math.ceil(total / 5)

  return (
    <section>
      <h1 className="titulo-seccion">{categoria ? categoria : 'Últimos artículos'}</h1>
      <p className="contador">{total} artículos publicados</p>

      <div className="rejilla">
        {posts.map((p, index) => (
          // key por índice: si cambia el orden o la página, React reusa el nodo equivocado.
          <article className="tarjeta" key={index}>
            <a href={'#/post/' + p.slug}>
              <img className="portada" src={p.imagen_portada} alt={p.titulo} />
            </a>
            <span className="chip">{p.categoria_nombre}</span>
            <h2>
              <a href={'#/post/' + p.slug}>{p.titulo}</a>
            </h2>
            <p className="resumen">{p.resumen}</p>
            <p className="meta">
              {p.autor_nombre} · {String(p.publicado_en).substring(0, 10)} ·{' '}
              {p.num_comentarios} comentarios
            </p>
          </article>
        ))}
      </div>

      {paginas > 1 && (
        <div className="paginacion">
          {Array.from({ length: paginas }).map((_, index) => (
            <button
              key={index}
              className={pagina === index + 1 ? 'activa' : ''}
              onClick={() => setPagina(index + 1)}
            >
              {index + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
