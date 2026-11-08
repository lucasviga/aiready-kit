import type { Server } from 'node:http';
import type { Logger } from './logger';
import { env } from '../config/env';

type ShutdownTask = () => Promise<unknown>;

interface GracefulShutdownParams {
  server: Server;
  logger: Logger;
  onShutdown?: ShutdownTask[];
}

const SIGNALS: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
    server.closeIdleConnections();
  });
}

async function shutdown(params: GracefulShutdownParams, signal: string): Promise<void> {
  params.logger.info('Shutdown started', { signal });
  const forceExit = setTimeout(() => process.exit(1), env.SHUTDOWN_TIMEOUT_MS).unref();
  try {
    await closeServer(params.server);
    await Promise.allSettled((params.onShutdown ?? []).map((task) => task()));
    params.logger.info('Shutdown complete');
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    params.logger.error('Shutdown failed', { error });
    process.exit(1);
  }
}

export function registerGracefulShutdown(params: GracefulShutdownParams): void {
  let isShuttingDown = false;
  for (const signal of SIGNALS) {
    process.once(signal, () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      void shutdown(params, signal);
    });
  }
}
