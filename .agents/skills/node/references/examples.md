# Node.js — examples

## async/await instead of callbacks

Avoid:

```ts
fs.readFile(path, 'utf8', (error, data) => {
  if (error) return done(error);
  db.save(JSON.parse(data), (saveError) => {
    if (saveError) return done(saveError);
    done(null);
  });
});
```

Prefer:

```ts
import { readFile } from 'node:fs/promises';

async function importFile(path: string): Promise<void> {
  const data = await readFile(path, 'utf8');
  await db.save(JSON.parse(data));
}
```

## Never block the event loop

Avoid — every request waits for this CPU work:

```ts
app.post('/reports', (req, res) => {
  const report = buildHugeReport(req.body);
  const hash = crypto.pbkdf2Sync(report, salt, 600000, 64, 'sha512');
  res.json({ hash });
});
```

Prefer — async crypto and a worker for heavy work:

```ts
import { Worker } from 'node:worker_threads';

function runReportWorker(input: ReportInput): Promise<Report> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/report.worker.js', import.meta.url), { workerData: input });
    worker.once('message', resolve);
    worker.once('error', reject);
  });
}

app.post('/reports', async (req, res) => {
  const report = await runReportWorker(req.body);
  res.json(report);
});
```

Also: stream large files (`createReadStream` + `pipeline`) instead of `readFileSync`, and split long loops into batches when a worker is overkill.

## Environment variables with dotenv

Avoid:

```ts
const port = 3000;
const dbUrl = 'postgres://admin:secret@localhost/app';
```

Prefer — see `assets/env.ts`:

```ts
import { env } from './config/env';

app.listen(env.PORT);
connect(env.DATABASE_URL);
```

## Graceful shutdown

Avoid — the process dies mid-request and leaves connections open:

```ts
process.on('SIGTERM', () => process.exit(0));
```

Prefer — see `assets/graceful-shutdown.ts`:

```ts
const server = app.listen(env.PORT);

registerGracefulShutdown({
  server,
  logger,
  onShutdown: [() => prisma.$disconnect(), () => queue.close()],
});
```

## Centralized logging adapter

Avoid:

```ts
console.log('user created', user.id);
```

Prefer — one adapter, structured context:

```ts
import { logger } from '../shared/logger';

logger.info('User created', { userId: user.id });
logger.error('Payment failed', { orderId, error });
```

## Lockfiles and circular dependencies

```bash
git add package-lock.json
npm ci
npx madge --circular --extensions ts src
```

Avoid — `user.service.ts` imports `order.service.ts`, which imports `user.service.ts`.

Prefer — extract the shared piece into a third module (e.g. `customer-lookup.ts`) or depend on an interface injected from outside.
