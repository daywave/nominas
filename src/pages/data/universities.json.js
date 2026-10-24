import { discoverUniversities } from '../../lib/payroll.js';

export async function GET() {
  return new Response(JSON.stringify(await discoverUniversities()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
