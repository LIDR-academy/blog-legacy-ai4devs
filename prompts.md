# Prompts

Aquí van **todos los prompts que lanzaste** para hacer el ejercicio, en el orden en que los
lanzaste, con el modelo y la herramienta de cada uno.

Esto no es papeleo. Lo que se revisa es **cómo pediste las cosas**, no solo lo que salió: un
resultado flojo con un prompt bueno y un resultado flojo con un prompt vago necesitan feedback
distinto, y sin este archivo no se distinguen.

## Cómo rellenarlo

- Un apartado `## Prompt N` por cada prompt.
- **Pega el prompt tal cual lo lanzaste**, dentro del bloque de código, aunque ocupe diez líneas
  y aunque tenga faltas. No lo reescribas para que quede bien: el que arreglaste mentalmente
  después no es el que lanzaste.
- Incluye también los que **no funcionaron**. Suelen ser los más útiles de leer.
- `Modelo` y `Herramienta` en todos. Si cambiaste de una a otra a mitad, se nota aquí.

---

> 📌 **Esta rama es la de REFERENCIA, así que este archivo va relleno**, y lo que lleva es el
> registro **literal** de la sesión que produjo los commits que estás viendo: se extrajo de la
> transcripción, no se reescribió después. Sirve como ejemplo de qué se espera en el tuyo.
>
> ⚠️ **Es la sesión en vivo entera, no la tarea.** La tarea previa es solo la rebanada de
> auditoría (los prompts 1 a 5, más o menos); del 6 en adelante ya es el refactor, que se ve en
> directo. **No hace falta que tu registro tenga nueve entradas.**
>
> ⏱️ **Los tiempos son de ESTA corrida y no son un objetivo.** La misma cadena, lanzada otra vez
> el mismo día, tardó entre tres y cuatro minutos más en total. La IA no es determinista: si tu
> salida es distinta, no lo has hecho mal.

---

## Prompt 1 — la forma del sistema

**Herramienta:** terminal, desde Claude Code con `!`

```
!wc -l backend/start/routes.ts && ls backend/app/controllers && find backend/tests -name '*.spec.ts'
```

**Qué salió:** **418 líneas** en un solo archivo de rutas, **3 controladores** (ninguno de comentarios) y **1 solo archivo de tests**. Diez segundos, y ya sabes dónde vive la lógica.

---

## Prompt 2 — la auditoría de la rebanada

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
Audita la rebanada de COMENTARIOS de este proyecto: todo lo que toque comentarios, en la capa de rutas, en la base de datos y en el frontend. Devuelve los hallazgos ORDENADOS POR CRITICIDAD, del más crítico al menos. Para cada uno: un título corto, el archivo y la línea, y una frase de por qué importa. No arregles nada. Termina con la lista numerada de los títulos en el orden final.
```

**Qué salió:** Devolvió la lista de hallazgos de la rebanada, ordenada por criticidad, con archivo y línea. **≈2 min.** Ojo: el orden que da aquí es el que el Prompt 5 descarta.

---

## Prompt 3 — los cuatro ejes, con los huecos a la vista

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
Coge los hallazgos que acabas de devolver de la rebanada de comentarios y, para cada uno, rellena cuatro casillas: DAÑO, qué se rompe y quién lo nota; RADIO, cuántos sitios hay que tocar a la vez, contados y listados con su archivo y su línea, nunca "varios"; REVERSIBILIDAD, si lo deshace un revert limpio o deja rastro en datos ya guardados; y PRECEDENCIA, si su arreglo abarata o encarece el de otro hallazgo de esta misma lista, nombrándolo. Deja la casilla EN BLANCO cuando no puedas responderla abriendo el código de este repositorio, y no la rellenes por aproximación: quiero ver los huecos. No ordenes la lista, no cambies el orden que ya tiene, y no arregles nada.
```

**Qué salió:** Rellenó DAÑO, RADIO, REVERSIBILIDAD y PRECEDENCIA de cada hallazgo **y dejó casillas en blanco**, que es lo que se buscaba: los huecos son el dato. **≈4-5 min.**

---

## Prompt 4 — comprobar uno, abriendo

**Herramienta:** terminal, desde Claude Code con `!`

```
!curl -s localhost:3401/posts/diez-tendencias-de-diseno-que-pueden-cambiar-la-web-moderna | grep -o '"autor_email":"[^"]*"'
```

**Qué salió:** **Tres correos** en la respuesta pública: el del autor del post y los de quien comentó. Un hallazgo deja de ser una afirmación del agente y pasa a ser un hecho.

⚠️ **La primera vez salió vacío**, y no por el comando: la API no estaba levantada (`make api` en otra terminal). Por eso el proyecto trae `make fuga`, que hace esta misma comprobación y **dice en voz alta por qué falla** en vez de devolver nada.

---

## Prompt 5 — la auditoría, al repositorio

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
Crea una rama `feat/auditoria-comentarios` desde la rama actual y escribe en `docs/auditoria/comentarios.md` la auditoría priorizada. Una fila por hallazgo, con seis columnas: qué es; dónde está, con la línea que lo demuestra; qué se rompe y quién lo nota; cuántos sitios hay que tocar; si lo deshace un revert; y a qué otro hallazgo bloquea o desbloquea. Rellénalas con los ejes que ya me diste, sin reescribirlos.

El ORDEN de la tabla no es el que devolviste al principio: **descarta esa criticidad** y ordena con las dos claves que hemos usado en clase, en este orden. Primera, PRECEDENCIA, que es un orden topológico y no un juicio: si el arreglo de A abarata el de B, A va antes, y para eso usa la columna de precedencia que tú mismo rellenaste. Segunda, dentro de cada nivel, DAÑO dividido por RADIO, no daño a secas.

Y encima de eso van estas dos decisiones que hemos tomado fuera del chat y que tú no has visto, así que se respetan al pie de la letra. NO te las doy por número ni por el título exacto que les pusiste: localiza en TU lista el hallazgo que corresponde a cada descripción, y dime cuál has elegido para cada una antes de escribir nada.

SE PARTE EN DOS FILAS: el hallazgo de que la respuesta pública devuelve la fila cruda y con ella sale el correo del autor en cada post y el de quien comenta en cada comentario. Una fila de CONTENCIÓN (quitar esos campos de la respuesta; radio mínimo, lo deshace un revert limpio, entra hoy, y sobrevive a la normalización posterior) y otra de ARREGLO (el DTO que decide qué campos salen, que espera a que el modelo esté normalizado para no tener que escribirse dos veces). Cada fila va donde le toque según las dos claves, que no es el mismo sitio para las dos.
FUERA DE LA TABLA: si en tu lista hay algún hallazgo que sea una propuesta sin medir en vez de un defecto comprobable (típicamente de rendimiento: cachear, paginar, un N+1), sácalo de la tabla a un apartado aparte, con lo que habría que medir para que vuelva a entrar: cuánto tarda hoy el endpoint de detalle con un post de veinte comentarios, y qué parte de ese tiempo se va en la consulta. Si no hay ninguno, no saques nada y dímelo.

Las casillas que dejaste en blanco se quedan en blanco. No añadas hallazgos nuevos, no rellenes huecos por aproximación y no arregles nada. Cuando termines, dime en una línea qué orden ha salido y por qué el primero es el primero. Commitea solo ese archivo.
```

**Qué salió:** Enseñó qué hallazgo emparejaba con cada descripción **antes de escribir**, creó `feat/auditoria-comentarios`, aplicó las dos claves, partió el hallazgo del correo en contención + arreglo, sacó la propuesta sin medir a un apartado aparte, respetó las casillas en blanco y commiteó **solo ese archivo**. **4 min 14 s** → commit `656fdfb`, que es `docs/auditoria/comentarios.md` de esta rama.

---

## Prompt 6 — la cobertura de partida

**Herramienta:** terminal, desde Claude Code con `!`

```
!make test-coverage
```

**Qué salió:** **41,77 %** total y **32,29 %** en `backend/start/routes.ts`, que es donde vive la lógica que se va a mover. El número de partida importa para saber contra qué se compara después.

---

## Prompt 7 — el encargo de una línea

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
/refactor Pasa los endpoints de comentarios a la arquitectura objetivo.
```

**Qué salió:** Una línea, porque el rigor está escrito en la *skill* `/refactor` y en el `CLAUDE.md` del repositorio, no en el prompt. Recorrió el ciclo entero: exploró, creó rama, **caracterizó el comportamiento de hoy con tests antes de tocar nada**, movió las rutas a sus capas y commiteó. **≈9 min** → commits `3c8ac79` (tests) y `29b2765` (refactor).

---

## Prompt 8 — verde no significa que esté mirando

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
Cambia una sola aserción de `backend/tests/functional/comentarios.spec.ts` para que la suite falle a propósito. No toques nada de código de producción. Después intenta commitear ese cambio. Si algo te lo impide, enséñame el mensaje literal que has recibido y no intentes rodearlo de ninguna manera.
```

**Qué salió:** Rompió una aserción a propósito y **el hook del repositorio le impidió commitear**. Claude Code lo etiqueta en rojo como `PreToolUse:Bash hook error`: **eso es el éxito**, no una avería. Es lo que impide que un refactor entre con la suite en rojo.

---

## Prompt 9 — solo lo crítico, al tablero

**Modelo:** Opus (effort high)
**Herramienta:** Claude Code

```
Lee la auditoría que acabamos de escribir. Está commiteada en la rama `feat/auditoria-comentarios`, y puede que no estés en esa rama: si `docs/auditoria/comentarios.md` no aparece en el árbol de trabajo, sácala con `git show feat/auditoria-comentarios:docs/auditoria/comentarios.md`. Materializa en el tablero FLOW de Jira, con el MCP de Atlassian, SOLO las DOS PRIMERAS FILAS de esa tabla, que ya está ordenada con las dos claves de clase. No las busques por criticidad: esa columna la descartamos. Nada más de la lista. Créalas como issues de tipo "Historia" (los tipos de este proyecto van en español: "Story" no resuelve), una por fila, con el título de la fila tal cual, y en la descripción sus cuatro casillas como están en el archivo, la ruta del archivo con la línea que lo demuestra, y la ruta del propio documento de auditoría. Etiqueta cada una con "auditoria" y "comentarios". Antes de crear nada, enséñame la lista exacta de lo que vas a crear y espera a que yo te diga que sí. No crees subtareas, no crees nada que no esté en esa lista, y no toques ningún issue que ya exista en el tablero.
```

**Qué salió:** Enseñó la lista de lo que iba a crear y esperó. Con un **«sí, créalas»** materializó en Jira, vía el MCP de Atlassian, **solo las dos primeras filas** de la auditoría. El resto de la tabla no se toca: el tablero no es el sitio donde se descubre, es donde se compromete.
