# Diseño de Nómina UAA

## Dirección actual

La referencia visual proporcionada por el usuario define la estructura: franja de información pública, titular de cartel, descripción breve, buscador ancho, filtros rápidos, tabla y pie. Esta dirección sustituye la anterior composición con serif, cabecera institucional y controles avanzados.

Nombre del proyecto: **Nómina UAA**, encima de la pregunta **¿Cuánto gana mi profe?**. La franja superior es un marquee de «Información pública», sin el nombre del proyecto, sin botón de pausa y con soporte para movimiento reducido.

## Paleta propia

Los colores evocan una relación con la UAA, sin reproducir su identidad institucional ni usar su escudo o flama. Las referencias Pantone proporcionadas orientan la familia cromática, no son valores que deban copiarse literalmente.

| Uso | Color |
| --- | --- |
| Fondo amarillo suave | `#F3E8B5` |
| Tinta azul carbón | `#202B3E` |
| Acento mostaza | `#E9C85D` |
| Filas blanco cálido | `#FFFEF8` |
| Columna de sueldo | `#ECDC91` |

La paleta puede seguir ajustándose. El contraste y la legibilidad deben mantenerse. Los colores de sueldos no expresan juicios sobre los importes.

## Composición

- Titular en mayúsculas, pesado y condensado. Descripción, encabezados de columnas y texto general con tipografía monoespaciada de sistema. Las filas de la tabla usan sans serif; la tipografía condensada se conserva en el bruto. Sin descargas externas.
- Bordes rectos, líneas claras y bloques simples. Sin sombras, degradados ni tarjetas añadidas.
- Sin sticker ni nota editorial junto a la descripción.
- Sin flechas decorativas, ilustraciones ni elementos adicionales que distraigan del buscador.
- La tabla contiene nombre, puesto, área/departamento y sueldo mensual. El nombre tiene prioridad en espacio y peso: sans serif de 22 px, peso 700 e interlineado de 1.3. Se divide usando los campos publicados: nombres de pila en el primer renglón y apellidos en el segundo. Se conservan los acentos de la fuente y las partículas interiores como «de» y «del» se presentan en minúsculas. El nombre completo queda disponible en su ficha, etiqueta accesible y tooltip. Puesto y área tienen menor peso visual. La columna amarilla de sueldo mantiene el bruto grande y condensado, su etiqueta debajo y el neto en negritas inmediatamente debajo de la etiqueta, sin margen adicional; ficha accesible desde el nombre.
- En pantallas pequeñas se conserva la tabla con desplazamiento horizontal dentro de su contenedor.

## Contenido y comportamiento

Descripción: «Sueldos de profesores y funcionarios de la UAA. Se pagan con dinero público, así que se leen con ojos públicos.»

Búsqueda por nombre, puesto o adscripción. Orden predeterminado por sueldo bruto de mayor a menor. Un selector permite cambiar a menor a mayor y conserva el orden al buscar, filtrar o compartir el enlace. Filtros: Todos, Profesores, Otros puestos y selector de área. Selector de orden compacto, sin paneles de rangos salariales. Diez personas por página.

«Profesores» usa la descripción de puesto publicada que comienza con PROF. o PROFESOR; «Otros puestos» agrupa el resto. Es una ayuda de consulta documentada en la fuente, no una clasificación oficial ni una identificación exhaustiva de funciones docentes. Área y departamento se consultan juntos porque la fuente publica una sola adscripción.

Mantener Astro estático, búsqueda y renderizado de resultados en el navegador. Sin backend ni nuevas dependencias. Fuente, periodo, descarga e independencia del proyecto visibles al pie.
