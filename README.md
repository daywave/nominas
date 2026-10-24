# ¿Cuánto gana mi profe?

Las reglas visuales y de contenido están en [DESIGN.md](DESIGN.md).

Buscador independiente de remuneraciones universitarias, construido con Astro, CSS y JavaScript de navegador. La institución disponible actualmente es la UAA: «Nómina UAA» identifica esa nómina, no la marca del proyecto. Sin React, base de datos ni servicios externos en tiempo de ejecución.

Repositorio: [sebhdz/nominas-uaa](https://github.com/sebhdz/nominas-uaa). Puedes proponer cambios mediante un pull request o reportar errores mediante un issue, indicando la persona o registro, el periodo y la fuente que permita verificar la corrección. No incluyas información personal ajena a la publicación oficial.

## Desarrollo

Requiere Node.js 22.12 o superior.

```sh
npm install
npm run dev
```

## Verificación y producción

```sh
npm test
npm run build
npm run preview
```

`npm run build` genera `dist/`, lista para un alojamiento estático. Astro genera el JSON utilizado por el buscador a partir de `data/2026/nominas.json`; no hay que mantener copias manualmente ni ejecutar Python. La descarga de archivos no forma parte del alcance actual.

## Alcance

Una búsqueda flexible por nombres, adscripciones y puestos, sin importar acentos, mayúsculas u orden de palabras. Filtros rápidos por profesores u otros puestos y selector de área. Los resultados se ordenan por sueldo bruto de mayor a menor de forma predeterminada, con selector para cambiar a menor a mayor. Tabla con quince personas por página, nombres destacados en dos renglones, bruto y neto visibles y ficha individual con enlace compartible.

Área y departamento comparten un filtro porque la fuente solo incluye un campo de adscripción. La búsqueda y los filtros se ejecutan en el navegador.

Fuente: Plataforma Nacional de Transparencia, según la procedencia indicada por el proveedor del archivo. Periodo abril–junio de 2026. Los importes se reportan como mensuales, en pesos mexicanos. La fuente incluye distintas funciones, no exclusivamente docentes. Los importes cero se conservan sin inferir su motivo.

## Estructura

- `src/pages/index.astro`: página de búsqueda y ficha.
- `src/components/Footer.astro`: único footer, con definiciones visibles en una fila de escritorio, enlace a la fuente, actualización y estilos propios.
- `src/styles/global.css`: diseño editorial y adaptación móvil.
- `src/scripts/search.js`: interacción, ficha y enlaces.
- `src/scripts/search-utils.js`: normalización y búsqueda.
- `src/pages/data/2026/buscador.json.js`: endpoint estático que genera el índice del buscador durante la compilación.
- `data/2026/nominas.json`: fuente original, sin modificaciones.

El alcance actual corresponde a un solo periodo. Al incorporar históricos habrá que añadir la selección de periodo y actualizar las etiquetas de la interfaz.
