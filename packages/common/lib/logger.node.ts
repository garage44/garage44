type LogLevel = 'error' | 'warn' | 'info' | 'verbose' | 'debug';

const LEVELS: Record<LogLevel, number> = {
  error: 0, warn: 1, info: 2, verbose: 3, debug: 4,
};

const COLORS = {
  error: '\x1b[31m', // red
  warn: '\x1b[33m', // yellow
  info: '\x1b[34m', // blue
  verbose: '\x1b[36m', // cyan
  debug: '\x1b[90m', // gray
  reset: '\x1b[0m',
};

export class Logger {
  private level: LogLevel;
  private fileStream?: any;

  constructor({ level = 'info', file }: { level?: LogLevel; file?: string } = {}) {
    this.level = level;
    if (file) {
      const fs = require('fs');
      const path = require('path');
      fs.mkdirSync(path.dirname(file), { recursive: true });
      this.fileStream = fs.createWriteStream(file, { flags: 'a' });
    }
  }

  private shouldLog(level: LogLevel) {
    return LEVELS[level] <= LEVELS[this.level];
  }

  private format(level: LogLevel, msg: string) {
    const ts = new Date().toISOString();
    const color = COLORS[level] || '';
    return `${color}[${level.toUpperCase()}]${COLORS.reset} [${ts}] ${msg}`;
  }

  private logToFile(msg: string) {
    if (this.fileStream) this.fileStream.write(msg + '\n');
  }

  log(level: LogLevel, msg: string, ...args: any[]) {
    if (!this.shouldLog(level)) return;
    const formatted = this.format(level, msg);
    if (level === 'error') console.error(formatted, ...args);
    else if (level === 'warn') console.warn(formatted, ...args);
    else console.log(formatted, ...args);
    this.logToFile(formatted.replace(/\x1b\[[0-9;]*m/g, ''));
  }

  error(msg: string, ...args: any[]) { this.log('error', msg, ...args); }
  warn(msg: string, ...args: any[]) { this.log('warn', msg, ...args); }
  info(msg: string, ...args: any[]) { this.log('info', msg, ...args); }
  verbose(msg: string, ...args: any[]) { this.log('verbose', msg, ...args); }
  debug(msg: string, ...args: any[]) { this.log('debug', msg, ...args); }

  setLevel(level: LogLevel) { this.level = level; }
  close() { if (this.fileStream) this.fileStream.end(); }
}

export const logger = new Logger();