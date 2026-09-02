# Auditoría de la rebanada de COMENTARIOS

Alcance: todo lo que toca comentarios en la capa de rutas, en el esquema y en el frontend.
Estado: solo diagnóstico. Nada de esta lista está arreglado.

## Cómo está ordenada esta tabla

**No** está ordenada por criticidad. Se descarta ese orden. Se ordena con dos claves, en este orden:

1. **Precedencia**, como orden topológico y no como juicio: si el arreglo de A abarata el de B,
   A va antes que B. Las aristas salen de la casilla de precedencia de cada hallazgo, no de una
   opinión nueva.
2. **Daño dividido por radio**, dentro de cada nivel de precedencia. Daño alto con radio pequeño
   sube; daño alto con radio enorme, no. No es daño a secas.

Niveles de precedencia resultantes: **L0** filas 1-2 · **L1** filas 3-4 · **L2** filas 5-9 ·
**L3** filas 10-17 · **L4** fila 18.

Dos notas sobre el grafo:

- El hallazgo de la fuga de correo se parte en dos filas, **contención** (fila 1) y **arreglo**
  (fila 9), que caen en niveles distintos a propósito: la contención no depende de nada y el DTO
  espera al modelo normalizado para no escribirse dos veces.
- La contención va **antes** que la normalización de estados. Comprobado con `make fuga`: hoy
  salen dos correos de comentaristas porque `routes.ts:153` esconde los estados `'Aprobado'` y
  `'ok'`; al normalizarlos serán cuatro. Normalizar primero amplía la fuga.

**Las casillas en blanco son deliberadas**: marcan lo que no se puede responder abriendo este
repositorio. No se rellenan por aproximación. La razón que más se repite: la base de datos real
no está versionada (`backend/.gitignore:4` ignora `tmp/*`), así que ninguna pregunta sobre
cuántas filas hay hoy afectadas tiene respuesta aquí.

## Tabla priorizada

| # | Qué es | Dónde está (línea que lo demuestra) | Qué se rompe y quién lo nota | Cuántos sitios hay que tocar | ¿Lo deshace un revert? | Bloquea / desbloquea |
|---|---|---|---|---|---|---|
| 1 | **Contención de la fuga: el correo deja de salir en la respuesta** | `backend/start/routes.ts:171` devuelve las filas crudas de `comentarios`; `make fuga` lo imprime | Se publica el correo de cada persona que comenta. Lo ve cualquiera que abra la respuesta; en el front llega a `Comentarios.jsx:22` y `DetallePost.jsx:38`, que lo reciben aunque no lo pinten | **3**: `routes.ts:171` (detalle), `:333` (respuesta del POST), `:392` (respuesta del PATCH) | Sí, revert limpio. Ningún dato guardado cambia: el correo sigue en la tabla, que es donde debe estar | Desbloquea la fila 5 (retira la credencial pública). Debe ir **antes** que las filas 3 y 8: normalizar estados sin contener antes amplía la fuga de 2 correos a 4 |
| 2 | **La rebanada solo tiene test del camino feliz** | `backend/tests/functional/comentarios.spec.ts:15-43`; el umbral que bloquea está en 0 (`.claude/hooks/guard-tests.mjs:32`) | Nada avisa si se rompe la autorización o el contrato. Lo nota quien revise el cambio, y tarde: la suite verde no dice nada | **4**: `tests/functional/comentarios.spec.ts:15-43`; endpoints sin cubrir `routes.ts:295` (POST), `:339` (DELETE), `:366` (PATCH) | Sí, revert limpio: solo añade archivos | Desbloquea con red las filas 4, 5, 7, 8, 10 y 13. Sin caracterización previa, `CLAUDE.md` prohíbe tocar ninguna |
| 3 | **`estado` es texto libre, sin CHECK ni enum** | `database/migrations/1769000000005_create_comentarios_table.ts:18`; los datos ilegales ya existen en `blog_seeder.ts:510` (`'Aprobado'`) y `:522` (`'ok'`) | Permite estados que ninguna consulta reconoce: dos comentarios aprobados del post 1 no se ven jamás. Lo notan sus autores y el lector del post | **7**: migración `:18`; `routes.ts:326` (literal al insertar), `:153`, `:75-76`, `:223` (las tres comparaciones); `blog_seeder.ts:510`, `:522` | **No.** El CHECK obliga a reescribir las filas ilegales antes de aplicarse, y esa reescritura sobrevive al revert; el `down()` solo hace `dropTable` (migración `:24-26`). *Cuántas filas reales: en blanco* | Desbloquea las filas 8, 9 y 18. Bloquea la fila 6 si va después: el endpoint de moderación fijaría un valor cuya forma aún no está decidida |
| 4 | **Toda la rebanada vive dentro de la ruta** | `backend/start/routes.ts:295-393`; lo demuestra la autorización escrita dos veces, `:351-353` y `:379` | No hay dónde arreglar una regla una sola vez. Lo nota quien mantiene: el filtro de estado está escrito tres veces (`:75-76`, `:153`, `:223`) | **1 bloque + 6**: `routes.ts:295-393`; `backend/package.json` → `imports`, que hoy no declara `#repositories/*`; controlador, validador, servicio, repositorio y transformer por crear | Sí, revert limpio mientras no se acompañe de migración; si arrastra la fila 3, deja de serlo por ella | Desbloquea las filas 5, 7, 8, 9 y 13. Encarece todo si va antes que la fila 2 (reestructurar sin caracterización) |
| 5 | **Cualquiera puede borrar cualquier comentario** | `backend/start/routes.ts:350-357`: la autorización acepta el `autor_email` del cuerpo, que el detalle publica | Se pierde un comentario ajeno de forma definitiva. Lo nota quien lo escribió, y nadie más: el borrado es físico (`:359`), sin columna de borrado lógico (migración `:11-21`) ni auditoría (`app/exceptions/handler.ts:25-27`) | **4**: `routes.ts:350`, `:351-353`, `:355-357`; `tests/functional/comentarios.spec.ts:12-43` | El arreglo es solo código: revert limpio. Los borrados ya ejecutados no se deshacen (DELETE físico, sin copia). *Cuántos ha habido: en blanco* | Desbloquea la fila 13 (una regla sirve para DELETE y PATCH) y vacía la fila 12. Se abarata tras la fila 1 |
| 6 | **No existe ningún endpoint para aprobar un comentario** | `backend/start/routes.ts:295-393`: hay POST, DELETE y PATCH, y ninguna transición de estado | Ningún comentario enviado por el formulario llega a verse nunca. Lo nota quien comenta —`Comentarios.jsx:38` le promete una moderación que no existe— y la redacción, que no tiene por dónde aprobar | **2 + capas nuevas**: `routes.ts:393` (la ruta), `backend/package.json` → `imports` (sin `#repositories/*`); controlador, validador, servicio, repositorio, transformer y test por crear. En el front no hay superficie que tocar: `App.jsx:26` y `:45` solo enrutan portada y detalle | El código revierte limpio; las aprobaciones ya ejecutadas quedan escritas en `comentarios.estado` y no se deshacen solas | Depende de la fila 3. No desbloquea a nadie |
| 7 | **Cuatro contratos de error distintos en un solo endpoint** | `backend/start/routes.ts:319-321`: cuerpo corto responde `200 {ok:false}` | El cliente no puede distinguir fallo de éxito. Lo nota quien envía un comentario corto: recibe 200 y el front rebusca entre tres campos para el aviso (`Comentarios.jsx:43-45`) | **6**: `routes.ts:310-312`, `:313-315`, `:316-318`, `:319-321`; `Comentarios.jsx:44` (único consumidor del repo); `app/exceptions/handler.ts:15-17` | Sí, revert limpio; no toca datos. *Si algún cliente fuera de este repositorio depende de las cuatro formas: en blanco* | Desbloquea las filas 14 y 11: el validador VineJS que obliga a crear es el mismo |
| 8 | **Conviven dos definiciones de «comentario visible»** | `backend/start/routes.ts:153` (`estado = 'aprobado'`) frente a `:75-76` y `:223` (`estado <> 'pendiente'`) | Los recuentos no coinciden con la lista. Lo nota el lector en portada (`ListaPosts.jsx:57`), en relacionados (`PostsRelacionados.jsx:32`) y en la cabecera (`DetallePost.jsx:71`); incumple la regla 5 de `CLAUDE.md` | **3 + 4 pantallas**: `routes.ts:75-76`, `:153`, `:223`; cambian de número sin tocarse `ListaPosts.jsx:57`, `PostsRelacionados.jsx:32`, `DetallePost.jsx:71`, `Comentarios.jsx:54` | Según la rama: unificar solo la consulta, revert limpio; normalizar además los valores, migración de datos que el revert no deshace (`down()` en migración `:24-26`). *Cuántas filas normalizar: en blanco* | Exige la fila 3 antes. Desbloquea las filas 17 y 18 |
| 9 | **Arreglo de la fuga: el DTO decide qué campos salen** | `backend/start/routes.ts:152-155`: el `select *` es lo que arrastra `autor_email`, `estado`, `post_id` y `padre_id` al cliente | Residual una vez aplicada la fila 1: sin DTO, cualquier consulta nueva vuelve a arrastrar campos internos. Lo nota quien añada un endpoint | **5**: `routes.ts:152-155`, `:329-331`, `:389-392`; consumidores `Comentarios.jsx:22`, `DetallePost.jsx:38` | Sí, revert limpio; ningún dato guardado cambia | Espera a las filas 3 y 4 para no escribirse dos veces. Desbloquea las filas 10 y 15; encarece la 15 si el transformer no conserva `id` |
| 10 | **El `POST` devuelve «el último comentario de la tabla»** | `backend/start/routes.ts:329-331`: `order by id desc limit 1` sin transacción | Con dos envíos simultáneos devuelve el comentario de otra persona con su correo. Hoy no lo nota nadie en esta UI (`Comentarios.jsx:37` solo comprueba que exista y nunca lo pinta); lo notaría cualquier otro cliente | **2**: `routes.ts:329-331`; `tests/functional/comentarios.spec.ts:41-42`, que afirma sobre ese cuerpo | Sí, revert limpio. El `insert` de `:324-327` ya es correcto: no hay dato mal guardado que arrastrar | Se resuelve en el mismo retorno que la fila 9 |
| 11 | **Sin límite de tamaño ni de frecuencia en el comentario** | `backend/start/routes.ts:319`: única comprobación, y solo del mínimo | Un cuerpo enorme o un envío en bucle entra sin resistencia en un endpoint público y sin autenticación (`routes.ts:295` no lleva `middleware.auth()`). Lo nota quien modere, y el lector del post | Tamaño, **2**: `routes.ts:319`, migración `:17` (`text`, sin límite). Frecuencia: *en blanco* — no hay limitador (`backend/package.json` sin `@adonisjs/limiter`) ni throttling registrado (`start/kernel.ts:25`, `:35`) | Sí, revert limpio para el límite de tamaño; los cuerpos ya guardados por encima del nuevo límite se quedan como están | Comparte validador con las filas 7 y 14 |
| 12 | **Clave de moderación escrita en el código y commiteada** | `backend/start/routes.ts:25` (`'dev-secret-cambiar'`), usada en `:351` | Quien lea el repositorio modera. No lo nota nadie: no hay registro de quién borra (`handler.ts:25-27`, y ninguna migración crea auditoría) | **4**: `routes.ts:25`, `:351`; `backend/start/env.ts:22` (esquema de entorno donde habría que declararla); `backend/.env.example:9` | El código revierte limpio, pero el valor ya está en la historia de git (`e0e0943`, vía `git log -S`). Quitarlo de HEAD no lo retira: hay que rotarlo, y hoy no existe variable de entorno donde ponerlo | Desaparece si antes se hace la fila 5. Arreglado aislado, encarece la fila 5 |
| 13 | **El mismo recurso tiene dos reglas de autorización distintas** | `backend/start/routes.ts:379` (PATCH, comparación exacta y sin clave) frente a `:351-353` (DELETE) | La misma persona puede borrar un comentario que no puede editar. No lo nota nadie desde este front: la única llamada no-GET es el POST (`Comentarios.jsx:31`); lo notaría otro cliente | **2**: `routes.ts:349-357`, `:378-381` | Sí, revert limpio; código puro, no toca datos | Casi gratis después de la fila 5, que crea la regla unificada. Al revés, obliga a escribirla dos veces |
| 14 | **`padre_id` se inserta sin validar** | `backend/start/routes.ts:326`: entra tal cual del cuerpo, leído en `:308` | Se guardan jerarquías imposibles (padre de otro post, inexistente, o `'1'` como cadena). Lo nota el lector como respuestas que no aparecen: `Comentarios.jsx:64` compara con `===` | **4**: `routes.ts:308`, `:326`; `Comentarios.jsx:50`, `:64` | El código revierte limpio; las filas ya guardadas con `padre_id` inválido no las arregla un revert. En la semilla no hay ninguna (`blog_seeder.ts:501` apunta al comentario 1, del mismo post). *Cuántas hay en la base real: en blanco* | Desbloquea la fila 18; comparte validador con las filas 7 y 11 |
| 15 | **Listas de comentarios con `key={index}`** | `frontend/src/componentes/Comentarios.jsx:57` y `:66` | Hoy no rompe nada observable: las listas no se reordenan ni se inserta el comentario recién enviado (`Comentarios.jsx:39` solo incrementa un número). Rompería en cuanto se añada ese comentario a la lista | **2**: `Comentarios.jsx:57`, `:66` | Sí, revert limpio | Depende de la fila 9: si el transformer conserva `id`, es una línea; si no, se queda sin clave estable |
| 16 | **`Comentarios.jsx` vuelve a pedir el post entero** | `frontend/src/componentes/Comentarios.jsx:19`, cuando `DetallePost.jsx:34` ya lo ha pedido | Cada detalle pide dos veces la misma respuesta completa. Lo nota el lector como una segunda espera y el servidor como el doble de trabajo | **3**: `Comentarios.jsx:17-26`, `DetallePost.jsx:32-43`, `DetallePost.jsx:123` | Sí, revert limpio | Es el mismo cambio que la fila 17: hacerlos por separado significa reescribir dos veces el mismo componente |
| 17 | **Dos recuentos de comentarios duplicados en el front** | `frontend/src/componentes/DetallePost.jsx:71` y `frontend/src/componentes/Comentarios.jsx:54` muestran cifras distintas | Dos cifras distintas en la misma pantalla. Lo nota cualquiera que comente: el número de la sección sube y el de la cabecera no | **8 líneas en 2 archivos**: `DetallePost.jsx:30`, `:38`, `:71`, `:123`; `Comentarios.jsx:11`, `:23`, `:39`, `:54` | Sí, revert limpio; front puro, sin datos | Mismo cambio que la fila 16. Que además coincida con la cifra de portada exige la fila 8 |
| 18 | **Las respuestas cuyo padre no está aprobado desaparecen** | `frontend/src/componentes/Comentarios.jsx:50` deja fuera todo lo que tiene `padre_id`, y `routes.ts:153` no envía al padre | Un comentario aprobado no se muestra en ningún sitio, ni suelto ni anidado. Lo nota quien lo escribió y quien esperaba la respuesta | **3**: `Comentarios.jsx:50`, `:63-64`; `routes.ts:153` | Sí, revert limpio si se arregla en el front; no toca datos | Se abarata tras las filas 3 y 8. Aun así queda el caso del padre `'pendiente'`, que la fila 8 no cubre |

## Fuera de la tabla: propuesta sin medir

### `post_id` sin clave foránea ni índice

`backend/database/migrations/1769000000005_create_comentarios_table.ts:14` (la columna) y `:11-21`
(no se declara ningún índice).

Sale de la tabla porque su daño declarado es una afirmación de rendimiento que nadie ha medido
—«escaneo completo por cada recuento», con el N+1 de `routes.ts:222-225`, una consulta por
relacionado dentro del bucle— y porque es el único hallazgo cuya casilla de precedencia quedó en
blanco: no abarata ni encarece ningún otro, así que no participa en el orden topológico.

**Qué hay que medir para que vuelva a entrar:**

1. Cuánto tarda hoy `GET /posts/:slug` con un post de **veinte comentarios**.
2. Qué parte de ese tiempo se va en la consulta a `comentarios` (`routes.ts:152-155`), separada del
   resto de los seis viajes a la base que hace ese endpoint (`:110`, `:119`, `:131`, `:144`,
   `:152`, `:157`, `:161`).

Con esos dos números el hallazgo vuelve a la tabla con un daño medible; sin ellos es una propuesta.

Aparte del rendimiento, la mitad estructural sigue siendo comprobable y se anota aquí sin
priorizar: sin FK, al borrar un post sus comentarios quedan huérfanos y vivos. Sobre SQLite
(`config/database.ts`, driver `better-sqlite3`) añadir la FK obliga a recrear la tabla y a borrar
antes las filas huérfanas, y eso no lo deshace un revert. En la semilla no hay ninguna huérfana
(`post_id` 1, 2, 4 y 6 existen). *Cuántas hay en la base real: en blanco.*

## Huecos que quedan sin rellenar

- El volumen real afectado en las filas 3, 5, 8 y 14, y en el apartado de fuera de la tabla: la
  base no está versionada (`backend/.gitignore:4`).
- Los consumidores externos del contrato de error de la fila 7.
- El radio del límite de frecuencia de la fila 11: no hay limitador ni middleware de throttling en
  el repositorio.
- La precedencia del hallazgo de fuera de la tabla, que no encontré ligada a ningún otro.
