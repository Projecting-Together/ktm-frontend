type LogLevel = "debug" | "info" | "warn" | "error";
type LogContext = Record<string, unknown>;

const LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

function resolveMinLevel(): LogLevel {
  const override = process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel | undefined;
  if (override && override in LEVELS) return override;
  return process.env.NODE_ENV === "production" ? "warn" : "debug";
}

const MIN_LEVEL = LEVELS[resolveMinLevel()];

function shouldEmit(level: LogLevel): boolean {
  if (typeof window === "undefined") return false;
  return LEVELS[level] >= MIN_LEVEL;
}

function formatDev(level: LogLevel, message: string, context?: LogContext): void {
  const prefix = `[${level.toUpperCase()}]`;
  if (context !== undefined) {
    console[level === "debug" || level === "info" ? "log" : level](`${prefix} ${message}`, context);
  } else {
    console[level === "debug" || level === "info" ? "log" : level](`${prefix} ${message}`);
  }
}

function formatProd(level: LogLevel, message: string, context?: LogContext): void {
  const entry = JSON.stringify({
    level,
    message,
    ...(context ? { context } : {}),
    timestamp: new Date().toISOString(),
  });
  if (level === "error") {
    console.error(entry);
  } else {
    console.warn(entry);
  }
}

function emit(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldEmit(level)) return;
  if (process.env.NODE_ENV === "production") {
    formatProd(level, message, context);
  } else {
    formatDev(level, message, context);
  }
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    emit("debug", message, context);
  },
  info(message: string, context?: LogContext): void {
    emit("info", message, context);
  },
  warn(message: string, context?: LogContext): void {
    emit("warn", message, context);
  },
  error(message: string, context?: LogContext): void {
    emit("error", message, context);
  },
};
