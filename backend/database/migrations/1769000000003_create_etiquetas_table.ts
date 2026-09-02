import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Etiquetas. OJO: no hay tabla pivote post_etiqueta. La relación N:M se resolvió
 * metiendo los nombres separados por comas en posts.etiquetas, así que esta tabla
 * solo sirve para pintar la nube de etiquetas.
 */
export default class extends BaseSchema {
  protected tableName = 'etiquetas'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nombre').notNullable()
      table.string('slug').notNullable()
      table.dateTime('created_at').nullable()
      table.dateTime('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
