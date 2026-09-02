import { BaseTransformer } from '@adonisjs/core/transformers'
import type Comentario from '#models/comentario'

/**
 * DTO de salida de un comentario.
 *
 * Reproduce EXACTAMENTE la forma que hoy devuelve el `select *` de
 * `start/routes.ts`: claves en snake_case y `creado_en` como cadena
 * 'YYYY-MM-DD HH:MM:SS', no como ISO.
 *
 * Incluye `autor_email` a propósito. Que el correo salga en la respuesta es el
 * bug de la fila 1 de la auditoría: quitarlo cambia el contrato, así que es una
 * tarea aparte con su propio test, no parte de este refactor.
 */
export default class ComentarioTransformer extends BaseTransformer<Comentario> {
  toObject() {
    return {
      id: this.resource.id,
      post_id: this.resource.postId,
      autor_nombre: this.resource.autorNombre,
      autor_email: this.resource.autorEmail,
      cuerpo: this.resource.cuerpo,
      estado: this.resource.estado,
      creado_en: this.resource.creadoEn
        ? this.resource.creadoEn.toFormat('yyyy-MM-dd HH:mm:ss')
        : null,
      padre_id: this.resource.padreId,
    }
  }
}
