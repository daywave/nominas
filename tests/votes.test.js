import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';

class Control {
  dataset = {};
  style = {};
  textContent = '';
  disabled = true;
  listeners = {};
  setAttribute() {}
  addEventListener(name, fn) { this.listeners[name] = fn; }
  click() { return this.listeners.click?.(); }
}
const empty = { deserves_more: 0, is_fair: 0, deserves_less: 0, total_votes: 0,
  recommends_yes: 0, recommends_no: 0, total_recommendations: 0 };
const response = data => ({ ok: true, json: async () => data });

function environment(t) {
  const names = ['document', 'window', 'localStorage', 'fetch'];
  const originals = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  t.after(() => {
    for (const [name, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, name, descriptor);
      else delete globalThis[name];
    }
  });
  const controls = new Map();
  const el = id => {
    if (!controls.has(id)) controls.set(id, new Control());
    return controls.get(id);
  };
  const storage = new Map();
  let widget, resets = 0;
  Object.assign(globalThis, {
    document: { getElementById: el },
    window: { turnstile: {
      render(_container, options) { widget = options; return 'widget'; },
      reset() { resets++; },
      remove() {},
    } },
    localStorage: { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) },
  });
  return { el, storage, get widget() { return widget; }, get resets() { return resets; } };
}

test('opinion buttons require widget success, block concurrent clicks and ignore stale profile responses', async t => {
  const env = environment(t);
  env.el('vote-turnstile').dataset.sitekey = 'test-sitekey';
  const votes = await import('../src/scripts/votes.js?turnstile-flow');
  t.after(() => votes.resetPerception());
  votes.setupPerceptionListeners();
  const posts = [];
  let finishPost;
  globalThis.fetch = async (_url, options = {}) => {
    if (options.method !== 'POST') return response(empty);
    posts.push(JSON.parse(options.body));
    return new Promise(resolve => { finishPost = resolve; });
  };
  await votes.loadPerception('test', 'First person');
  assert.equal(env.widget.action, 'vote');
  await env.el('vote-more').click();
  assert.equal(posts.length, 0);
  assert.equal(env.el('vote-more').disabled, true);

  env.widget.callback('first-token');
  assert.equal(env.el('vote-more').disabled, false);
  const firstVote = env.el('vote-more').click();
  assert.equal('turnstile_token' in posts[0], false);
  assert.equal(env.el('vote-more').disabled, true);
  await env.el('vote-fair').click();
  assert.equal(posts.length, 1);
  finishPost(response({ ...empty, deserves_more: 1, total_votes: 1, user_choice: 'more' }));
  await firstVote;
  assert.equal(env.resets, 0);
  assert.equal(env.el('vote-more').disabled, false);
  assert.equal(env.el('perception-status').textContent, 'Opinión registrada');

  env.widget.callback('second-token');
  const failedVote = env.el('vote-fair').click();
  finishPost({ ok: false, status: 403 });
  await failedVote;
  assert.equal(env.resets, 0);
  assert.match(env.el('perception-status').textContent, /No se pudo registrar/);
  assert.equal(env.el('count-more').textContent, '1');

  env.widget.callback('third-token');
  const staleVote = env.el('vote-less').click();
  await votes.loadPerception('test', 'Second person');
  env.widget.callback('new-profile-token');
  finishPost(response({ ...empty, deserves_less: 1, total_votes: 1, user_choice: 'less' }));
  await staleVote;
  assert.equal(env.el('count-less').textContent, '0');
  assert.equal(env.el('vote-more').disabled, false);
  assert.equal(env.resets, 0, 'an old response must not reset the new profile challenge');
  assert.equal(Object.keys(JSON.parse(env.storage.get('nominas_user_votes'))).length, 1);

  env.widget['expired-callback']();
  assert.equal(env.el('vote-more').disabled, true);
  assert.equal(env.resets, 1);
  env.widget['error-callback']();
  assert.equal(env.el('retry-verification').hidden, false);
  env.el('retry-verification').click();
  assert.equal(env.resets, 2);
  await setImmediate();
});

test('without a public key payroll opinions stay disabled and no Turnstile script loads', async t => {
  const env = environment(t);
  delete globalThis.window.turnstile;
  globalThis.fetch = async () => response(empty);
  const votes = await import('../src/scripts/votes.js?missing-turnstile');
  t.after(() => votes.resetPerception());
  votes.setupPerceptionListeners();
  await votes.loadPerception('test', 'Person');
  assert.equal(env.el('vote-more').disabled, true);
  assert.match(env.el('vote-verification-status').textContent, /no están habilitadas/);
});


test('a blocked Turnstile script can be retried and late loading cannot render a closed dialog', async t => {
  const env = environment(t);
  env.el('vote-turnstile').dataset.sitekey = 'test-sitekey';
  delete window.turnstile;
  const scripts = [];
  document.createElement = () => ({ remove() {} });
  document.head = { append(script) { scripts.push(script); } };
  const { createTurnstile } = await import('../src/scripts/turnstile.js');
  let state;
  const challenge = createTurnstile(env.el('vote-turnstile'), (...values) => { state = values; });
  const firstAttempt = challenge.start();
  assert.equal(scripts.length, 1);
  scripts[0].onerror();
  await firstAttempt;
  assert.equal(state[0], false);
  assert.equal(state[2], true, 'failure exposes an explicit retry');

  const secondAttempt = challenge.reset();
  assert.equal(scripts.length, 2);
  challenge.destroy();
  window.turnstile = { render() { assert.fail('closed dialog must not render'); } };
  scripts[1].onload();
  await secondAttempt;
});
