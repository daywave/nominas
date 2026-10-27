import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyTurnstile } from '../aws/lambda/votes/turnstile.js';

const config = { secret: 'test-secret', hostname: 'example.com' };
const valid = { success: true, hostname: 'example.com', action: 'vote' };
const respond = result => async () => ({ ok: true, json: async () => result });

test('Turnstile fails closed when configuration or token is missing', async () => {
  const unexpected = () => assert.fail('Should not contact Siteverify');
  assert.equal((await verifyTurnstile('token', {}, unexpected)).status, 503);
  assert.equal((await verifyTurnstile('token', { secret: 'test' }, unexpected)).status, 503);
  for (const token of [undefined, null, 123, '', ' ', 'x'.repeat(2049)]) {
    assert.equal((await verifyTurnstile(token, config, unexpected)).status, 403);
  }
});

test('Turnstile requires success, exact hostname and vote action', async () => {
  for (const result of [
    { ...valid, success: false, 'error-codes': ['timeout-or-duplicate'] },
    { ...valid, success: 'true' },
    { ...valid, hostname: 'another.example.com' },
    { ...valid, action: 'login' },
    { success: true },
  ]) {
    assert.equal((await verifyTurnstile('token', config, respond(result))).status, 403);
  }
});

test('Turnstile sends the token server-side and accepts a verified response', async () => {
  let calls = 0;
  const result = await verifyTurnstile('token', config, async (url, options) => {
    calls++;
    assert.equal(url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { secret: 'test-secret', response: 'token' });
    assert.ok(options.signal instanceof AbortSignal);
    return { ok: true, json: async () => valid };
  });
  assert.equal(calls, 1);
  assert.equal(result, null);
});

test('Turnstile rejects provider, network and malformed-response failures', async () => {
  for (const fetcher of [
    async () => { throw new Error('offline'); },
    async () => { throw new DOMException('Timed out', 'TimeoutError'); },
    async () => ({ ok: false }),
    async () => ({ ok: true, json: async () => { throw new Error('invalid JSON'); } }),
  ]) {
    assert.equal((await verifyTurnstile('token', config, fetcher)).status, 502);
  }
});
