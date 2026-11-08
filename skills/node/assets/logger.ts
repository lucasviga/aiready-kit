import pino from 'pino';
import { env } from '../config/env';

type LogContext = Record<string, unknown>;

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
}

const REDACTED_PATHS = ['password', 'token', 'authorization', '*.password', '*.token'];

function createLogger(): Logger {
  const instance = pino({ level: env.LOG_LEVEL, redact: REDACTED_PATHS });
  return {
    debug(message, context) {
      instance.debug(context ?? {}, message);
    },
    info(message, context) {
      instance.info(context ?? {}, message);
    },
    warn(message, context) {
      instance.warn(context ?? {}, message);
    },
    error(message, context) {
      instance.error(context ?? {}, message);
    },
  };
}

export const logger = createLogger();
