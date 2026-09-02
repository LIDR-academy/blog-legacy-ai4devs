# Blog «Corriente»

Un blog con posts, autores, categorías, etiquetas y comentarios. Monorepo con **AdonisJS 7 +
SQLite** en `backend/` y **React 19 + Vite** en `frontend/`.

Este es el sistema sobre el que trabajas en el Módulo 6. Léelo entero antes de empezar: además
de cómo levantarlo, aquí está **el ejercicio y cómo se entrega**.

## Arrancarlo

No hay `package.json` en la raíz. Los comandos de `npm` se ejecutan dentro de `backend/` y de
`frontend/`, y el `Makefile` de la raíz ya lo hace por ti.

```bash
make setup   # instala backend y frontend, y prepara backend/.env
make db      # crea la base SQLite y la siembra
make api     # API   → http://localhost:3401
make web     # web   → http://localhost:5401   (en otra terminal)
make test    # la suite
```

Los puertos son **3401** y **5401** a propósito, para no chocar con los que suele ocupar un
proyecto Adonis o Vite recién creado.

## Superficie de la API

| Método | Ruta | Qué hace |
|---|---|---|
| GET | `/posts` | publicados, paginado; filtros `?categoria=` `?etiqueta=` `?autor=` `?q=` |
| GET | `/posts/recientes` | los N más recientes publicados |
| GET | `/posts/:slug` | detalle + autor + categoría + etiquetas + comentarios + anterior/siguiente |
| GET | `/posts/:slug/relacionados` | por categoría y etiquetas compartidas |
| GET | `/categorias` | con recuento de posts |
| GET | `/etiquetas` | con recuento de posts |
| GET | `/autores/:id` | autor + sus posts |
| POST | `/posts/:slug/comentarios` | crea un comentario en estado `pendiente` |
| DELETE | `/comentarios/:id` | borra un comentario |
| PATCH | `/comentarios/:id` | edita un comentario |

## Reglas de negocio

Esto es lo que el sistema **debe** cumplir. Es el contraste de tu auditoría: sin una regla
escrita, un hallazgo es una opinión sobre el estilo de otra persona.

1. Un post en `borrador` no aparece en listados, relacionados, recientes ni búsqueda, **ni
   siquiera para su autor**.
2. Un comentario `pendiente` no se muestra en el detalle del post.
3. `slug` es único entre posts.
4. Los relacionados nunca incluyen el propio post, y salen como mucho N.
5. El recuento de comentarios cuenta **solo los aprobados**.
6. La respuesta pública de un post **no expone el correo del autor** ni el de quien comenta.

## La capa de agente

Vive en la raíz y es parte del material, no un accesorio:

- [`CLAUDE.md`](CLAUDE.md), las reglas de cómo se construye y la arquitectura objetivo.
- [`.claude/commands/refactor.md`](.claude/commands/refactor.md), el ritual completo en un comando.
- [`.claude/hooks/guard-tests.mjs`](.claude/hooks/guard-tests.mjs), el hook que bloquea
  `git commit` con la suite en rojo.

---

# El ejercicio

**Se hace antes del directo.** Son unos 45 minutos y hay que ponerles un reloj.

## Cómo funciona este módulo

Tres momentos, y conviene que los sepas antes de empezar:

1. **Lo intentas tú**, aquí, sobre este proyecto. Entregas lo que te salga, con lo que tenga.
2. **Lo ves resuelto en el directo.** El mentor ejecuta este mismo ejercicio sobre este mismo
   proyecto. Si no te salió, ahí ves que se puede y cómo.
3. **Lo replicas después**, con los prompts del mentor, que te llegan por escrito.

Por eso la entrega a medias no es un problema: **el paso 1 no se puntúa por completarlo**. Y
por eso conviene mirar el directo sin teclear, porque lo vas a repetir con calma luego.

> ⚠️ **En el paso 3 no esperes salidas idénticas.** El agente no es determinista: con el mismo
> prompt y el mismo código cambian los nombres de variables, la redacción y hasta cuántos
> hallazgos devuelve. Lo que se repite es **la forma**, no el texto.

## Parte A: la auditoría, con reloj

Con un agente, produce **la auditoría priorizada de una sola rebanada** y déjala escrita en
`docs/auditoria/<rebanada>.md`, no en el chat.

**Una sola rebanada.** Una capa, o un grupo de rutas que gestionan la misma cosa. No el sistema
entero, aunque quepa y aunque el agente se ofrezca.

**El formato no es negociable**: una fila por hallazgo, con estas seis casillas.

1. **Qué es.** Una frase. Si necesitas tres, es que hay dos hallazgos.
2. **Dónde está**, con **la línea que lo demuestra**. Sin esta casilla, la fila no se escribe.
3. **Qué se rompe, y quién lo nota.** El efecto concreto y a quién le llega. *"Nadie todavía"*
   es una respuesta válida y buena.
4. **Cuántos sitios hay que tocar.** Contados, no estimados.
5. **¿Se deshace con un revert?** Sí o no, y si es que no, por qué no.
6. **¿Bloquea o desbloquea a otro hallazgo?** Nombrando al otro. *"A ninguno"* es la respuesta
   más frecuente.

> ⚠️ **Cuando suene el reloj, para. Aunque esté a medias.** Una fila con tres casillas rellenas
> y tres en blanco **es información**: dice hasta dónde llegaste. Una fila completada de memoria
> diez minutos después es ruido con formato, y encima es indistinguible de la buena.

## Parte B: las tres líneas

Debajo de la tabla, en el mismo archivo. **Esta parte no se puede fallar**, y es la que hay que
traer sí o sí.

1. **Cuántos hallazgos devolvió el agente, y cuántos comprobaste tú abriendo el archivo.** Los
   dos números, tal cual salieron.
2. **El hallazgo del que no supiste decidir la prioridad**, y en una frase, por qué.
3. **Algo que el agente afirmó y no pudiste verificar.** No es lo que dijo mal: es lo que no
   pudiste comprobar ni a favor ni en contra.

---

# Cómo se entrega

**Es un pull request desde tu fork.** Cinco pasos.

### 1. Forkea este repositorio

Con el botón **Fork** de arriba. Sobre un clon directo no tienes permiso de escritura, y aquí
vas a crear una rama y commitear.

```bash
git clone git@github.com:<tu-usuario>/blog-legacy-ai4devs.git
cd blog-legacy-ai4devs
git checkout s6/start
```

> 📌 Si te sale `Permission denied (publickey)`, es SSH y no el fork. La guía oficial está en
> `docs.github.com/es/authentication/connecting-to-github-with-ssh`.

### 2. Crea tu rama

```bash
git checkout -b auditoria-<tus-iniciales>
```

### 3. Haz el ejercicio

El archivo de la auditoría va en `docs/auditoria/`, con la tabla de la Parte A y las tres
líneas de la Parte B.

### 4. Rellena `prompts.md`

Está en la raíz, con la plantilla puesta. **Es obligatorio y es la mitad de lo que se revisa**:
lo que se mira no es solo tu resultado, es cómo lo pediste. Un prompt por bloque, con el modelo
y la herramienta que usaste.

### 5. Abre el pull request

Contra este repositorio. Con tu rama empujada, GitHub te ofrece el botón arriba.

```bash
git add docs/auditoria prompts.md
git commit -m "auditoria: <rebanada> + prompts"
git push -u origin auditoria-<tus-iniciales>
```

## El plazo

**Antes del directo.** Lo que llegue a tiempo recibe feedback de tu TA antes de la sesión, que
es el momento en que te sirve. Lo que llegue después **se marca como recibido pero no se
revisa**: el feedback existe para que llegues al directo sabiendo dónde fallaste, y después de
la sesión ya no puede hacer eso.

## Antes de conectarte, comprueba

- [ ] Estás en tu **fork**, en tu rama, y `git push` funciona.
- [ ] El proyecto levanta y la suite corre.
- [ ] Existe tu archivo en `docs/auditoria/`, con la tabla y las tres líneas.
- [ ] `prompts.md` está relleno, con modelo y herramienta en cada bloque.
- [ ] El pull request está abierto.
