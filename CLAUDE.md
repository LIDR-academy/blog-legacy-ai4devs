# Blog «Corriente» — reglas de ingeniería

Este archivo gobierna cómo trabaja cualquier agente (y cualquier persona) en este repositorio.

**El prompt que escribes dice QUÉ construir. Este archivo dice CÓMO hay que construirlo.
Si un prompt no detalla el proceso, sigue este archivo por defecto. No preguntes.**

El rigor vive en la configuración, no en el prompt. Un prompt de una línea tiene que producir
el mismo resultado que un prompt de treinta, porque las treinta ya están aquí.

## Recoge tú el contexto, antes de escribir nada

No esperes a que el prompt te entregue el contexto. Ve a buscarlo:

- Lee `backend/start/routes.ts` entero antes de tocar cualquier endpoint. Hoy TODA la lógica
  del blog vive ahí: SQL, validación, autorización y forma de la respuesta.
- Lee las migraciones (`backend/database/migrations/`) para saber qué columnas existen de
  verdad, y la semilla (`backend/database/seeders/blog_seeder.ts`) para saber qué datos hay.
- Lee `backend/app/controllers/`, `backend/app/validators/user.ts` y
  `backend/app/transformers/user_transformer.ts`: son del starter kit de autenticación y son
  **el único ejemplo del repo escrito en la arquitectura correcta**. Imita su forma.
- Deduce el esquema, la validación, la forma de la respuesta y el comportamiento actual de lo
  que leas. No preguntes y no supongas: ve y míralo.
- **Toca SOLO el recurso o los endpoints que nombra la tarea.** Todo lo demás se queda igual.

## Stack real (leído, no supuesto)

| | |
|---|---|
| Backend | AdonisJS 7 · TypeScript ESM · `node ace` |
| ORM | Lucid 22 sobre **SQLite** (`backend/tmp/db.sqlite3`, driver `better-sqlite3`) |
| Validación | VineJS 4 (`vine.create({...})`) |
| Respuestas | `BaseTransformer` de `@adonisjs/core/transformers` |
| Tests | Japa 5 (`@japa/runner`, `@japa/assert`, `@japa/api-client`) — `npm test` en `backend/` |
| Cobertura | c8 — `npm run test:coverage` en `backend/`, resumen en `backend/coverage/` |
| Frontend | React 19 + Vite 8 (JSX, sin TypeScript) |
| Puertos | **API en 3401, web en 5401.** No uses 3333 ni 5173: están ocupados. |

Los alias de importación viven en `backend/package.json` → `imports` (`#controllers/*`,
`#services/*`, `#validators/*`, `#transformers/*`, `#models/*`…). **No existe `#repositories/*`:
si introduces la capa de repositorio, añade el alias ahí en el mismo cambio.**

## Arquitectura objetivo (para cada endpoint que toques)

Capas finas, de un solo propósito, y el dato fluye en una dirección:

```
Ruta (start/routes.ts)              // SOLO verbo + path + [Controlador, 'metodo']. Ni una línea más.
  → Controlador (app/controllers/)   // fino: valida, delega, devuelve. Sin SQL, sin reglas.
    → DTO de entrada = validador VineJS (app/validators/)   // TODA la validación de entrada
      → Servicio (app/services/)     // TODA la regla de negocio. El único sitio que muta estado.
        → Repositorio (app/repositories/)  // TODO el acceso a datos (Lucid). Ni un `db.rawQuery` fuera.
          → Modelo Lucid (app/models/)     // dominio; NUNCA se devuelve al cliente
  → DTO de salida = Transformer (app/transformers/)  // TODA la forma de la respuesta
```

Reglas que no se negocian:

- Una ruta que contenga SQL, un `if` de validación o una regla de negocio **está mal**, aunque funcione.
- Todo endpoint devuelve un **transformer**, nunca la fila cruda ni un objeto suelto.
- **El correo del autor y el de quien comenta NO salen en ninguna respuesta pública de un post.**
  Tampoco salen campos internos (`created_at`, `updated_at`, `estado`, ids ajenos) si el
  contrato no los pide.
- La validación de entrada va en un validador VineJS, nunca en `if`s dentro del controlador.
- Los errores se centralizan en `app/exceptions/handler.ts`, no se improvisan por ruta.
- Genera los archivos con `node ace make:controller`, `make:validator`, `make:service`,
  `make:migration`… No escribas a mano lo que el CLI del framework instalado ya genera, y no
  copies patrones de AdonisJS 5 ni de memoria: mira cómo lo hace el código de autenticación.

## Los tests mandan — TDD obligatorio

Rojo → verde → refactor. **La prueba que falla se escribe primero, siempre.**

- Estructura AAA con comentarios explícitos:

  ```ts
  test('devuelve el detalle de un post publicado', async ({ client, assert }) => {
    // Arrange
    await db.table('posts').insert(unPostPublicado())

    // Act
    const respuesta = await client.get('/posts/post-de-prueba')

    // Assert
    respuesta.assertStatus(200)
    respuesta.assertBodyContains({ post: { slug: 'post-de-prueba' } })
    assert.notProperty(respuesta.body().post, 'autor_email')
  })
  ```

- Comportamiento de endpoint → test funcional (`tests/functional/`, `client` de `@japa/api-client`).
  Lógica pura (puntuación de relacionados, partido de etiquetas) → test unitario (`tests/unit/`).
- Aísla cada test con `testUtils.db().withGlobalTransaction()`. Nada de mocks de base de datos.

### Antes de refactorizar: tests de caracterización

Cuando la tarea es refactorizar comportamiento que ya existe:

1. **Primero** escribe tests que fijen lo que el sistema hace **HOY**, con los bugs incluidos,
   y ponlos en verde contra el código legacy. Si hoy un cuerpo corto devuelve `200 {ok:false}`,
   el test de caracterización afirma `200 {ok:false}`.
2. **Después** reestructura hacia la arquitectura objetivo, manteniendo el verde en cada paso.

Refactorizar no cambia el comportamiento. **Arreglar un bug es otra tarea, con su propio test
y su propia decisión explícita**: primero se caracteriza el bug, luego se decide si se corrige,
y la corrección cambia el test de caracterización por uno nuevo que documenta el cambio.

### Afirma el contrato entero, no un campo suelto

Al probar un endpoint —y sobre todo al caracterizarlo— afirma la respuesta **completa**:

- Cada campo que devuelve, incluidas las relaciones anidadas y los recuentos, para que un DTO
  que renombre o pierda un campo rompa el test.
- Los campos que **no** deben estar (`assert.notProperty(cuerpo.post, 'autor_email')`). Una
  filtración no la caza la cobertura: la caza una aserción negativa.
- Los tipos donde importan (`estado` es string, `num_comentarios` es number).
- No fijes valores volátiles (fechas de creación, ids autoincrementales): afirma su presencia
  o su forma, y fija los estables.

Un solo `assertStatus(200)` **no es un test**.

### Cobertura no significa "hay tests"

Una suite verde no dice nada de lo que NO está probado. Para cada endpoint, la matriz mínima:

- camino feliz
- entrada inválida (con el código que el contrato tenga hoy)
- recurso inexistente (404)
- regla de negocio en su frontera (borrador oculto, comentario pendiente oculto, relacionados
  que no se incluyen a sí mismos)

Mide con `npm run test:coverage` dentro de `backend/`. El umbral que bloquea vive en
`.claude/hooks/guard-tests.mjs` (constante `COBERTURA_MINIMA`) y **hoy está en 0 a propósito**:
el proyecto arranca con un solo test. Súbelo conforme la suite crezca. La cobertura es una red
de seguridad, nunca un sustituto de la matriz: 90% con aserciones flojas sigue siendo un hueco.

## Reglas de negocio del dominio (lo que el sistema DEBERÍA cumplir)

Las conoces para poder decidir qué es bug y qué es contrato. **No las arregles de tapadillo
dentro de un refactor**: caracteriza primero, y si vas a corregir, dilo y hazlo con su test.

1. Un post en `borrador` no aparece en listados, ni en relacionados, ni en recientes, ni en
   búsqueda, **ni siquiera para su autor**.
2. Un comentario `pendiente` no se muestra en el detalle del post.
3. `slug` es único entre posts.
4. Los relacionados nunca incluyen el propio post, y salen como mucho N.
5. El recuento de comentarios de un post cuenta **solo los aprobados**.
6. La respuesta pública de un post **no expone el correo del autor** ni el de quien comenta.

## Git

- Nunca commitees en `main`. Rama primero: `refactor/<slug>` o `feat/<slug>`.
- Commits convencionales: `feat:`, `refactor:`, `test:`, `fix:`, `chore:`.
- Añade **solo las rutas que has tocado**. Nunca `git add -A` ni `git add .`.
- La suite tiene que estar verde antes de cada commit.
- El PR es el último paso explícito, con `gh pr create` (título + cuerpo que resume qué cambió
  y cómo se probó).

**Lo aplica el hook `PreToolUse`** (`.claude/hooks/guard-tests.mjs`, montado en
`.claude/settings.json`): un `git commit` con la suite en rojo se bloquea. Como el hook
intercepta la herramienta Bash y no el hook de git, **`git commit --no-verify` tampoco pasa**.

## Definition of Done

1. Test que falla escrito primero (y, si es refactor, caracterización en verde antes de tocar nada).
2. Capas respetadas: ruta fina → controlador → validador → servicio → repositorio → transformer.
3. Contrato completo afirmado, incluidas las aserciones negativas de lo que no debe salir.
4. Matriz de comportamiento cubierta (feliz / entrada inválida / 404 / frontera de la regla).
5. `npm test` verde en `backend/`; `npm run build` verde en `frontend/` si tocaste el front.
6. Rama, commits convencionales y PR abierto con `gh pr create`.
