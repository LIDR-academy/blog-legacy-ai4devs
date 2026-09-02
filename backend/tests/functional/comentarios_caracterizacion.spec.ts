import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * Tests de CARACTERIZACIÓN de la rebanada de comentarios.
 *
 * Fijan lo que el sistema hace HOY, con los bugs incluidos, para poder mover la
 * lógica de `start/routes.ts` a las capas sin cambiar el comportamiento. Si algo
 * de aquí se pone rojo durante el refactor, el refactor ha cambiado el contrato.
 *
 * Los comportamientos que sabemos que están mal y que se fijan a propósito van
 * marcados con «BUG FIJADO» y están anotados en docs/auditoria/comentarios.md.
 */

const CLAVE_MODERACION = 'dev-secret-cambiar'

function unPostPublicado(extra: Record<string, unknown> = {}) {
  return {
    id: 9001,
    titulo: 'Post de prueba',
    slug: 'post-de-prueba',
    resumen: 'Resumen de prueba',
    cuerpo: '## Cuerpo de prueba',
    imagen_portada: null,
    estado: 'publicado',
    publicado_en: '2026-01-01 10:00:00',
    autor_id: 1,
    categoria_id: 1,
    autor_nombre: 'Marta Ruiz Calvo',
    autor_email: 'marta.ruiz@corriente.es',
    categoria_nombre: 'Noticias',
    etiquetas: 'Artículos',
    created_at: '2026-01-01 10:00:00',
    updated_at: '2026-01-01 10:00:00',
    ...extra,
  }
}

function unComentario(extra: Record<string, unknown> = {}) {
  return {
    id: 9101,
    post_id: 9001,
    autor_nombre: 'Lucía Ferrer',
    autor_email: 'lucia.ferrer@ejemplo.es',
    cuerpo: 'Un comentario suficientemente largo.',
    estado: 'pendiente',
    creado_en: '2026-02-02 09:00:00',
    padre_id: null,
    ...extra,
  }
}

test.group('Caracterización · POST /posts/:slug/comentarios', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('crea el comentario y devuelve la fila entera con 201', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    respuesta.assertStatus(201)
    const comentario = respuesta.body().comentario

    assert.properties(comentario, [
      'id',
      'post_id',
      'autor_nombre',
      'autor_email',
      'cuerpo',
      'estado',
      'creado_en',
      'padre_id',
    ])
    assert.equal(comentario.post_id, 9001)
    assert.equal(comentario.autor_nombre, 'Lucía Ferrer')
    assert.equal(comentario.cuerpo, 'Un comentario suficientemente largo.')
    assert.equal(comentario.estado, 'pendiente')
    assert.isNull(comentario.padre_id)
    assert.isNumber(comentario.id)
    assert.isString(comentario.estado)
    // creado_en es volátil en valor pero no en forma: 'YYYY-MM-DD HH:MM:SS'.
    assert.match(comentario.creado_en, /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    // BUG FIJADO (auditoría, fila 1): el correo sale en la respuesta pública.
    assert.equal(comentario.autor_email, 'lucia.ferrer@ejemplo.es')
    // La respuesta no lleva nada más que el comentario.
    assert.deepEqual(Object.keys(respuesta.body()), ['comentario'])

    const guardado = await db.from('comentarios').where('id', comentario.id).first()
    assert.equal(guardado.estado, 'pendiente')
    assert.equal(guardado.post_id, 9001)
  })

  test('guarda el padre_id que le llegue sin validarlo', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Una respuesta suficientemente larga.',
      padre_id: 424242,
    })

    // Assert
    respuesta.assertStatus(201)
    // BUG FIJADO (auditoría, fila 14): padre_id inexistente entra tal cual.
    assert.equal(respuesta.body().comentario.padre_id, 424242)
  })

  test('devuelve 404 cuando el post no existe', async ({ client, assert }) => {
    // Arrange
    // (sin posts en la base)

    // Act
    const respuesta = await client.post('/posts/no-existe/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    respuesta.assertStatus(404)
    respuesta.assertBody({ error: 'Post no encontrado' })
    const nuevos = await db.from('comentarios').where('post_id', 9001).count('* as total').first()
    assert.equal(nuevos.total, 0)
  })

  test('devuelve 404 cuando el post está en borrador (frontera de la regla)', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado({ estado: 'borrador' }))

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    respuesta.assertStatus(404)
    respuesta.assertBody({ error: 'Post no encontrado' })
    const nuevos = await db.from('comentarios').where('post_id', 9001).count('* as total').first()
    assert.equal(nuevos.total, 0)
  })

  test('sin nombre devuelve 400 con la forma {error}', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    respuesta.assertStatus(400)
    respuesta.assertBody({ error: 'El nombre es obligatorio' })
    assert.notProperty(respuesta.body(), 'message')
    assert.notProperty(respuesta.body(), 'errores')
  })

  test('sin email devuelve 422 con la forma {message}', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    // BUG FIJADO (auditoría, fila 7): tercer formato de error del mismo endpoint.
    respuesta.assertStatus(422)
    respuesta.assertBody({ message: 'Falta el email' })
    assert.notProperty(respuesta.body(), 'error')
  })

  test('email sin arroba devuelve 400 con la forma {errores:[]}', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'esto-no-es-un-correo',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    // Assert
    // BUG FIJADO (auditoría, fila 7): la única validación del correo es buscar una '@'.
    respuesta.assertStatus(400)
    respuesta.assertBody({ errores: ['email no válido'] })
    assert.notProperty(respuesta.body(), 'error')
  })

  test('cuerpo demasiado corto devuelve 200 con {ok:false}', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'hola',
    })

    // Assert
    // BUG FIJADO (auditoría, fila 7): un fallo de validación que responde 200.
    respuesta.assertStatus(200)
    respuesta.assertBody({ ok: false, motivo: 'comentario demasiado corto' })
    assert.notProperty(respuesta.body(), 'comentario')
    const nuevos = await db.from('comentarios').where('post_id', 9001).count('* as total').first()
    assert.equal(nuevos.total, 0)
  })

  test('un cuerpo de exactamente 5 caracteres sí entra (frontera)', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'holaa',
    })

    // Assert
    respuesta.assertStatus(201)
    assert.equal(respuesta.body().comentario.cuerpo, 'holaa')
  })
})

test.group('Caracterización · DELETE /comentarios/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('la clave de moderación borra el comentario', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .delete('/comentarios/9101')
      .header('x-clave-moderacion', CLAVE_MODERACION)

    // Assert
    // BUG FIJADO (auditoría, fila 12): la clave está escrita en el código fuente.
    respuesta.assertStatus(200)
    respuesta.assertBody({ borrado: true })
    assert.isNull(await db.from('comentarios').where('id', 9101).first())
  })

  test('el correo del cuerpo borra el comentario, ignorando mayúsculas y espacios', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .delete('/comentarios/9101')
      .json({ autor_email: '  LUCIA.FERRER@EJEMPLO.ES  ' })

    // Assert
    // BUG FIJADO (auditoría, fila 5): el correo, que la API publica, autoriza el borrado.
    respuesta.assertStatus(200)
    respuesta.assertBody({ borrado: true })
    assert.isNull(await db.from('comentarios').where('id', 9101).first())
  })

  test('sin clave ni correo devuelve 403 y no borra', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client.delete('/comentarios/9101').json({})

    // Assert
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes borrar este comentario' })
    assert.isNotNull(await db.from('comentarios').where('id', 9101).first())
  })

  test('con el correo de otra persona devuelve 403 y no borra (frontera)', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .delete('/comentarios/9101')
      .json({ autor_email: 'otra.persona@ejemplo.es' })

    // Assert
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes borrar este comentario' })
    assert.isNotNull(await db.from('comentarios').where('id', 9101).first())
  })

  test('con una clave de moderación equivocada devuelve 403 (frontera)', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .delete('/comentarios/9101')
      .header('x-clave-moderacion', 'clave-equivocada')

    // Assert
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes borrar este comentario' })
    assert.isNotNull(await db.from('comentarios').where('id', 9101).first())
  })

  test('un comentario inexistente devuelve 404', async ({ client }) => {
    // Arrange
    // (sin comentarios en la base)

    // Act
    const respuesta = await client
      .delete('/comentarios/424242')
      .header('x-clave-moderacion', CLAVE_MODERACION)

    // Assert
    respuesta.assertStatus(404)
    respuesta.assertBody({ error: 'Comentario no encontrado' })
  })
})

test.group('Caracterización · PATCH /comentarios/:id', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('el autor edita su comentario pendiente y recibe la fila entera', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client.patch('/comentarios/9101').json({
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario corregido.',
    })

    // Assert
    respuesta.assertStatus(200)
    const comentario = respuesta.body().comentario

    assert.properties(comentario, [
      'id',
      'post_id',
      'autor_nombre',
      'autor_email',
      'cuerpo',
      'estado',
      'creado_en',
      'padre_id',
    ])
    assert.equal(comentario.id, 9101)
    assert.equal(comentario.post_id, 9001)
    assert.equal(comentario.autor_nombre, 'Lucía Ferrer')
    assert.equal(comentario.cuerpo, 'Un comentario corregido.')
    assert.equal(comentario.estado, 'pendiente')
    assert.equal(comentario.creado_en, '2026-02-02 09:00:00')
    assert.isNull(comentario.padre_id)
    // BUG FIJADO (auditoría, fila 1): el correo también sale por aquí.
    assert.equal(comentario.autor_email, 'lucia.ferrer@ejemplo.es')
    assert.deepEqual(Object.keys(respuesta.body()), ['comentario'])

    const guardado = await db.from('comentarios').where('id', 9101).first()
    assert.equal(guardado.cuerpo, 'Un comentario corregido.')
  })

  test('el correo con otra caja devuelve 403 (frontera: aquí la comparación es exacta)', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client.patch('/comentarios/9101').json({
      autor_email: 'LUCIA.FERRER@EJEMPLO.ES',
      cuerpo: 'Un comentario corregido.',
    })

    // Assert
    // BUG FIJADO (auditoría, fila 13): DELETE normaliza el correo y PATCH no.
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes editar este comentario' })
    const guardado = await db.from('comentarios').where('id', 9101).first()
    assert.equal(guardado.cuerpo, 'Un comentario suficientemente largo.')
  })

  test('la clave de moderación NO sirve para editar', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .patch('/comentarios/9101')
      .header('x-clave-moderacion', CLAVE_MODERACION)
      .json({ cuerpo: 'Un comentario corregido.' })

    // Assert
    // BUG FIJADO (auditoría, fila 13): la clave vale para borrar pero no para editar.
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes editar este comentario' })
    const guardado = await db.from('comentarios').where('id', 9101).first()
    assert.equal(guardado.cuerpo, 'Un comentario suficientemente largo.')
  })

  test('un comentario ya aprobado no se puede editar (frontera de la regla)', async ({
    client,
    assert,
  }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario({ estado: 'aprobado' }))

    // Act
    const respuesta = await client.patch('/comentarios/9101').json({
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario corregido.',
    })

    // Assert
    respuesta.assertStatus(403)
    respuesta.assertBody({ error: 'No puedes editar este comentario' })
    const guardado = await db.from('comentarios').where('id', 9101).first()
    assert.equal(guardado.cuerpo, 'Un comentario suficientemente largo.')
  })

  test('sin cuerpo devuelve 400 y no toca el comentario', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())
    await db.table('comentarios').insert(unComentario())

    // Act
    const respuesta = await client
      .patch('/comentarios/9101')
      .json({ autor_email: 'lucia.ferrer@ejemplo.es' })

    // Assert
    respuesta.assertStatus(400)
    respuesta.assertBody({ error: 'Falta el cuerpo' })
    assert.notProperty(respuesta.body(), 'comentario')
    const guardado = await db.from('comentarios').where('id', 9101).first()
    assert.equal(guardado.cuerpo, 'Un comentario suficientemente largo.')
  })

  test('un comentario inexistente devuelve 404', async ({ client }) => {
    // Arrange
    // (sin comentarios en la base)

    // Act
    const respuesta = await client.patch('/comentarios/424242').json({
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario corregido.',
    })

    // Assert
    respuesta.assertStatus(404)
    respuesta.assertBody({ error: 'Comentario no encontrado' })
  })
})
