# Revisión de descargas originales

Revisión del 24 de octubre de 2026, realizada con tres subagentes Luna y cotejos del agente principal. Es una inspección de los archivos presentes en `data/raw`, no una aprobación de publicación ni una definición del pipeline. Los originales no se modificaron.

## Inventario verificado

Los 12 archivos son JSON válidos y sus filas tienen la longitud indicada por sus encabezados. Esto no garantiza cobertura completa de personas ni de periodos en la fuente.

| Archivo | Filas | Columnas | Periodo real informado |
| --- | ---: | ---: | --- |
| UAA_abril_junio2026.json | 3,665 | 32 | Abril–junio 2026 |
| UPA_enero_marzo2026.json | 184 | 32 | Enero–marzo 2026 |
| UTA_septiembre_septiembre2026.json | 139 | 32 | Septiembre 2026 |
| UTMA_abril_junio2026.json | 20 | 32 | Abril–junio 2026 |
| UTNA_abri_junio2026.json | 275 | 32 | Abril–junio 2026 |
| UTR_julio_septiembre2026.json | 152 | 32 | Julio–septiembre 2026 |
| IPN_julio_septiembre2026.json | 32,728 | 32 | Julio–septiembre 2026 |
| UNAM_julio_septiembre2026.json | 32,743 | 32 | Julio–septiembre 2026 |
| UDG_julio_julio2026.json | 5,213 | 32 | 16–31 de julio de 2026 |
| UANL_julio_julio2026.json | 12,627 | 32 | Julio 2026 |
| BUAP_julio_septiembre2026.json | 4,291 | 33 | Julio–septiembre 2026 |
| UAZ_abril_junio2026.json | 11,297 | 32 | Abril–junio 2026 |

Son registros, no cantidades verificadas de personas únicas. Las nuevas muestras de UNAM y UTA ya no presentan los cierres faltantes observados en la revisión anterior.

## Estructura

El contenedor común tiene `institucion`, `organoGarante`, `obligacion`, `formato`, `columnas` y `filas`. Los campos principales están en el mismo orden en estas muestras; hay diferencias menores de espacios y redacción en encabezados.

BUAP incluye una columna adicional: «Nombre del(a) funcionario(a) responsable de generar la información». Sus columnas de actualización y nota se desplazan a los índices 31 y 32; en las demás muestras están en 30 y 31. No conviene asumir un número fijo de columnas ni leer las fechas solo por posición.

Los importes principales observados son cadenas decimales. Las fechas mezclan `DD/MM/YYYY` y `YYYY-MM-DD 00:00:00`. Las etiquetas monetarias varían: PESO, PESOS, Pesos, MXN, MN y PESOS MEXICANOS. Conservar su procedencia; cualquier equivalencia debe ser explícita.

## Hallazgos que afectan a la preparación

- **Nombres UPA:** 183 filas contienen ambos apellidos no vacíos dentro de «Nombre(s)». La fila restante tiene un primer apellido vacío. No concatenar campos ciegamente ni usar coincidencias con cadenas vacías para detectar apellidos incluidos.
- **Apellidos ausentes:** UAA tiene 37 filas con algún apellido vacío (8 primeros y 29 segundos); UTA tiene 5, UTNA 3 y UTR 5. No impiden representar el registro y no deben completarse por suposición.
- **Cotejo UAA:** el raw y el JSON actual del sitio tienen 3,665 filas. Coinciden 3,628 al comparar nombre completo, descripción de puesto, adscripción y ambos importes. Las otras 37 corresponden a apellidos ausentes en el raw: existe una coincidencia única por los componentes de nombre disponibles, puesto, área e importes. El JSON actual contiene apellidos que esa descarga no publica. No se determinó el origen de esa diferencia ni se cambió ningún nombre.
- **Cargo IPN:** vacío en 30,915 de 32,728 registros, aunque la descripción de puesto está presente. La interfaz actual usa el cargo; necesita una regla de presentación explícita antes de incorporar esta institución.
- **Neto mayor que bruto:** UANL 5,948 filas; UNAM 380; UTNA 2; UTR 22. Son alertas para revisar, no autorización para intercambiar, recalcular o descartar importes.
- **Ceros:** UAA tiene 7 netos cero; UAZ 1,476 filas con bruto y neto cero; UTR una fila con bruto y neto cero. No confundir cero con ausencia de información.
- **Descripción y cargo UAZ:** son diferentes en sus 11,297 filas. Deben conservar su significado; no son necesariamente campos redundantes.
- **Identidad:** ninguna muestra ofrece una columna principal explícita de identificador de empleado. Los IDs de subtablas no identifican personas. Un nombre repetido puede corresponder a nombramientos distintos o a homónimos.
- **Repeticiones:** IPN, UNAM, UDG, UAZ, UANL, UTA y UTNA contienen nombres o combinaciones de nombres y puesto repetidos. No se deben sumar ni eliminar automáticamente por ese motivo.
- **UNAM:** no aparecen descripciones de puesto con PROFESOR/PROFESORA en esta descarga. Eso no demuestra que la fuente carezca de información docente; la cobertura de profesores queda por verificar. En 2,931 notas se advierte sobre la interpretación conjunta de remuneraciones académicas y de funcionario.
- **Periodos:** la descarga de UDG contiene solo la segunda quincena de julio. El periodo de reporte no cambia automáticamente la periodicidad del importe: los campos principales siguen denominándose remuneraciones mensuales.
- **Complementos:** existen subtablas, periodicidades diferentes, declaraciones de «No aplica» y celdas vacías. No sumarlas al bruto/neto principal sin una decisión y evidencia que lo justifiquen.

## Resultado para la siguiente conversación

La extracción común sigue siendo viable con pocas variantes de encabezado y formato. El proceso puede detectar automáticamente los problemas anteriores y emitir un reporte, sin decidir por sí mismo su tratamiento.

Antes de publicar datos preparados hay que acordar las reglas para nombres, cargo frente a puesto, registros múltiples, alertas de importes y selección de periodo. No se han implementado reglas nuevas, transformaciones persistentes ni cambios al sitio en esta revisión.
