type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'verbose' | 'debug'

const LEVELS: Record<LogLevel, number> = {
    error: 0, warn: 1, info: 2, success: 3, verbose: 4, debug: 5,
}

const COLORS = {
    error: 'color: #e74c3c',
    warn: 'color: #f1c40f',
    info: 'color: #3498db',
    success: 'color: #27ae60',
    verbose: 'color: #1abc9c',
    debug: 'color: #7f8c8d',
};

export class Logger {
    private level: LogLevel

    constructor({ level = 'info' }: { level?: LogLevel } = {}) {
        this.level = level
    }

    private shouldLog(level: LogLevel) {
        return LEVELS[level] <= LEVELS[this.level]
    }

    log(level: LogLevel, msg: string, ...args: any[]) {
        if (!this.shouldLog(level)) return;
        const now = new Date()
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        const levelStr = level.toUpperCase()
        const prefix = `%c[${levelStr[0]}]%c [${ts}]`
        const style = COLORS[level] || ''
        if (level === 'error') {
            console.error(`${prefix} ${msg}`, style, '', ...args)
        } else if (level === 'warn') {
            console.warn(`${prefix} ${msg}`, style, '', ...args)
        } else {
            console.log(`${prefix} ${msg}`, style, '', ...args)
        }
    }
    error(msg: string, ...args: any[]) { this.log('error', msg, ...args); }
    warn(msg: string, ...args: any[]) { this.log('warn', msg, ...args); }
    info(msg: string, ...args: any[]) { this.log('info', msg, ...args); }
    success(msg: string, ...args: any[]) { this.log('success', msg, ...args); }
    verbose(msg: string, ...args: any[]) { this.log('verbose', msg, ...args); }
    debug(msg: string, ...args: any[]) { this.log('debug', msg, ...args); }
    setLevel(level: LogLevel) { this.level = level; }
    close() {}
}

export const logger = new Logger();