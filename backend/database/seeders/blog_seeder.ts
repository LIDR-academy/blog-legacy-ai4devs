import db from '@adonisjs/lucid/services/db'
import { BaseSeeder } from '@adonisjs/lucid/seeders'

/**
 * Semilla del blog «Corriente».
 *
 * Ojo a tres cosas que están mal A PROPÓSITO y que la auditoría tiene que cazar:
 *
 *  1. Los posts guardan una copia del nombre/correo del autor y del nombre de la
 *     categoría. Tres de esas copias ya NO coinciden con la tabla de verdad
 *     (Marta cambió de apellido, Nuria de correo, y "Consejos" se renombró).
 *  2. posts.etiquetas es una cadena separada por comas.
 *  3. comentarios.estado es texto libre: conviven 'aprobado', 'Aprobado' y 'ok'.
 */
export default class extends BaseSeeder {
  async run() {
    // Se vacía todo para que la semilla sea reproducible.
    await db.from('comentarios').delete()
    await db.from('posts').delete()
    await db.from('etiquetas').delete()
    await db.from('categorias').delete()
    await db.from('autores').delete()

    const ahora = '2026-08-01 10:00:00'

    await db.table('autores').multiInsert([
      {
        id: 1,
        nombre: 'Marta Ruiz Calvo',
        email: 'marta.ruiz@corriente.es',
        rol: 'Editora jefa y diseño',
        bio: 'Lleva quince años maquetando revistas que nadie imprime ya. Dirige Corriente desde su primer número y sigue defendiendo que una retícula bien elegida ahorra más discusiones que cualquier reunión.',
        avatar: 'https://i.pravatar.cc/160?img=47',
        redes: JSON.stringify({
          youtube: 'https://youtube.com/@corriente',
          facebook: 'https://facebook.com/corriente.medio',
          instagram: 'https://instagram.com/marta.disena',
          x: 'https://x.com/marta_disena',
          linkedin: 'https://linkedin.com/in/martaruizcalvo',
        }),
        created_at: ahora,
        updated_at: ahora,
      },
      {
        id: 2,
        nombre: 'Diego Bermúdez',
        email: 'diego.bermudez@corriente.es',
        rol: 'Redactor de producto',
        bio: 'Escribe sobre métricas con la desconfianza de quien las ha visto usar mal. Antes montaba paneles de analítica; ahora los critica desde fuera, que se duerme mejor.',
        avatar: 'https://i.pravatar.cc/160?img=12',
        redes: JSON.stringify({
          youtube: '',
          facebook: '',
          instagram: 'https://instagram.com/dbermudez.escribe',
          x: 'https://x.com/dbermudez',
          linkedin: 'https://linkedin.com/in/diegobermudez',
        }),
        created_at: ahora,
        updated_at: ahora,
      },
      {
        id: 3,
        nombre: 'Nuria Salgado',
        email: 'nuria.salgado@corriente.es',
        rol: 'Diseñadora de interfaz e ilustración',
        bio: 'Dibuja iconos a mano antes de tocar el ratón. Cree que el modo oscuro se adopta por moda tres veces más a menudo que por necesidad, y lo dice en voz alta.',
        avatar: 'https://i.pravatar.cc/160?img=32',
        redes: JSON.stringify({
          youtube: 'https://youtube.com/@nuriadibuja',
          facebook: '',
          instagram: 'https://instagram.com/nuria.dibuja',
          x: '',
          linkedin: 'https://linkedin.com/in/nuriasalgado',
        }),
        created_at: ahora,
        updated_at: ahora,
      },
    ])

    const categorias = [
      'Noticias',
      'Tendencias',
      'Consejos',
      'Herramientas de diseño',
      'Desarrollo web',
      'Recursos',
      'Inspiración',
      'Reseñas',
      'Gráficos',
      'Diseño UI/UX',
      'Entrevistas',
      'Ideas de contenido',
    ]
    await db.table('categorias').multiInsert(
      categorias.map((nombre, i) => ({
        id: i + 1,
        nombre,
        slug: slugificar(nombre),
        created_at: ahora,
        updated_at: ahora,
      }))
    )

    const etiquetas = [
      'Diseño web',
      'UI/UX',
      'Consejos',
      'Desarrollo',
      'Inspiración',
      'Diseño gráfico',
      'Ideas de diseño',
      'Portafolios',
      'Tendencias',
      'Artículos',
      'Herramientas de diseño',
    ]
    await db.table('etiquetas').multiInsert(
      etiquetas.map((nombre, i) => ({
        id: i + 1,
        nombre,
        slug: slugificar(nombre),
        created_at: ahora,
        updated_at: ahora,
      }))
    )

    await db.table('posts').multiInsert(POSTS)
    await db.table('comentarios').multiInsert(COMENTARIOS)
  }
}

function slugificar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const POSTS = [
  {
    id: 1,
    titulo: 'Diez tendencias de diseño que pueden cambiar la web moderna',
    slug: 'diez-tendencias-de-diseno-que-pueden-cambiar-la-web-moderna',
    resumen:
      'Cada enero alguien publica su lista y cada diciembre la mitad no ha pasado. Repasamos las diez que sí han dejado rastro en proyectos reales.',
    cuerpo: `## La lista de siempre, con una vara de medir

Una tendencia solo cuenta si alguien la ha llevado a producción y ha sobrevivido al primer rediseño. Con ese filtro, la lista de veinte se queda en diez.

![Tablero con diez tarjetas de tendencias ordenadas por adopción](https://picsum.photos/seed/corriente-1a/1200/675)
*Ordenadas por adopción real, no por cuántas veces aparecen en una charla.*

## Uno: la retícula vuelve a verse

Durante años la retícula era el andamio que se quitaba al final. Ahora se deja a la vista, con líneas finas y márgenes anchos, y funciona como señal de que alguien pensó la página antes de escribirla.

## Dos: tipografía con trabajo dentro

Las fuentes variables dejaron de ser un truco. Un solo archivo cubre seis pesos y el sitio carga menos que antes con dos.

<p>Este párrafo viene con HTML tal cual desde el editor antiguo, porque el CMS lo permitía.</p>
<img src="/no-existe.png" onerror="console.warn('Demo de XSS: el cuerpo del post se inyecta sin sanear')">

## Tres: menos movimiento, mejor movimiento

La animación de entrada de cada bloque murió de éxito. Lo que queda es transición corta, con propósito, y respeto por \`prefers-reduced-motion\`.

![Comparación entre una entrada animada larga y una transición corta](https://picsum.photos/seed/corriente-1b/1200/675)
*A la derecha, la versión que nadie pide desactivar.*

## Y las siete restantes

Modo oscuro con contraste medido, ilustración propia en vez de banco de imágenes, formularios de un solo campo por pantalla, buscador que entiende sinónimos, portadas sin texto encima, paletas de tres colores y componentes que documentan su propio uso.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-1/1200/630',
    estado: 'publicado',
    publicado_en: '2026-03-14 09:00:00',
    autor_id: 1,
    categoria_id: 2,
    autor_nombre: 'Marta Ruiz Calvo',
    autor_email: 'marta.ruiz@corriente.es',
    categoria_nombre: 'Tendencias',
    etiquetas: 'Tendencias, Diseño web, Artículos',
    created_at: '2026-03-10 12:00:00',
    updated_at: '2026-03-14 09:00:00',
  },
  {
    id: 2,
    titulo: 'Quince ejemplos de diseño de una sola página',
    slug: 'quince-ejemplos-de-diseno-de-una-sola-pagina',
    resumen:
      'Quince sitios que caben en una pantalla larga y no se sienten cortos. Qué hicieron para que no lo parezca.',
    cuerpo: `## Una sola página no es una página pequeña

El error habitual es tratar el formato como una limitación. Los quince ejemplos que siguen lo tratan como una decisión de ritmo: cada bloque responde a una pregunta que el anterior deja abierta.

![Capturas apiladas de quince sitios de una sola página](https://picsum.photos/seed/corriente-2a/1200/675)
*Todos entran en un scroll; ninguno se siente incompleto.*

## Qué comparten

Tres cosas: un solo objetivo por página, navegación que ancla en vez de saltar, y un cierre que repite la acción principal sin disfrazarla.

## Dónde se rompen

En móvil. Trece de los quince pierden el índice lateral y no ofrecen sustituto. Es la parte del formato que sigue sin resolverse bien.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-2/1200/630',
    estado: 'publicado',
    publicado_en: '2026-04-02 08:30:00',
    autor_id: 3,
    categoria_id: 7,
    autor_nombre: 'Nuria Salgado',
    autor_email: 'nuria.salgado@corriente.es',
    categoria_nombre: 'Inspiración',
    etiquetas: 'Inspiración, Diseño web, Portafolios',
    created_at: '2026-03-28 10:00:00',
    updated_at: '2026-04-02 08:30:00',
  },
  {
    id: 3,
    titulo: 'Cinco consejos de diseño que aumentarán tus conversiones',
    slug: 'cinco-consejos-de-diseno-que-aumentaran-tus-conversiones',
    resumen:
      'Cinco cambios pequeños, medidos en tiendas reales. Ninguno necesita rediseño y todos se revierten en una tarde.',
    cuerpo: `## Antes de tocar nada, mide

Sin una línea base, cualquier cambio "funciona". Los cinco consejos de abajo se probaron con el mismo tráfico durante dos semanas.

## Uno: un botón, no tres

Cuando la pantalla ofrece tres acciones del mismo peso visual, la gente elige la de salir.

![Dos versiones de una ficha de producto, con tres botones y con uno](https://picsum.photos/seed/corriente-3a/1200/675)
*La de la derecha convierte más porque decide por el visitante.*

## Dos: el precio, entero y pronto

Los gastos que aparecen en el último paso son la causa más repetida de carrito abandonado, y no hay diseño que lo compense.

## Tres, cuatro y cinco

Etiquetas de campo siempre visibles, un solo campo de dirección con autocompletado, y confirmación que dice qué pasa después en vez de dar las gracias.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-3/1200/630',
    estado: 'publicado',
    publicado_en: '2026-04-21 07:45:00',
    autor_id: 1,
    categoria_id: 3,
    // ⚠️ Copia vieja: Marta firmaba así antes de cambiarse el apellido en 2025.
    autor_nombre: 'Marta Ruiz',
    autor_email: 'marta.ruiz@corriente.es',
    categoria_nombre: 'Consejos',
    etiquetas: 'Consejos, UI/UX, Diseño web',
    created_at: '2026-04-15 11:20:00',
    updated_at: '2026-04-21 07:45:00',
  },
  {
    id: 4,
    titulo: 'Las dos caras del diseño de interfaz oscuro',
    slug: 'las-dos-caras-del-diseno-de-interfaz-oscuro',
    resumen:
      'El modo oscuro descansa la vista de noche y la castiga de día. Cuándo conviene ofrecerlo y cuándo conviene no imponerlo.',
    cuerpo: `## La promesa

Menos luz emitida, menos fatiga, menos batería en pantallas OLED. Las tres cosas son ciertas en el contexto correcto.

![La misma interfaz en claro y en oscuro, lado a lado](https://picsum.photos/seed/corriente-4a/1200/675)
*El mismo texto, dos legibilidades distintas según la luz de la sala.*

## La otra cara

En una oficina iluminada, el texto claro sobre fondo oscuro se difumina: el ojo abre el iris para el fondo y pierde nitidez en la letra. Para textos largos, el modo claro sigue ganando.

## La regla práctica

Ofrécelo, no lo impongas. Respeta \`prefers-color-scheme\`, deja el interruptor visible y no cambies la jerarquía de color entre modos: solo cambia el fondo.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-4/1200/630',
    estado: 'publicado',
    publicado_en: '2026-05-09 16:10:00',
    autor_id: 3,
    categoria_id: 10,
    autor_nombre: 'Nuria Salgado',
    autor_email: 'nuria.salgado@corriente.es',
    categoria_nombre: 'Diseño UI/UX',
    etiquetas: 'UI/UX, Diseño web, Consejos',
    created_at: '2026-05-02 09:00:00',
    updated_at: '2026-05-09 16:10:00',
  },
  {
    id: 5,
    titulo: 'Los mejores portafolios online de diez diseñadores',
    slug: 'los-mejores-portafolios-online-de-diez-disenadores',
    resumen:
      'Diez portafolios que consiguen trabajo. Lo que tienen en común no es el estilo, es cómo cuentan el proceso.',
    cuerpo: `## Qué mira quien contrata

No el color. Mira si entiende qué problema había, qué se probó y qué se descartó. Los diez portafolios de abajo lo cuentan en menos de tres pantallas.

![Portada de un portafolio con tres casos y una biografía corta](https://picsum.photos/seed/corriente-5a/1200/675)
*Tres casos bien contados pesan más que treinta miniaturas.*

## El patrón que se repite

Caso, contexto, restricción, decisión, resultado. En ese orden y sin adornos. Los que empiezan por el resultado suenan a anuncio.

## Lo que sobra casi siempre

La animación de entrada del logotipo, la lista de herramientas y la nube de porcentajes de habilidad.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-5/1200/630',
    estado: 'publicado',
    publicado_en: '2026-05-28 11:00:00',
    autor_id: 3,
    categoria_id: 7,
    autor_nombre: 'Nuria Salgado',
    // ⚠️ Copia vieja: era su correo corporativo antes de unificar el dominio.
    autor_email: 'n.salgado@corriente.es',
    categoria_nombre: 'Inspiración',
    etiquetas: 'Portafolios, Inspiración, Artículos',
    created_at: '2026-05-20 08:00:00',
    updated_at: '2026-05-28 11:00:00',
  },
  {
    id: 6,
    titulo: 'Qué mide de verdad una métrica de producto',
    slug: 'que-mide-de-verdad-una-metrica-de-producto',
    resumen:
      'Una métrica no mide lo que dice su nombre, mide lo que se puede contar. Distinguir las dos cosas evita rediseños enteros.',
    cuerpo: `## El nombre engaña

"Usuarios activos" no mide interés: mide cuántas veces se abrió la aplicación. Si el aviso push se dispara a diario, la métrica sube sin que nadie use nada.

## El truco de leerla al revés

Pregunta qué tendría que pasar para que la métrica subiera sin que el producto mejorase. Si la respuesta es fácil, la métrica es débil.

![Panel con cuatro métricas y sus contraejemplos anotados a mano](https://picsum.photos/seed/corriente-6a/1200/675)
*Cada métrica con su contraejemplo al lado; el panel se lee distinto.*

## Tres que sí aguantan

Tareas terminadas, tiempo hasta el primer valor, y regreso a los siete días sin aviso previo.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-6/1200/630',
    estado: 'publicado',
    publicado_en: '2026-06-11 07:00:00',
    autor_id: 2,
    categoria_id: 5,
    autor_nombre: 'Diego Bermúdez',
    autor_email: 'diego.bermudez@corriente.es',
    categoria_nombre: 'Desarrollo web',
    etiquetas: 'Artículos, Desarrollo, Consejos',
    created_at: '2026-06-05 12:00:00',
    updated_at: '2026-06-11 07:00:00',
  },
  {
    id: 7,
    titulo: 'Tipografía grande: cuándo ayuda y cuándo estorba',
    slug: 'tipografia-grande-cuando-ayuda-y-cuando-estorba',
    resumen:
      'Subir el cuerpo de letra arregla la legibilidad hasta cierto punto, y a partir de ahí empieza a romper la jerarquía.',
    cuerpo: `## El punto en el que deja de ayudar

Entre 16 y 20 píxeles casi todo mejora. Por encima de 24, la línea se queda corta, el ojo salta más veces y la lectura se ralentiza.

![Tres columnas del mismo texto a 16, 24 y 32 píxeles](https://picsum.photos/seed/corriente-7a/1200/675)
*La tercera columna se lee peor que la primera, con la misma fuente.*

## Lo que sí escala

Los titulares, los números y las etiquetas cortas. Lo que no escala es el párrafo largo.

## La medida que importa

No es el cuerpo, es la longitud de línea: entre 55 y 75 caracteres. Ajusta el ancho antes de tocar el tamaño.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-7/1200/630',
    estado: 'publicado',
    publicado_en: '2026-07-03 09:30:00',
    autor_id: 1,
    categoria_id: 3,
    autor_nombre: 'Marta Ruiz Calvo',
    autor_email: 'marta.ruiz@corriente.es',
    // ⚠️ Copia vieja: la categoría 3 se renombró de "Consejos de diseño" a "Consejos".
    categoria_nombre: 'Consejos de diseño',
    etiquetas: 'Consejos, Diseño gráfico, Artículos',
    created_at: '2026-06-27 10:00:00',
    updated_at: '2026-07-03 09:30:00',
  },
  {
    id: 8,
    titulo: 'Cómo elegir una paleta que sobreviva al rediseño',
    slug: 'como-elegir-una-paleta-que-sobreviva-al-rediseno',
    resumen:
      'Las paletas que duran no se eligen por gusto: se eligen por cuántos estados de interfaz pueden cubrir sin inventar colores nuevos.',
    cuerpo: `## Empieza por los estados, no por el color

Antes de abrir el selector, escribe la lista: reposo, foco, error, aviso, éxito, desactivado. Son seis. Si la paleta no los cubre, el rediseño la ampliará a la fuerza.

![Rueda de color con seis estados marcados encima](https://picsum.photos/seed/corriente-8a/1200/675)
*Seis estados marcados antes de elegir un solo tono.*

## Tres tonos y una escala

Un color de marca, uno de apoyo y un neutro con nueve pasos. Todo lo demás sale de ahí.

## La prueba del contraste

Cada pareja texto/fondo que vayas a usar, comprobada contra AA. Si una no pasa, no la guardes "para decorar": acabará en un botón.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-8/1200/630',
    estado: 'publicado',
    publicado_en: '2026-07-24 08:00:00',
    autor_id: 3,
    categoria_id: 9,
    autor_nombre: 'Nuria Salgado',
    autor_email: 'nuria.salgado@corriente.es',
    categoria_nombre: 'Gráficos',
    etiquetas: 'Diseño gráfico, Herramientas de diseño, Ideas de diseño',
    created_at: '2026-07-18 15:00:00',
    updated_at: '2026-07-24 08:00:00',
  },
  {
    id: 9,
    titulo: 'Guía de accesibilidad para equipos pequeños',
    slug: 'guia-de-accesibilidad-para-equipos-pequenos',
    resumen:
      'Sin auditor externo ni presupuesto: qué se puede cubrir con dos personas y una tarde a la semana.',
    cuerpo: `## Borrador

Pendiente de revisar con Nuria las capturas del lector de pantalla y de decidir si entra el apartado de formularios largos.

## Lo que ya está

Contraste, foco visible, orden de tabulación y textos alternativos.

## Lo que falta

El apartado de tablas de datos y el de vídeo con subtítulos.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-9/1200/630',
    estado: 'borrador',
    publicado_en: null,
    autor_id: 2,
    categoria_id: 3,
    autor_nombre: 'Diego Bermúdez',
    autor_email: 'diego.bermudez@corriente.es',
    categoria_nombre: 'Consejos',
    etiquetas: 'Consejos, Desarrollo, UI/UX',
    created_at: '2026-08-02 09:00:00',
    updated_at: '2026-08-12 17:30:00',
  },
  {
    id: 10,
    titulo: 'Lo que aprendimos migrando el blog',
    slug: 'lo-que-aprendimos-migrando-el-blog',
    resumen:
      'La migración duró tres semanas más de lo previsto. Este borrador cuenta por qué, con nombres y fechas que aún hay que quitar.',
    cuerpo: `## Borrador, no publicar todavía

Hay que revisar el apartado de los correos internos antes de que esto salga. Marta lo tiene marcado.

## La causa real del retraso

Las URLs viejas. Nadie tenía el listado completo y aparecieron ciento cuarenta que había que redirigir.

## Lo que haríamos distinto

Exportar el mapa de URLs el primer día, antes de tocar una sola plantilla.`,
    imagen_portada: 'https://picsum.photos/seed/corriente-10/1200/630',
    estado: 'borrador',
    publicado_en: null,
    autor_id: 1,
    categoria_id: 1,
    autor_nombre: 'Marta Ruiz Calvo',
    autor_email: 'marta.ruiz@corriente.es',
    categoria_nombre: 'Noticias',
    etiquetas: 'Artículos, Desarrollo',
    created_at: '2026-08-06 11:00:00',
    updated_at: '2026-08-14 19:00:00',
  },
]

const COMENTARIOS = [
  {
    id: 1,
    post_id: 1,
    autor_nombre: 'Ana Cortés',
    autor_email: 'ana.cortes@ejemplo.es',
    cuerpo:
      'La parte de la retícula visible me ha convencido. Llevamos dos años escondiéndola y el resultado es que nadie sabe por qué las columnas están donde están.',
    estado: 'aprobado',
    creado_en: '2026-03-15 10:12:00',
    padre_id: null,
  },
  {
    id: 2,
    post_id: 1,
    autor_nombre: 'Marta Ruiz Calvo',
    autor_email: 'marta.ruiz@corriente.es',
    cuerpo:
      'Gracias, Ana. Justo el mes que viene publicamos un caso con la retícula documentada dentro del propio sitio, a ver qué te parece.',
    estado: 'aprobado',
    creado_en: '2026-03-15 12:40:00',
    padre_id: 1,
  },
  {
    id: 3,
    post_id: 1,
    autor_nombre: 'Rubén Lima',
    autor_email: 'ruben.lima@ejemplo.es',
    cuerpo:
      'Discrepo en lo de las fuentes variables. En proyectos con tres pesos concretos sigue saliendo más barato servir tres archivos estáticos.',
    // ⚠️ Mayúscula: entró por el panel viejo de moderación.
    estado: 'Aprobado',
    creado_en: '2026-03-16 09:05:00',
    padre_id: null,
  },
  {
    id: 4,
    post_id: 1,
    autor_nombre: 'Silvia Peña',
    autor_email: 'silvia.pena@ejemplo.es',
    cuerpo:
      '¿Tenéis el listado de los diez en algún sitio descargable? Me vendría bien para la reunión del jueves.',
    // ⚠️ 'ok': lo escribió así un script de importación de 2024.
    estado: 'ok',
    creado_en: '2026-03-18 18:22:00',
    padre_id: null,
  },
  {
    id: 5,
    post_id: 1,
    autor_nombre: 'Tomás Iglesias',
    autor_email: 'tomas.iglesias@ejemplo.es',
    cuerpo: 'Esto es publicidad encubierta de una agencia y se nota.',
    estado: 'pendiente',
    creado_en: '2026-03-19 07:44:00',
    padre_id: null,
  },
  {
    id: 6,
    post_id: 2,
    autor_nombre: 'Elena Vidal',
    autor_email: 'elena.vidal@ejemplo.es',
    cuerpo:
      'El número siete de la lista tiene el índice lateral resuelto en móvil, merece la pena mirarlo con calma.',
    estado: 'aprobado',
    creado_en: '2026-04-03 11:30:00',
    padre_id: null,
  },
  {
    id: 7,
    post_id: 2,
    autor_nombre: 'Comercial de plantillas',
    autor_email: 'promo@plantillas-baratas.example',
    cuerpo: 'Compra nuestras plantillas de una sola página con un 70% de descuento.',
    estado: 'pendiente',
    creado_en: '2026-04-04 03:12:00',
    padre_id: null,
  },
  {
    id: 8,
    post_id: 4,
    autor_nombre: 'Javier Onaindía',
    autor_email: 'javier.onaindia@ejemplo.es',
    cuerpo:
      'Lo del iris abriéndose para el fondo lo explica mejor que cualquier gráfico que haya visto. Me lo apunto para la próxima discusión de equipo.',
    estado: 'aprobado',
    creado_en: '2026-05-10 20:15:00',
    padre_id: null,
  },
  {
    id: 9,
    post_id: 6,
    autor_nombre: 'Paula Merino',
    autor_email: 'paula.merino@ejemplo.es',
    cuerpo:
      'La prueba de "qué tendría que pasar para que subiera sin mejorar el producto" la hemos usado esta semana y ha tumbado dos métricas del panel.',
    estado: 'Aprobado',
    creado_en: '2026-06-12 08:50:00',
    padre_id: null,
  },
]
