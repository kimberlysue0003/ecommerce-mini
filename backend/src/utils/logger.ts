// Simple logging utility with color coding
// Formats log messages with timestamps and severity levels

import { isDevelopment } from '../config/env.js';

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  SUCCESS = 'SUCCESS',
}

const colors = {
  INFO: '\x1b[36m',    // Cyan
  WARN: '\x1b[33m',    // Yellow
  ERROR: '\x1b[31m',   // Red
  DEBUG: '\x1b[35m',   // Magenta
  SUCCESS: '\x1b[32m', // Green
  RESET: '\x1b[0m',
};

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const color = colors[level];
    const reset = colors.RESET;

    let logMessage = `${color}[${timestamp}] [${level}]${reset} ${message}`;

    if (meta && isDevelopment()) {
      logMessage += `\n${JSON.stringify(meta, null, 2)}`;
    }

    return logMessage;
  }

  info(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  warn(message: string, meta?: any): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  error(message: string, error?: any): void {
    const meta = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    console.error(this.formatMessage(LogLevel.ERROR, message, meta));
  }

  debug(message: string, meta?: any): void {
    if (isDevelopment()) {
      console.log(this.formatMessage(LogLevel.DEBUG, message, meta));
    }
  }

  success(message: string, meta?: any): void {
    console.log(this.formatMessage(LogLevel.SUCCESS, message, meta));
  }
}

export const logger = new Logger();
