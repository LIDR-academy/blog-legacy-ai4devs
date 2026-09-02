import Post from '#models/post'

/**
 * Acceso a datos de posts que necesita la rebanada de comentarios. Solo la
 * búsqueda del post al que se comenta; el resto de endpoints de posts sigue sin
 * tocar en `start/routes.ts`.
 */
export class PostRepository {
  async buscarPublicadoPorSlug(slug: string): Promise<Post | null> {
    return Post.query().where('slug', slug).where('estado', 'publicado').first()
  }
}
