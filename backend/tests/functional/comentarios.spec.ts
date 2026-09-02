import { test } from '@japa/runner'
import db from '@adonisjs/lucid/services/db'
import testUtils from '@adonisjs/core/services/test_utils'

/**
 * La única prueba que tiene el proyecto.
 *
 * Cubre el camino feliz de dejar un comentario y nada más: ni el email inválido,
 * ni el cuerpo corto, ni el post inexistente, ni ninguno de los ocho endpoints
 * de lectura. Es el punto de partida de la sesión, no un ejemplo a imitar.
 */
test.group('Comentarios', (group) => {
  group.each.setup(() => testUtils.db().withGlobalTransaction())

  test('deja un comentario en un post publicado', async ({ client, assert }) => {
    await db.table('posts').insert({
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
    })

    const respuesta = await client.post('/posts/post-de-prueba/comentarios').json({
      autor_nombre: 'Lucía Ferrer',
      autor_email: 'lucia.ferrer@ejemplo.es',
      cuerpo: 'Un comentario suficientemente largo.',
    })

    respuesta.assertStatus(201)
    assert.equal(respuesta.body().comentario.autor_nombre, 'Lucía Ferrer')
  })
})
