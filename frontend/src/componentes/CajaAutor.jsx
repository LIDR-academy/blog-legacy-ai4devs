export default function CajaAutor({ autor }) {
  if (!autor || !autor.nombre) return null
  const redes = autor.redes || {}
  const enlaces = [
    ['YouTube', redes.youtube],
    ['Facebook', redes.facebook],
    ['Instagram', redes.instagram],
    ['X', redes.x],
    ['LinkedIn', redes.linkedin],
  ].filter((par) => par[1])

  return (
    <aside className="caja-autor">
      <img className="avatar grande" src={autor.avatar} alt={autor.nombre} />
      <div>
        <p className="nombre-autor">{autor.nombre}</p>
        <p className="rol-autor">{autor.rol}</p>
        <p className="bio">{autor.bio}</p>
        <p className="redes">
          {enlaces.map((par, index) => (
            <a key={index} href={par[1]} target="_blank" rel="noreferrer">
              {par[0]}
            </a>
          ))}
        </p>
      </div>
    </aside>
  )
}
