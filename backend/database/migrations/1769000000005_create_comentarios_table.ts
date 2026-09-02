import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Comentarios. `estado` es texto libre: nunca se puso un CHECK ni un enum, y por
 * el camino se colaron 'Aprobado' con mayúscula y 'ok' desde un script de
 * migración antiguo. post_id no tiene índice ni clave foránea.
 */
export default class extends BaseSchema {
  protected tableName = 'comentarios'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('post_id').notNullable()
      table.string('autor_nombre').notNullable()
      table.string('autor_email').notNullable()
      table.text('cuerpo').notNullable()
      table.string('estado').notNullable().defaultTo('pendiente')
      table.dateTime('creado_en').nullable()
      table.integer('padre_id').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
