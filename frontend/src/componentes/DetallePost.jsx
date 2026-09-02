import { useEffect, useState } from 'react'
import CajaAutor from './CajaAutor.jsx'
import Comentarios from './Comentarios.jsx'
import PostsRelacionados from './PostsRelacionados.jsx'

// Tercera copia de la URL base.
const API = 'http://localhost:3401'

/**
 * Convierte el Markdown del cuerpo a HTML con cuatro expresiones regulares.
 * Lo que ya venía en HTML dentro del cuerpo pasa tal cual, sin sanear.
 */
function aHtml(markdown) {
  const texto = String(markdown || '')
  return texto
    .replace(/^### (.*)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*)$/gm, '<h2>$1</h2>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="imagen-cuerpo" />')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^\*(.+)\*$/gm, '<p class="pie-imagen">$1</p>')
    .split('\n\n')
    .map((bloque) => (bloque.trim().indexOf('<') === 0 ? bloque : '<p>' + bloque + '</p>'))
    .join('\n')
}

export default function DetallePost({ slug }) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(true)
  // Este componente guarda su propio recuento de comentarios…
  const [numComentarios, setNumComentarios] = useState(0)

  useEffect(() => {
    setCargando(true)
    fetch(API + '/posts/' + encodeURIComponent(slug))
      .then((r) => r.json())
      .then((d) => {
        setDatos(d)
        setNumComentarios((d.comentarios || []).length)
        setCargando(false)
        window.scrollTo(0, 0)
      })
      .catch(() => setCargando(false))
  }, [slug])

  if (cargando) return <p className="cargando">Cargando artículo…</p>
  if (!datos || !datos.post) return <p className="cargando">No hemos encontrado ese artículo.</p>

  const post = datos.post
  const autor = datos.autor || {}

  return (
    <article className="articulo">
      <nav className="migas">
        <a href="#/">Portada</a> <span>/</span>{' '}
        <a href={'#/?categoria=' + encodeURIComponent(post.categoria_nombre)}>
          {post.categoria_nombre}
        </a>{' '}
        <span>/</span> <span>{post.titulo}</span>
      </nav>

      <span className="chip">{post.categoria_nombre}</span>
      <time className="fecha">{String(post.publicado_en).substring(0, 10)}</time>
      <h1 className="titulo-articulo">{post.titulo}</h1>

      <div className="firma">
        <img className="avatar" src={autor.avatar} alt={autor.nombre} />
        <div>
          <p className="nombre-autor">{post.autor_nombre}</p>
          <p className="rol-autor">{autor.rol}</p>
        </div>
        <span className="recuento-cabecera">{numComentarios} comentarios</span>
      </div>

      <div className="cuerpo-con-barra">
        <aside className="compartir">
          <span>Compartir</span>
          <a href="#" title="Compartir en X">
            X
          </a>
          <a href="#" title="Compartir en Facebook">
            f
          </a>
          <a href="#" title="Compartir en LinkedIn">
            in
          </a>
          <a href="#" title="Copiar enlace">
            🔗
          </a>
        </aside>

        {/* El cuerpo se inyecta como HTML sin pasar por ningún saneado. */}
        <div className="cuerpo" dangerouslySetInnerHTML={{ __html: aHtml(post.cuerpo) }} />
      </div>

      <div className="etiquetas-articulo">
        {(datos.etiquetas || []).map((e, index) => (
          <a className="etiqueta" key={index} href={'#/?etiqueta=' + encodeURIComponent(e.nombre)}>
            #{e.nombre}
          </a>
        ))}
      </div>

      <CajaAutor autor={autor} />

      <nav className="anterior-siguiente">
        {datos.anterior ? (
          <a className="anterior" href={'#/post/' + datos.anterior.slug}>
            ← {datos.anterior.titulo}
          </a>
        ) : (
          <span />
        )}
        {datos.siguiente ? (
          <a className="siguiente" href={'#/post/' + datos.siguiente.slug}>
            {datos.siguiente.titulo} →
          </a>
        ) : (
          <span />
        )}
      </nav>

      <PostsRelacionados slug={slug} />
      <Comentarios slug={slug} />
    </article>
  )
}
