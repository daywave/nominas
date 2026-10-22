export function normalize(value) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
}

export function isProfessor(person) {
  return /^(prof\.|profesor)/.test(normalize(person.puesto_base || person.puesto));
}

export function findPeople(records, query, { area = '', group = 'all' } = {}) {
  const phrase = normalize(query);
  const terms = phrase.split(/\s+/).filter(Boolean);
  return records.filter(person => {
    if (area && person.area !== area) return false;
    if (group === 'professors' && !isProfessor(person)) return false;
    if (group === 'others' && isProfessor(person)) return false;
    const text = normalize(`${person.nombre} ${person.area} ${person.puesto} ${person.puesto_base || ''}`);
    return terms.every(term => text.includes(term));
  }).sort((a, b) => (b.bruto - a.bruto) || a.nombre.localeCompare(b.nombre, 'es'));
}
