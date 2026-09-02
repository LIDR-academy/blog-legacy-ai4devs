# Qué es esto, y qué NO es

`comentarios.md` es **el resultado de una sesión real** sobre la rebanada de comentarios: la tabla
priorizada, el hallazgo partido en contención y arreglo, y la propuesta sin medir fuera de la tabla.
Está aquí como **referencia de la forma**.

## No es la respuesta correcta

Y esto importa más de lo que parece. La auditoría la produce un agente, y **su salida cambia en cada
ejecución**. Medido sobre este mismo proyecto, con el mismo prompt: dos corridas devolvieron **19 y
20 filas**, con **títulos distintos** y en **orden distinto**; y a lo largo de seis corridas el número
de hallazgos fue **12, 13, 10, 11, 13 y 14**.

Así que si tu tabla no se parece a esta, **no has hecho nada mal**. Lo que se repite es el recorrido,
no el texto:

- una fila por hallazgo, con **la línea que lo demuestra**;
- el radio **contado**, no estimado;
- las casillas que no se pueden responder abriendo el código, **en blanco a propósito**;
- el orden por **precedencia** primero y **daño partido por radio** después, no por criticidad;
- y el hallazgo cuyo daño y precedencia se contradicen, **partido en dos filas**.

Eso es lo que hay que comparar. El contenido concreto de cada celda es de esta corrida y de ninguna
otra.

## El refactor

Los dos commits siguientes son la otra mitad: primero los **tests de caracterización**, que fijan lo
que el sistema hace **hoy, con sus defectos dentro**, y solo después el movimiento a capas. Ese orden
no es un detalle de estilo: es lo único que permite saber si el refactor cambió el comportamiento.

Los defectos que la auditoría lista **siguen ahí**. Arreglarlos es otra tarea, con su propia decisión.
