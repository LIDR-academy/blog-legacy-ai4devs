---
description: Refactoriza un recurso de punta a punta, con caracterización y TDD estrictos
argument-hint: <recurso o endpoints a refactorizar>
---

Vas a refactorizar lo siguiente en este repositorio:

> $ARGUMENTS

Ejecuta este ciclo y narra cada paso en una línea. No te saltes ninguno.

1. **Explora.** Lee `backend/start/routes.ts` y quédate con los endpoints que entran en el
   alcance. Lee las migraciones y la semilla para saber qué columnas y qué datos hay de verdad.
   Lee `backend/app/controllers/` y `backend/app/transformers/user_transformer.ts` como
   ejemplo de la forma correcta. **Anota el comportamiento actual, bugs incluidos.**

2. **Rama.** `git checkout -b refactor/<slug>` desde `main`. Nunca trabajes sobre `main`.

3. **Caracteriza en rojo.** Escribe los tests que fijan el comportamiento de HOY del recurso:
   camino feliz, entrada inválida con el código de estado que devuelve hoy, 404, y la frontera
   de la regla de negocio. Afirma el **contrato completo** de la respuesta, campo a campo,
   incluidas las aserciones negativas de lo que no debería salir. Córrelos y enséñalos fallar
   si aún no existe el endpoint, o en verde si solo estás fijando lo que ya hay.

4. **Verde.** El mínimo código para pasar, respetando las capas: ruta fina → controlador →
   validador VineJS → servicio → repositorio → transformer. `npm test --prefix backend` hasta
   verde.

5. **Refactoriza.** Saca la lógica de la ruta a su capa, sin cambiar comportamiento. Los tests
   siguen verdes en cada paso. Si un test se pone rojo, has cambiado comportamiento: vuelve atrás.

6. **Repite 3–5** hasta que el recurso completo esté cubierto por la matriz.

7. **Bugs, aparte.** Si encuentras un bug (borrador que se cuela, correo que se filtra, dos
   reglas contradictorias), **no lo arregles dentro del refactor**. Anótalo, dilo, y propón
   arreglarlo como una tarea aparte con su propio test. La única excepción es que el prompt de
   arriba te haya pedido explícitamente corregirlo.

8. **Commit.** Commits convencionales, rutas explícitas, nunca `git add -A`. El hook corre la
   suite antes de dejarte commitear; no intentes esquivarlo.

9. **PR.** Como último paso, `gh pr create` con un título claro y un cuerpo que resuma qué
   capas se movieron, qué comportamiento quedó fijado y qué bugs quedaron anotados sin tocar.

Párate y reporta si la base de datos no está migrada (`make db`) o si `gh` no está autenticado.

**Sigue las reglas de `CLAUDE.md` exactamente.**
