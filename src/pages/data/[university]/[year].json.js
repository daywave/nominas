import { discoverUniversities, getSearchDataset } from '../../../lib/payroll.js';

export async function getStaticPaths() {
  return (await discoverUniversities()).map(({ id, year }) => ({
    params: { university: id, year },
  }));
}

export async function GET({ params }) {
  return new Response(JSON.stringify(await getSearchDataset(params.university, params.year)), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
