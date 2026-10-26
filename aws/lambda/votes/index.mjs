import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { handle } from 'hono/aws-lambda';
import { votesRouter } from './routes/votes.js';

const app = new Hono();

app.use('*', logger());
app.get('/health', (c) => c.json({ status: 'ok', service: 'nominas-votes' }));
app.route('/votes', votesRouter);

app.notFound((c) => c.json({ error: 'Not found' }, 404));
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal error' }, 500);
});

export const handler = handle(app);
