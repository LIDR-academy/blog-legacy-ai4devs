import { useEffect, useState } from 'react'

// Cuarta copia de la URL base.
const API = 'http://localhost:3401'

export default function Comentarios({ slug }) {
  const [comentarios, setComentarios] = useState([])
  // …y este hermano guarda OTRO recuento, que además incrementa al enviar.
  // El de la cabecera del artículo nunca se entera, así que los dos números
  // dejan de coincidir en cuanto alguien comenta.
  const [total, setTotal] = useState(0)
  const [nombre, setNombre] = useState('')
  const [email, setEmail] = useState('')
  const [cuerpo, setCuerpo] = useState('')
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    // Se vuelve a pedir el post entero solo para sacar los comentarios.
    fetch(API + '/posts/' + encodeURIComponent(slug))
      .then((r) => r.json())
      .then((d) => {
        setComentarios(d.comentarios || [])
        setTotal((d.comentarios || []).length)
      })
      .catch(() => {})
  }, [slug])

  function enviar(evento) {
    evento.preventDefault()
    fetch(API + '/posts/' + encodeURIComponent(slug) + '/comentarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor_nombre: nombre, autor_email: email, cuerpo: cuerpo }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.comentario) {
          setAviso('Gracias, tu comentario está pendiente de moderación.')
          setTotal(total + 1)
          setNombre('')
          setEmail('')
          setCuerpo('')
        } else {
          setAviso(d.error || d.message || d.motivo || 'No se ha podido enviar.')
        }
      })
      .catch(() => setAviso('No se ha podido enviar.'))
  }

  const raices = comentarios.filter((c) => !c.padre_id)

  return (
    <section className="comentarios">
      <h2>{total} comentarios</h2>

      {raices.map((c, index) => (
        <div className="comentario" key={index}>
          <p className="comentario-autor">
            {c.autor_nombre} <small>{String(c.creado_en).substring(0, 10)}</small>
          </p>
          <p>{c.cuerpo}</p>

          {comentarios
            .filter((r) => r.padre_id === c.id)
            .map((r, i) => (
              <div className="comentario respuesta" key={i}>
                <p className="comentario-autor">
                  {r.autor_nombre} <small>{String(r.creado_en).substring(0, 10)}</small>
                </p>
                <p>{r.cuerpo}</p>
              </div>
            ))}
        </div>
      ))}

      <form className="formulario" onSubmit={enviar}>
        <h3>Deja tu comentario</h3>
        <input placeholder="Tu nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <input placeholder="Tu correo" value={email} onChange={(e) => setEmail(e.target.value)} />
        <textarea
          placeholder="Tu comentario"
          rows="4"
          value={cuerpo}
          onChange={(e) => setCuerpo(e.target.value)}
        />
        <button type="submit">Enviar</button>
        {aviso && <p className="aviso">{aviso}</p>}
      </form>
    </section>
  )
}
