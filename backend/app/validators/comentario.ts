import vine from '@vinejs/vine'

/**
 * DTOs de entrada de la rebanada de comentarios.
 *
 * Reproducen la validación que hoy vive suelta en `start/routes.ts`, sin
 * cambiarla: el correo solo tiene que contener una '@', el cuerpo del alta pide
 * cinco caracteres y el de la edición solo pide no estar vacío. La traducción de
 * estos fallos a los cuatro formatos de error distintos que devuelve el endpoint
 * vive en el controlador, que es quien habla HTTP.
 *
 * `parse` imita el `String(...)` del código legacy: lo que llega falsy se deja
 * como está para que falle igual que antes.
 */
const comoTexto = (valor: unknown) => (valor ? String(valor) : valor)

export const crearComentarioValidator = vine.create({
  autor_nombre: vine.string().parse(comoTexto).minLength(1),
  autor_email: vine.string().parse(comoTexto).minLength(1).regex(/@/),
  cuerpo: vine.string().parse(comoTexto).minLength(5),
  // Sin validar a propósito: hoy entra tal cual. Anotado en la auditoría (fila 14).
  padre_id: vine.any().optional(),
})

export const editarComentarioValidator = vine.create({
  cuerpo: vine.string().parse(comoTexto).minLength(1),
})
