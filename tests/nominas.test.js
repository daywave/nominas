import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { campos, parseAmount, parseDate, prepare } from '../scripts/nominas/prepare.js';
import { prepareYear, runPipeline } from '../scripts/nominas/index.js';

function fixture(overrides = {}) {
  const values = {
    ejercicio: '2026', inicio: '01/04/2026', fin: '2026-06-30 00:00:00', tipo: 'Docente',
    clave: '1', puesto: 'PROFESORA', cargo: 'PROFESORA TITULAR', area: 'CIENCIAS',
    nombres: 'ANA', primerApellido: 'PEREZ', segundoApellido: 'LOPEZ', sexo: 'Mujer',
    bruto: '1000.25', monedaBruto: 'PESOS', neto: '800.50', monedaNeto: 'PESOS',
    actualizacion: '02/07/2026', nota: 'Nota original', ...overrides,
  };
  return { institucion: 'Universidad de prueba', columnas: Object.values(campos), filas: [Object.keys(campos).map((field) => values[field])] };
}
const source = { archivo: 'data/raw/prueba.json', sha256: 'test' };
const run = (raw) => prepare(raw, source, '2026');

test('amounts distinguish absence from zero and reject ambiguous or unsafe formats', () => {
  for (const value of ['', ' ', null, undefined, '1,000.00', '$100', '1e3', '9007199254740992']) assert.equal(parseAmount(value), null);
  assert.equal(parseAmount('0'), 0);
  assert.equal(parseAmount(' 123.45 '), 123.45);
  assert.equal(parseAmount('-25.50'), -25.5);
  assert.equal(parseAmount('24361.45125'), 24361.45125);
});

test('dates validate calendar days instead of silently rolling them over', () => {
  assert.equal(parseDate('29/02/2024'), '2024-02-29');
  assert.equal(parseDate('2026-06-30 00:00:00'), '2026-06-30');
  for (const value of ['29/02/2026', '31/04/2026', '2026-13-01', '', null]) assert.equal(parseDate(value), null);
});

test('headers can move and extra columns cannot shift source dates or notes', () => {
  const raw = fixture();
  raw.columnas.unshift('Nombre del(a) funcionario(a) responsable de generar la información');
  raw.filas[0].unshift('OTRA PERSONA');
  raw.columnas.reverse();
  raw.filas[0].reverse();
  raw.columnas = raw.columnas.map((header) => ` ${header.toUpperCase()} `);
  const { candidato, reporte } = run(raw);
  assert.equal(reporte.errores, 0);
  assert.equal(candidato.registros[0].actualizacionFuente, '2026-07-02');
  assert.equal(candidato.registros[0].nota, 'Nota original');
  assert.equal(candidato.registros[0].remuneracionMensual.bruto, 1000.25);
});

test('records, incomplete names, repeated names, zero and net above gross are retained', () => {
  const raw = fixture({ nombres: 'ANA PEREZ', segundoApellido: '', bruto: '0', neto: '20' });
  raw.filas.push([...raw.filas[0]]);
  const before = structuredClone(raw);
  const { candidato, reporte } = run(raw);
  assert.deepEqual(raw, before);
  assert.equal(candidato.registros.length, 2);
  assert.equal(candidato.registros[0].nombre.nombres, 'ANA PEREZ');
  assert.equal(candidato.registros[0].nombre.segundoApellido, null);
  assert.equal(candidato.registros[0].remuneracionMensual.bruto, 0);
  assert.equal(reporte.conteos.neto_mayor_que_bruto, 2);
  assert.equal(reporte.conteos.nombre_repetido, 2);
  assert.equal(reporte.conteos.posible_apellido_en_nombres, 2);
  assert.deepEqual(candidato.registros.map((r) => r.origen.fila), [1, 2]);
});

test('invalid cells remain traceable as null and do not remove rows', () => {
  const { candidato, reporte } = run(fixture({ bruto: '', neto: '1,000', monedaNeto: '123.45' }));
  assert.equal(candidato.registros.length, 1);
  assert.equal(candidato.registros[0].remuneracionMensual.bruto, null);
  assert.equal(reporte.conteos.importe_ausente_o_invalido, 2);
  assert.equal(reporte.conteos.moneda_por_revisar, 1);
});

test('extra decimal places are preserved and flagged without rounding', () => {
  const { candidato, reporte } = run(fixture({ bruto: '24361.45125', neto: '9771.599999999999' }));
  assert.equal(candidato.registros[0].remuneracionMensual.bruto, 24361.45125);
  assert.equal(candidato.registros[0].remuneracionMensual.neto, 9771.599999999999);
  assert.equal(reporte.conteos.importe_mas_de_dos_decimales, 2);
});

test('missing or duplicated headers, malformed rows and missing institution block the file', () => {
  const variants = [fixture(), fixture(), fixture(), fixture()];
  variants[0].columnas[0] = 'Campo desconocido';
  variants[1].columnas.push(campos.bruto);
  variants[1].filas[0].push('100');
  variants[2].filas[0].pop();
  variants[3].institucion = '';
  for (const raw of variants) {
    const { candidato, reporte } = run(raw);
    assert.equal(candidato.estado, 'bloqueado');
    assert.equal(candidato.registros.length, 0);
    assert.ok(reporte.errores > 0);
  }
});

test('multiple periods, conflicting years and invalid reporting dates block the entire input', () => {
  const multiple = fixture();
  multiple.filas.push(fixture({ inicio: '01/07/2026', fin: '30/09/2026' }).filas[0]);
  const cases = [
    [multiple, 'multiples_periodos'],
    [fixture({ ejercicio: '2025' }), 'anio_no_coincide'],
    [fixture({ inicio: '01/04/2025', fin: '30/06/2025' }), 'anio_no_coincide'],
    [fixture({ inicio: '31/04/2026' }), 'fecha_periodo_invalida'],
    [fixture({ inicio: '01/07/2026', fin: '30/06/2026' }), 'periodo_invertido'],
  ];
  for (const [raw, code] of cases) {
    const { candidato, reporte } = run(raw);
    assert.equal(candidato.estado, 'bloqueado');
    assert.deepEqual(candidato.registros, []);
    assert.ok(reporte.conteos[code] > 0);
  }
});

async function workspace(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'nominas-discovery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  return root;
}

async function putInput(root, id, year, raw = fixture()) {
  const directory = path.join(root, 'data/raw', id, year);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'descarga.json'), JSON.stringify(raw));
  return directory;
}

test('institution mode discovers all its years without registration and isolates other institutions', async (t) => {
  const root = await workspace(t);
  await putInput(root, 'nueva-universidad', '2026');
  await putInput(root, 'nueva-universidad', '2025', fixture({ ejercicio: '2025', inicio: '01/04/2025', fin: '30/06/2025' }));
  await putInput(root, 'otra', '2026');
  assert.equal(await runPipeline('nueva-universidad', root, () => {}), 0);
  for (const year of ['2025', '2026']) {
    const candidate = JSON.parse(await readFile(path.join(root, `data/processed/nueva-universidad/${year}/nomina.json`)));
    assert.equal(candidate.anio, year);
    assert.equal(candidate.identificadorInstitucion, 'nueva-universidad');
    assert.equal(candidate.institucion, 'Universidad de prueba');
    assert.equal(candidate.registros.length, 1);
  }
  await assert.rejects(readFile(path.join(root, 'data/processed/otra/2026/nomina.json')), { code: 'ENOENT' });
  assert.equal(await runPipeline(null, root, () => {}), 0);
  assert.ok(await readFile(path.join(root, 'data/processed/otra/2026/nomina.json')));
});

test('multiple files block a year, invalidate stale output and do not stop other years', async (t) => {
  const root = await workspace(t);
  const directory = await putInput(root, 'prueba', '2026');
  await putInput(root, 'prueba', '2025', fixture({ ejercicio: '2025', inicio: '01/04/2025', fin: '30/06/2025' }));
  await runPipeline('prueba', root, () => {});
  await writeFile(path.join(directory, 'segunda.json'), JSON.stringify(fixture()));
  assert.equal(await runPipeline(null, root, () => {}), 1);
  const blocked = JSON.parse(await readFile(path.join(root, 'data/processed/prueba/2026/nomina.json')));
  assert.equal(blocked.estado, 'bloqueado');
  assert.deepEqual(blocked.registros, []);
  const report = JSON.parse(await readFile(path.join(root, 'data/reports/prueba/2026/revision.json')));
  assert.equal(report.conteos.archivo_unico_requerido, 1);
  const valid = JSON.parse(await readFile(path.join(root, 'data/processed/prueba/2025/nomina.json')));
  assert.equal(valid.estado, 'pendiente_revision');
});

test('invalid identifiers, unknown institutions and invalid folder layouts fail explicitly', async (t) => {
  const root = await workspace(t);
  await putInput(root, 'prueba', '2026');
  await assert.rejects(runPipeline('../prueba', root, () => {}));
  await assert.rejects(runPipeline('con espacios', root, () => {}));
  await assert.rejects(runPipeline('ausente', root, () => {}));
  await mkdir(path.join(root, 'data/raw/prueba/no-es-un-anio'));
  assert.equal(await runPipeline('prueba', root, () => {}), 1);
  await mkdir(path.join(root, 'data/raw/con espacios'));
  assert.equal(await runPipeline(null, root, () => {}), 1);
});

test('local execution is reproducible, preserves originals and invalidates stale candidates', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'nominas-test-'));
  try {
    await mkdir(path.join(root, 'data/raw/prueba/2026'), { recursive: true });
    const original = JSON.stringify(fixture());
    const input = path.join(root, 'data/raw/prueba/2026/descarga.json');
    await writeFile(input, original);
    const first = await prepareYear('prueba', '2026', root);
    const output = path.join(root, 'data/processed/prueba/2026/nomina.json');
    const bytes = await readFile(output, 'utf8');
    assert.match(first.fuente.sha256, /^[a-f0-9]{64}$/);
    await prepareYear('prueba', '2026', root);
    assert.equal(await readFile(output, 'utf8'), bytes);
    assert.equal(await readFile(input, 'utf8'), original);
    await writeFile(input, '{');
    const failed = await prepareYear('prueba', '2026', root);
    assert.equal(failed.conteos.json_invalido, 1);
    assert.deepEqual(JSON.parse(await readFile(output, 'utf8')).registros, []);
    await rm(input);
    const missing = await prepareYear('prueba', '2026', root);
    assert.equal(missing.conteos.archivo_unico_requerido, 1);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
