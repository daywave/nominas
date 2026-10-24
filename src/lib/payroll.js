import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

// Astro bundles this module before prerendering, so import.meta.url no longer
// points to src/lib. Builds run from the project root, as documented.
const processedRoot = path.resolve('data/processed');

export async function readPayroll(file) {
  const data = JSON.parse(await readFile(file, 'utf8'));
  if (data.estado === 'bloqueado' || !data.institucion?.trim() || !Array.isArray(data.registros) || !data.registros.length) {
    throw new Error(`Invalid or blocked prepared payroll: ${file}`);
  }
  return data;
}

// Build-time discovery only. No handwritten registry or runtime filesystem access.
export async function discoverUniversities(root = processedRoot) {
  const universities = [];
  for (const directory of await readdir(root, { withFileTypes: true })) {
    if (!directory.isDirectory() || directory.name.startsWith('.')) continue;
    const years = (await readdir(path.join(root, directory.name), { withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && /^\d{4}$/.test(entry.name))
      .map((entry) => entry.name).sort().reverse();
    if (!years.length) throw new Error(`No reporting year in ${directory.name}`);
    const year = years[0];
    const file = path.join(root, directory.name, year, 'nomina.json');
    const data = await readPayroll(file);
    if (data.identificadorInstitucion !== directory.name || data.anio !== year) {
      throw new Error(`Prepared payroll does not match its directory: ${file}`);
    }
    universities.push({
      id: directory.name,
      name: data.institucion.replace(/^[A-Z]{3}\s+-\s+/, ''),
      year,
      period: data.registros[0].periodo,
      updates: [...new Set(data.registros.map((record) => record.actualizacionFuente).filter(Boolean))].sort(),
      records: data.registros.length,
      url: `/data/${directory.name}/${year}.json`,
    });
  }
  return universities.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

export function toSearchPeople(data) {
  return data.registros.map((record) => {
    const nombres = record.nombre.nombres || '';
    const apellidos = [record.nombre.primerApellido, record.nombre.segundoApellido].filter(Boolean).join(' ');
    const givenWords = nombres.split(/\s+/);
    const surnameWords = apellidos.split(/\s+/);
    const includesSurnames = Boolean(apellidos) && givenWords.length > surnameWords.length &&
      givenWords.slice(-surnameWords.length).join(' ').toUpperCase() === surnameWords.join(' ').toUpperCase();
    return {
      // This identifies a source row, not a person across periods. Changing the
      // input invalidates old row links rather than pointing to another person.
      id: `${data.fuente.sha256.slice(0, 16)}-${record.origen.fila}`,
      nombre: includesSurnames ? nombres : [nombres, apellidos].filter(Boolean).join(' '),
      nombres: includesSurnames ? givenWords.slice(0, -surnameWords.length).join(' ') : nombres,
      apellidos,
      puesto: record.cargo ?? record.puesto,
      puesto_base: record.puesto,
      area: record.area,
      bruto: record.remuneracionMensual.bruto,
      neto: record.remuneracionMensual.neto,
      actualizacion: record.actualizacionFuente,
    };
  });
}

export async function getSearchDataset(id, year) {
  const data = await readPayroll(path.join(processedRoot, id, year, 'nomina.json'));
  return toSearchPeople(data);
}
