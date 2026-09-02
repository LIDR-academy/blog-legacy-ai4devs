import type Comentario from '#models/comentario'
import { PostRepository } from '#repositories/post_repository'
import { ComentarioRepository } from '#repositories/comentario_repository'

/**
 * Clave con la que se validan las acciones de moderación.
 *
 * Venía de `start/routes.ts:25`. Sigue escrita en el código a propósito: sacarla
 * al entorno es el bug de la fila 12 de la auditoría y cambia el despliegue, así
 * que va en su propia tarea.
 */
const SECRETO_SESION = 'dev-secret-cambiar'

export type ResultadoCreacion =
  { tipo: 'post-no-encontrado' } | { tipo: 'creado'; comentario: Comentario }

export type ResultadoBorrado =
  { tipo: 'no-encontrado' } | { tipo: 'prohibido' } | { tipo: 'borrado' }

export type ResultadoAutorizacion =
  { tipo: 'no-encontrado' } | { tipo: 'prohibido' } | { tipo: 'autorizado'; comentario: Comentario }

/**
 * Toda la regla de negocio de comentarios. Es el único sitio que muta estado.
 */
export class ComentarioService {
  constructor(
    private comentarios = new ComentarioRepository(),
    private posts = new PostRepository()
  ) {}

  /**
   * Solo se comenta en un post publicado: un borrador responde igual que un
   * post inexistente.
   */
  async crear(
    slug: string,
    datos: { autorNombre: string; autorEmail: string; cuerpo: string; padreId: number | null }
  ): Promise<ResultadoCreacion> {
    const post = await this.posts.buscarPublicadoPorSlug(slug)
    if (!post) {
      return { tipo: 'post-no-encontrado' }
    }

    await this.comentarios.crear({
      postId: post.id,
      autorNombre: datos.autorNombre,
      autorEmail: datos.autorEmail,
      cuerpo: datos.cuerpo,
      estado: 'pendiente',
      creadoEn: this.ahora(),
      padreId: datos.padreId,
    })

    // Ver ComentarioRepository.ultimoInsertado: se conserva el bug de la fila 10.
    const comentario = await this.comentarios.ultimoInsertado()
    return { tipo: 'creado', comentario: comentario! }
  }

  /**
   * Borra quien escribió el comentario —comparando el correo sin distinguir
   * mayúsculas ni espacios— o quien traiga la clave de moderación.
   */
  async borrar(
    id: string,
    credenciales: { clave?: string; autorEmail: string }
  ): Promise<ResultadoBorrado> {
    const comentario = await this.comentarios.buscarPorId(id)
    if (!comentario) {
      return { tipo: 'no-encontrado' }
    }

    const esModerador = credenciales.clave === SECRETO_SESION
    const esAutor =
      String(comentario.autorEmail).toLowerCase().trim() ===
      String(credenciales.autorEmail).toLowerCase().trim()

    if (!esModerador && !esAutor) {
      return { tipo: 'prohibido' }
    }

    await this.comentarios.borrar(id)
    return { tipo: 'borrado' }
  }

  /**
   * Autoriza la edición. La regla es distinta de la del borrado a propósito: no
   * admite la clave de moderación, compara el correo tal cual y exige que el
   * comentario siga pendiente. Es el bug de la fila 13 de la auditoría.
   */
  async autorizarEdicion(id: string, autorEmail: string): Promise<ResultadoAutorizacion> {
    const comentario = await this.comentarios.buscarPorId(id)
    if (!comentario) {
      return { tipo: 'no-encontrado' }
    }

    if (comentario.autorEmail !== autorEmail || comentario.estado !== 'pendiente') {
      return { tipo: 'prohibido' }
    }

    return { tipo: 'autorizado', comentario }
  }

  async editarCuerpo(comentario: Comentario, cuerpo: string): Promise<Comentario> {
    await this.comentarios.actualizarCuerpo(comentario.id, cuerpo)
    return (await this.comentarios.buscarPorId(comentario.id))!
  }

  /**
   * Misma marca de tiempo que producía `start/routes.ts:323`: UTC, sin zona y
   * con el formato que usa el resto de la tabla.
   */
  private ahora(): string {
    return new Date().toISOString().slice(0, 19).replace('T', ' ')
  }
}
