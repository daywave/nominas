# Opinion service (AWS + Turnstile)

Start with the [project principles](../AGENTS.md) and [application architecture](../ARCHITECTURE.md). Payroll browsing stays static. This separate service stores recommendations and salary opinions; its failure must not prevent searching, reading, or sharing payroll records.

Lambda, DynamoDB and Hono are retained. Turnstile protects writes; it does not verify student identity or guarantee one person per vote. Opinion totals are public participation, not official payroll information or a representative survey.

## Request flow

1. Opening a person dialog loads the Turnstile script and renders a Managed widget (compact below 300px of available width). Merely browsing the table does not load it.
2. Voting is enabled only after counts load and a challenge token is available. One request can be sent at a time from the dialog.
3. `POST /votes/{prof_key}` includes the existing `choice`, `category`, `voter_token`, plus `turnstile_token`.
4. Lambda validates the token with Cloudflare **before any DynamoDB access**. Success must match the configured hostname and action `vote`.
5. The token is consumed once. The widget resets after success or failure; changing/withdrawing a vote requires a fresh token. Expiration and widget errors disable voting until verification succeeds again.

Missing backend configuration returns 503; missing/invalid verification returns 403; verification provider failures return 502. Siteverify has a two-second timeout. Browser POST requests time out after ten seconds; an interrupted response does not prove that the server rejected a vote.

`GET /votes/{prof_key}` remains public and does not require Turnstile. Invalid writes do not reach DynamoDB, but requests still invoke Lambda: Turnstile is not an AWS spending cap.

## Configuration

| Location | Setting | Visibility |
| --- | --- | --- |
| Frontend build | `PUBLIC_TURNSTILE_SITE_KEY` | Public; embedded in HTML. |
| Lambda environment | `TURNSTILE_SECRET_KEY` | Private; never include in frontend variables, commits, logs or screenshots. |
| Lambda environment | `TURNSTILE_HOSTNAME` | Exact expected hostname, without protocol, port or path. |

In Cloudflare Turnstile, use a **Managed** widget and authorize the production hostname. Put its public key in the frontend project's build environment, then rebuild/redeploy: changing an environment variable does not modify an existing static build. No npm dependency is needed; the official script loads directly from Cloudflare.

For the existing Lambda deployment, its owner can set the two backend variables under **Configuration → Environment variables**, and deploy the updated Lambda code. Set the hostname to `cuantoganamiprofe.sebhdz.com`. Both halves must be updated together: deploying the protected backend first makes old clients unable to vote.

The SAM template also declares `TurnstileSecretKey` (`NoEcho`) and `TurnstileHostname` parameters and maps them to those variables. Use the same settings when deploying through SAM; a future template deployment can overwrite console changes. Never save the secret in `samconfig.toml`, command history, parameter files or Git. `NoEcho` masks CloudFormation display; it does not sanitize local files. A blank secret deliberately disables writes.

AWS CLI and SAM CLI are required only for deployment, not for running the payroll website:

```sh
sam build -t aws/template.yaml
sam deploy --guided
```

When using guided deployment, do not save the secret parameter to a configuration file. Review the parameter values through the account owner's secure deployment process.

**Current deployment distinction:** the frontend still points to a Lambda Function URL, while `template.yaml` creates an API Gateway HTTP API. CORS must be configured on the entry point actually used. Turnstile works with either; this change does not migrate endpoints. CORS is not bot protection or authentication.

## Local development and checks

Copy the public settings example to an ignored local file:

```sh
cp .env.example .env
npm run dev
```

Without a public key, opinions stay disabled; payroll browsing still works. To exercise the widget locally, use Cloudflare's [official test keys](https://developers.cloudflare.com/turnstile/troubleshooting/testing/) and an isolated test backend configured with the matching test secret and `TURNSTILE_HOSTNAME=localhost`. The always-pass visible site key is `1x00000000000000000000AA`; its matching always-pass secret is `1x0000000000000000000000000000000AA`. Test tokens cannot be validated with a production secret. Never put test keys in production. The frontend API URL is currently set in `src/scripts/votes.js`; point a local experiment at the isolated test backend, not the live vote database.

```sh
npm test
npm run build
```

Automated tests mock the widget, network and Siteverify; they make no live votes and require no AWS credentials. They cover missing configuration, rejected/expired/replayed responses, hostname/action mismatch, network failures, single-use tokens, concurrent clicks and switching profiles during a submission.

Before production, manually check the widget on mobile/desktop, a valid vote, changing/withdrawing it, challenge errors and a blocked Cloudflare script. Verify that direct POST requests without a valid token are rejected and that payroll browsing still works when opinions are unavailable.

## Pending production guardrails

Turnstile integration does not complete the broader opinion-service review. AWS request/concurrency limits, budget alerts and a service shutdown procedure still need account-owner configuration. The existing university/name identity and database counter concurrency behavior also remain pending the agreed follow-up; this change does not migrate stored opinions or fix simultaneous writes from different clients.

Reference: [client rendering](https://developers.cloudflare.com/turnstile/get-started/client-side-rendering/) and [server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).
