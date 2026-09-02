import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Posts. Aquí está casi toda la deuda del esquema:
 *
 *  - autor_nombre / autor_email / categoria_nombre son COPIAS de texto de lo que
 *    ya vive en `autores` y `categorias`. Se metieron "para no hacer joins" y hoy
 *    hay posts firmados con nombres que ya nadie usa.
 *  - etiquetas es una cadena separada por comas en vez de una tabla pivote.
 *  - slug no es unique, y no hay ningún índice en toda la tabla.
 *  - autor_id y categoria_id no tienen clave foránea.
 */
export default class extends BaseSchema {
  protected tableName = 'posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('titulo').notNullable()
      table.string('slug').notNullable()
      table.text('resumen').nullable()
      table.text('cuerpo').nullable()
      table.string('imagen_portada').nullable()
      table.string('estado').notNullable().defaultTo('borrador')
      table.dateTime('publicado_en').nullable()

      table.integer('autor_id').nullable()
      table.integer('categoria_id').nullable()

      // Denormalización a mano: el nombre y el correo del autor y el nombre de la
      // categoría, copiados dentro del post.
      table.string('autor_nombre').nullable()
      table.string('autor_email').nullable()
      table.string('categoria_nombre').nullable()

      // "diseño web, ui/ux, consejos" — la tabla pivote nunca se llegó a hacer.
      table.string('etiquetas').nullable()

      table.dateTime('created_at').nullable()
      table.dateTime('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
