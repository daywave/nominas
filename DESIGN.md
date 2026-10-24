# Diseño de ¿Cuánto gana mi profe?

## Dirección actual

La referencia visual proporcionada por el usuario define la estructura: franja de información pública, titular de cartel, descripción breve, buscador ancho, filtros rápidos, tabla y pie. Esta dirección sustituye la anterior composición con serif, cabecera institucional y controles avanzados.

Marca del proyecto: **¿Cuánto gana mi profe?**. **Nómina UAA** identifica la institución encima de la pregunta; ese nombre cambiará según la universidad. La franja superior es un marquee de «Información pública», sin el nombre del proyecto, sin botón de pausa y con soporte para movimiento reducido.

## Paleta propia

Los colores evocan una relación con la UAA, sin reproducir su identidad institucional ni usar su escudo o flama. Las referencias Pantone proporcionadas orientan la familia cromática, no son valores que deban copiarse literalmente.

| Uso | Color |
| --- | --- |
| Fondo arena | `#EAE2D2` |
| Tinta casi negra | `#242321` |
| Acento mostaza | `#D9AD42` |
| Mostaza para texto sobre arena | `#86610E` |
| Filas blanco cálido | `#FFFEF8` |
| Columna de sueldo | `#D9AD42` |

La paleta puede seguir ajustándose. El contraste y la legibilidad deben mantenerse. Los colores de sueldos no expresan juicios sobre los importes.

El mostaza acentúa el marquee, «mi profe?», el botón «Ver sueldo», los sueldos, la firma editorial del cierre y el botón de código abierto. En «mi profe?» las letras usan un mostaza más oscuro para mantener contraste sobre arena, sin franja de fondo.

## Composición

- Titular en mayúsculas, pesado y condensado. Encabezados de columnas, controles y texto general con tipografía monoespaciada. Georgia se reserva como acento para la descripción principal, los términos del diccionario y «Hecho para leerse». Las filas de la tabla usan sans serif; la tipografía condensada se conserva en el bruto. Sin descargas externas.
- Bordes rectos, líneas claras y bloques simples. Sin sombras, degradados ni tarjetas añadidas.
- Sin sticker ni nota editorial junto a la descripción.
- Sin flechas decorativas, ilustraciones ni elementos adicionales que distraigan del buscador.
- La tabla contiene nombre, puesto, área/departamento y sueldo mensual. El nombre tiene prioridad en espacio y peso: sans serif de 22 px, peso 700 e interlineado de 1.3. Se divide usando los campos publicados: nombres de pila en el primer renglón y apellidos en el segundo. Se conservan los acentos de la fuente y las partículas interiores como «de» y «del» se presentan en minúsculas. El nombre completo queda disponible en su ficha, etiqueta accesible y tooltip. Puesto y área tienen menor peso visual. La columna azul de sueldo mantiene el bruto grande y condensado, su etiqueta debajo y el neto en negritas inmediatamente debajo de la etiqueta, sin margen adicional; ficha accesible desde el nombre.
- Hasta 700 px, cada fila se compacta en dos bloques: nombre, puesto y área a la izquierda; bruto y neto a la derecha. Mantener fondo claro para la información, azul más intenso para el sueldo, borde exterior y separadores de filas. Sin desplazamiento horizontal ni duplicar datos o renderizado; la tabla de escritorio se conserva.

## Contenido y comportamiento

Descripción: «Sueldos de profesores y funcionarios de la UAA. Se pagan con dinero público, así que se leen con ojos públicos.»

Búsqueda por nombre, puesto o adscripción. Orden predeterminado por sueldo bruto de mayor a menor. Un selector permite cambiar a menor a mayor y conserva el orden al buscar, filtrar o compartir el enlace. Filtros: Todos, Profesores, Otros puestos y selector de área. Selector de orden compacto, sin paneles de rangos salariales. Quince personas por página.

«Profesores» usa la descripción de puesto publicada que comienza con PROF. o PROFESOR; «Otros puestos» agrupa el resto. Es una ayuda de consulta documentada en la fuente, no una clasificación oficial ni una identificación exhaustiva de funciones docentes. Área y departamento se consultan juntos porque la fuente publica una sola adscripción.

Mantener Astro estático, búsqueda y renderizado de resultados en el navegador. Sin backend ni nuevas dependencias. Fuente, periodo e independencia del proyecto visibles al pie. La descarga de datos queda fuera del alcance actual.

## Footer

Colofón editorial sin dibujo ASCII, con cuatro definiciones visibles en una sola fila en escritorio: nómina, fuente, bruto y neto. Dos columnas en tablet y móvil, con tipografía más compacta en móvil y separadores punteados. La independencia del proyecto y la fecha de actualización se presentan como notas al pie, fuera del diccionario. La Plataforma Nacional de Transparencia se enlaza directamente desde «fuente» y la fecha se identifica como actualización reportada por la fuente. Sin sección desplegable ni descarga de archivos. Sello enlazado al repositorio de código abierto y firma «Hecho para leerse». Prueba de paleta: fondo azul eléctrico lavado, sueldos en un tono más intenso y cierre casi negro.
