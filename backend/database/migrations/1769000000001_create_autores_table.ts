import { BaseSchema } from '@adonisjs/lucid/schema'

/**
 * Tabla de autores. Existe, sí — pero los posts guardan ADEMÁS una copia del
 * nombre y del correo del autor (ver la migración de posts), así que esta tabla
 * y esas columnas se contradicen en cuanto alguien cambia de nombre.
 */
export default class extends BaseSchema {
  protected tableName = 'autores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('nombre').notNullable()
      table.string('email').notNullable()
      table.string('rol').nullable()
      table.text('bio').nullable()
      table.string('avatar').nullable()
      // Las redes sociales van como JSON dentro de una columna de texto.
      table.text('redes').nullable()
      table.dateTime('created_at').nullable()
      table.dateTime('updated_at').nullable()
      // Sin índices. Ni en email, que es lo que más se busca.
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
