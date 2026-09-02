import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Categorías. El nombre está duplicado dentro de cada post (posts.categoria_nombre),
 * así que renombrar una categoría aquí no arregla los posts ya publicados.
 */
export default class extends BaseSchema {
  protected tableName = 'categorias'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nombre').notNullable()
      table.string('slug').notNullable()
      table.dateTime('created_at').nullable()
      table.dateTime('updated_at').nullable()
      // Sin unique en slug y sin índice.
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
