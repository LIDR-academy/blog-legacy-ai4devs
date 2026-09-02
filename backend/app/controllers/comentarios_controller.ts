import { errors } from '@vinejs/vine'
import type { HttpContext } from '@adonisjs/core/http'
import { ComentarioService } from '#services/comentario_service'
import ComentarioTransformer from '#transformers/comentario_transformer'
import { crearComentarioValidator, editarComentarioValidator } from '#validators/comentario'

/**
 * Controlador fino: valida, delega en el servicio y traduce el resultado a HTTP.
 * Ni SQL ni reglas de negocio.
 *
 * Los cuatro formatos de error distintos del alta (400 {error}, 422 {message},
 * 400 {errores:[]} y 200 {ok:false}) son el contrato de HOY, fijado por los
 * tests de caracterización. Unificarlos es el bug de la fila 7 de la auditoría.
 */
export default class ComentariosController {
  constructor(private servicio = new ComentarioService()) {}

  async store({ params, request, response, serialize }: HttpContext) {
    let datos: Awaited<ReturnType<typeof crearComentarioValidator.validate>>
    try {
      datos = await crearComentarioValidator.validate(request.all())
    } catch (error) {
      return this.responderErrorDeAlta(error, response)
    }

    const resultado = await this.servicio.crear(params.slug, {
      autorNombre: datos.autor_nombre,
      autorEmail: datos.autor_email,
      cuerpo: datos.cuerpo,
      padreId: (datos.padre_id as number | null) ?? null,
    })

    if (resultado.tipo === 'post-no-encontrado') {
      return response.status(404).send({ error: 'Post no encontrado' })
    }

    return response.status(201).send(
      await serialize.withoutWrapping({
        comentario: ComentarioTransformer.transform(resultado.comentario),
      })
    )
  }

  async destroy({ params, request, response }: HttpContext) {
    const resultado = await this.servicio.borrar(params.id, {
      clave: request.header('x-clave-moderacion'),
      autorEmail: request.input('autor_email', ''),
    })

    if (resultado.tipo === 'no-encontrado') {
      return response.status(404).send({ error: 'Comentario no encontrado' })
    }
    if (resultado.tipo === 'prohibido') {
      return response.status(403).send({ error: 'No puedes borrar este comentario' })
    }

    return response.status(200).send({ borrado: true })
  }

  async update({ params, request, response, serialize }: HttpContext) {
    // El orden importa: hoy la autorización se comprueba ANTES que el cuerpo,
    // así que un comentario ajeno sin cuerpo responde 403 y no 400.
    const autorizacion = await this.servicio.autorizarEdicion(
      params.id,
      request.input('autor_email', '')
    )

    if (autorizacion.tipo === 'no-encontrado') {
      return response.status(404).send({ error: 'Comentario no encontrado' })
    }
    if (autorizacion.tipo === 'prohibido') {
      return response.status(403).send({ error: 'No puedes editar este comentario' })
    }

    let datos: Awaited<ReturnType<typeof editarComentarioValidator.validate>>
    try {
      datos = await editarComentarioValidator.validate(request.all())
    } catch (error) {
      if (error instanceof errors.E_VALIDATION_ERROR) {
        return response.status(400).send({ error: 'Falta el cuerpo' })
      }
      throw error
    }

    const comentario = await this.servicio.editarCuerpo(autorizacion.comentario, datos.cuerpo)

    return response.send(
      await serialize.withoutWrapping({ comentario: ComentarioTransformer.transform(comentario) })
    )
  }

  /**
   * Traduce el fallo del validador al formato que devuelve hoy cada rama, en el
   * mismo orden de precedencia que tenían los `if` de la ruta: nombre, presencia
   * del correo, forma del correo y longitud del cuerpo.
   */
  private responderErrorDeAlta(error: unknown, response: HttpContext['response']) {
    if (!(error instanceof errors.E_VALIDATION_ERROR)) {
      throw error
    }

    const mensajes = error.messages as Array<{ field: string; rule: string }>
    const de = (campo: string) => mensajes.filter((mensaje) => mensaje.field === campo)

    if (de('autor_nombre').length > 0) {
      return response.status(400).send({ error: 'El nombre es obligatorio' })
    }

    const correo = de('autor_email')
    if (correo.length > 0) {
      if (correo.every((mensaje) => mensaje.rule === 'regex')) {
        return response.status(400).send({ errores: ['email no válido'] })
      }
      return response.status(422).send({ message: 'Falta el email' })
    }

    if (de('cuerpo').length > 0) {
      return response.status(200).send({ ok: false, motivo: 'comentario demasiado corto' })
    }

    throw error
  }
}
