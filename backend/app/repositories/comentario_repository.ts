import db from '@adonisjs/lucid/services/db'
import Comentario from '#models/comentario'

/**
 * Único sitio con acceso a datos de comentarios. Fuera de aquí no hay ni un
 * `db.rawQuery` ni un query builder que toque la tabla.
 */
export class ComentarioRepository {
  async buscarPorId(id: number | string): Promise<Comentario | null> {
    return Comentario.find(id)
  }

  async crear(datos: {
    postId: number
    autorNombre: string
    autorEmail: string
    cuerpo: string
    estado: string
    creadoEn: string
    padreId: number | null
  }): Promise<void> {
    // Se inserta con el query builder y no con `Comentario.create()` para que
    // `creado_en` se guarde con el mismo formato de cadena que usa el resto de
    // la tabla ('YYYY-MM-DD HH:MM:SS') y no con el ISO que produciría Lucid al
    // serializar un DateTime. Cambiar el formato cambiaría el contrato.
    await db.table('comentarios').insert({
      post_id: datos.postId,
      autor_nombre: datos.autorNombre,
      autor_email: datos.autorEmail,
      cuerpo: datos.cuerpo,
      estado: datos.estado,
      creado_en: datos.creadoEn,
      padre_id: datos.padreId,
    })
  }

  /**
   * Devuelve el último comentario de la tabla por id.
   *
   * Reproduce a propósito lo que hace hoy `routes.ts:329-331` después de
   * insertar: NO devuelve necesariamente el comentario recién creado, sino el
   * último de la tabla. Es el bug de la fila 10 de la auditoría y se corrige
   * en su propia tarea, no dentro de este refactor.
   */
  async ultimoInsertado(): Promise<Comentario | null> {
    return Comentario.query().orderBy('id', 'desc').first()
  }

  async borrar(id: number | string): Promise<void> {
    await Comentario.query().where('id', id).delete()
  }

  async actualizarCuerpo(id: number | string, cuerpo: string): Promise<void> {
    await Comentario.query().where('id', id).update({ cuerpo })
  }
}
