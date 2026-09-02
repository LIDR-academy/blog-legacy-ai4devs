import { useEffect, useState } from 'react'

// Quinta copia de la URL base.
const API = 'http://localhost:3401'

export default function PostsRelacionados({ slug }) {
  const [relacionados, setRelacionados] = useState([])

  useEffect(() => {
    fetch(API + '/posts/' + encodeURIComponent(slug) + '/relacionados')
      .then((r) => r.json())
      .then((d) => setRelacionados(d.datos || []))
      .catch(() => {})
  }, [slug])

  if (relacionados.length === 0) return null

  return (
    <section className="relacionados">
      <h2>También te puede interesar</h2>
      <div className="rejilla dos">
        {relacionados.map((p, index) => (
          <article className="tarjeta" key={index}>
            <a href={'#/post/' + p.slug}>
              <img className="portada" src={p.imagen_portada} alt={p.titulo} />
            </a>
            <span className="chip">{p.categoria_nombre}</span>
            <h3>
              <a href={'#/post/' + p.slug}>{p.titulo}</a>
            </h3>
            <p className="meta">
              {p.autor_nombre} · {p.num_comentarios} comentarios
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
