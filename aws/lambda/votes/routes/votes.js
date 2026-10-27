import { Hono } from 'hono';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import crypto from 'node:crypto';
import { verifyTurnstile } from '../turnstile.js';

const client = new DynamoDBClient({});
const ddb = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.VOTES_TABLE || 'NominasVotes';
const TURNSTILE_SECRET = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_HOSTNAME = process.env.TURNSTILE_HOSTNAME;
const SECRET_SALT = process.env.HASH_SALT || 'nominas_secret_salt_2026';

const SALARY_CHOICES = ['more', 'fair', 'less', 'cancel', 'cancel_salary'];
const RECOMMEND_CHOICES = ['yes', 'no', 'cancel', 'cancel_recommend'];

export const votesRouter = new Hono();

votesRouter.use('/:prof_key', async (c, next) => {
  const profKey = c.req.param('prof_key');
  if (!profKey || !/^[a-f0-9]{8,32}$/i.test(profKey)) {
    return c.json({ error: 'prof_key inválido' }, 400);
  }
  await next();
});

votesRouter.get('/:prof_key', async (c) => {
  const profKey = c.req.param('prof_key').toLowerCase();

  try {
    const res = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `PROF#${profKey}`, SK: 'STATS' },
    }));

    const stats = res.Item || {};
    const totalRec = stats.total_recommendations || 0;
    const recYes = stats.recommends_yes || 0;
    const recNo = stats.recommends_no || 0;
    const recommendPct = totalRec > 0 ? Math.round((recYes / totalRec) * 100) : null;

    return c.json({
      prof_key: profKey,
      deserves_more: stats.deserves_more || 0,
      is_fair: stats.is_fair || 0,
      deserves_less: stats.deserves_less || 0,
      total_votes: stats.total_votes || 0,
      recommends_yes: recYes,
      recommends_no: recNo,
      total_recommendations: totalRec,
      recommend_percentage: recommendPct,
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Error al consultar estadísticas' }, 500);
  }
});

votesRouter.post('/:prof_key', async (c) => {
  const profKey = c.req.param('prof_key').toLowerCase();

  let body;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ error: 'JSON inválido' }, 400);
  }

  const { choice, category, voter_token, turnstile_token } = body || {};

  const isRecommend = category === 'recommend' || ['yes', 'no', 'cancel_recommend'].includes(choice);
  const isSalary = category === 'salary' || ['more', 'fair', 'less', 'cancel_salary'].includes(choice) || (!isRecommend && choice === 'cancel');

  if (!isRecommend && !isSalary) {
    return c.json({ error: 'Opción no reconocida' }, 400);
  }

  const validChoices = isRecommend ? RECOMMEND_CHOICES : SALARY_CHOICES;
  if (!choice || !validChoices.includes(choice)) {
    return c.json({ error: 'Opción inválida' }, 400);
  }

  if (!voter_token || typeof voter_token !== 'string' || voter_token.length < 10) {
    return c.json({ error: 'voter_token inválido' }, 400);
  }

  const verificationError = await verifyTurnstile(turnstile_token, {
    secret: TURNSTILE_SECRET, hostname: TURNSTILE_HOSTNAME,
  });
  if (verificationError) return c.json({ error: verificationError.error }, verificationError.status);

  const voterHash = crypto
    .createHmac('sha256', SECRET_SALT)
    .update(voter_token.trim())
    .digest('hex')
    .slice(0, 24);

  const pk = `PROF#${profKey}`;
  const skVoter = isRecommend ? `RECOMMEND#${voterHash}` : `VOTER#${voterHash}`;
  const isCancel = choice === 'cancel' || choice === 'cancel_salary' || choice === 'cancel_recommend';

  try {
    const prevRes = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: skVoter },
    }));
    const prevChoice = prevRes.Item?.choice;

    if (prevChoice !== choice || isCancel) {
      const transactItems = [];

      if (isRecommend) {
        let deltaYes = 0;
        let deltaNo = 0;
        let deltaTotal = 0;

        if (prevChoice === 'yes') { deltaYes -= 1; deltaTotal -= 1; }
        if (prevChoice === 'no') { deltaNo -= 1; deltaTotal -= 1; }

        if (choice === 'yes') { deltaYes += 1; deltaTotal += 1; }
        if (choice === 'no') { deltaNo += 1; deltaTotal += 1; }

        transactItems.push({
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: pk, SK: 'STATS' },
            UpdateExpression: 'ADD recommends_yes :y, recommends_no :n, total_recommendations :t SET updated_at = :now',
            ExpressionAttributeValues: {
              ':y': deltaYes,
              ':n': deltaNo,
              ':t': deltaTotal,
              ':now': new Date().toISOString(),
            },
          },
        });
      } else {
        let deltaMore = 0;
        let deltaFair = 0;
        let deltaLess = 0;
        let deltaTotal = 0;

        if (prevChoice === 'more') { deltaMore -= 1; deltaTotal -= 1; }
        if (prevChoice === 'fair') { deltaFair -= 1; deltaTotal -= 1; }
        if (prevChoice === 'less') { deltaLess -= 1; deltaTotal -= 1; }

        if (choice === 'more') { deltaMore += 1; deltaTotal += 1; }
        if (choice === 'fair') { deltaFair += 1; deltaTotal += 1; }
        if (choice === 'less') { deltaLess += 1; deltaTotal += 1; }

        transactItems.push({
          Update: {
            TableName: TABLE_NAME,
            Key: { PK: pk, SK: 'STATS' },
            UpdateExpression: 'ADD deserves_more :m, is_fair :f, deserves_less :l, total_votes :t SET updated_at = :now',
            ExpressionAttributeValues: {
              ':m': deltaMore,
              ':f': deltaFair,
              ':l': deltaLess,
              ':t': deltaTotal,
              ':now': new Date().toISOString(),
            },
          },
        });
      }

      if (isCancel) {
        transactItems.push({
          Delete: {
            TableName: TABLE_NAME,
            Key: { PK: pk, SK: skVoter },
          },
        });
      } else {
        transactItems.push({
          Put: {
            TableName: TABLE_NAME,
            Item: {
              PK: pk,
              SK: skVoter,
              choice,
              created_at: Math.floor(Date.now() / 1000),
            },
          },
        });
      }

      await ddb.send(new TransactWriteCommand({ TransactItems: transactItems }));
    }

    const freshRes = await ddb.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: pk, SK: 'STATS' },
    }));
    const fresh = freshRes.Item || {};

    const totalRec = Math.max(0, fresh.total_recommendations || 0);
    const recYes = Math.max(0, fresh.recommends_yes || 0);
    const recNo = Math.max(0, fresh.recommends_no || 0);
    const recommendPct = totalRec > 0 ? Math.round((recYes / totalRec) * 100) : null;

    return c.json({
      prof_key: profKey,
      deserves_more: Math.max(0, fresh.deserves_more || 0),
      is_fair: Math.max(0, fresh.is_fair || 0),
      deserves_less: Math.max(0, fresh.deserves_less || 0),
      total_votes: Math.max(0, fresh.total_votes || 0),
      recommends_yes: recYes,
      recommends_no: recNo,
      total_recommendations: totalRec,
      recommend_percentage: recommendPct,
      user_choice: isCancel ? null : choice,
      category: isRecommend ? 'recommend' : 'salary',
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Error al registrar el voto' }, 500);
  }
});
