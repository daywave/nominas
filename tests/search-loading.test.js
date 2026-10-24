import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';

// Solo simula los controles que usa el buscador; no requiere un navegador ni dependencias.
class Control {
  value = '';
  textContent = '';
  children = [];
  attributes = {};
  listeners = {};
  selectedIndex = 0;
  dataset = {};
  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  setAttribute(name, value) { this.attributes[name] = value; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  dispatch(name) { this.listeners[name]({ preventDefault() {} }); }
  get firstElementChild() { return this.children[0]; }
}

test('conserva búsqueda, filtros y enlace si se editan antes de terminar la descarga', async t => {
  const controls = new Map();
  const control = selector => {
    if (!controls.has(selector)) controls.set(selector, new Control());
    return controls.get(selector);
  };
  const groups = ['all', 'professors', 'others'].map(group => Object.assign(new Control(), { dataset: { group } }));
  const globals = ['document', 'window', 'location', 'history', 'fetch'];
  const previous = globals.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const location = { href: 'http://localhost/?q=Delia&area=COMUNICACION&orden=menor&persona=1' };
  let finishDownload;
  const downloaded = new Promise(resolve => { finishDownload = resolve; });
  Object.assign(globalThis, {
    document: { querySelector: control, querySelectorAll: () => groups, createElement: () => new Control() },
    window: { addEventListener() {} },
    location,
    history: { replaceState(_state, _title, url) { location.href = String(url); } },
    fetch: async () => {
      await downloaded;
      return { ok: true, json: async () => [
        { id: 1, nombre: 'DELIA ALMEIDA', nombres: 'DELIA', apellidos: 'ALMEIDA', puesto: 'JEFA', area: 'COMUNICACION', bruto: 200, neto: 100 },
        { id: 2, nombre: 'ANDRES GURROLA', nombres: 'ANDRES', apellidos: 'GURROLA', puesto: 'DISEÑADOR', area: 'COMUNICACION', bruto: 300, neto: 200 },
      ] };
    },
  });
  await import('../src/scripts/search.js');
  assert.equal(control('#search').value, 'Delia');
  assert.equal(control('#order').value, 'asc');

  control('#search').value = 'Andres';
  control('#search').dispatch('input');
  control('#order').value = 'desc';
  control('#order').dispatch('change');
  groups[2].dispatch('click');
  finishDownload();
  await setImmediate();

  assert.equal(control('#search').value, 'Andres');
  assert.equal(control('#order').value, 'desc');
  assert.equal(control('#area').value, 'COMUNICACION');
  assert.equal(groups[2].attributes['aria-pressed'], 'true');
  assert.equal(control('#results').children.length, 1);
  assert.equal(control('#results').children[0].children[0].children[0].title, 'Andres Gurrola');
  const url = new URL(location.href);
  assert.equal(url.searchParams.get('q'), 'Andres');
  assert.equal(url.searchParams.get('area'), 'COMUNICACION');
  assert.equal(url.searchParams.get('grupo'), 'others');
  assert.equal(url.searchParams.has('persona'), false);
  assert.equal(url.searchParams.has('orden'), false);
});
