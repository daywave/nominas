// No database access is allowed until this validation succeeds.
export async function verifyTurnstile(token, { secret, hostname }, fetcher = fetch) {
  if (!secret || !hostname) return { status: 503, error: 'Las opiniones no están habilitadas' };
  if (typeof token !== 'string' || !token.trim() || token.length > 2048) {
    return { status: 403, error: 'Verificación anti-bot requerida' };
  }
  try {
    const response = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, response: token }),
      signal: AbortSignal.timeout(2000),
    });
    if (!response.ok) throw new Error('Siteverify unavailable');
    const result = await response.json();
    if (result.success !== true || result.hostname !== hostname || result.action !== 'vote') {
      return { status: 403, error: 'Verificación anti-bot rechazada' };
    }
    return null;
  } catch {
    return { status: 502, error: 'No se pudo verificar la protección anti-bot' };
  }
}
