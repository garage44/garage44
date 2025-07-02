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
        const style = COLORS[level] || ''

        if (level === 'debug') {
            // Keep prefix color, but make timestamp and message text medium grey
            const mediumGreyStyle = 'color: #888888'
            const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`
            console.log(prefix, style, mediumGreyStyle, ...args)
        } else if (level === 'warn') {
            // Keep prefix color, but make timestamp and message text light orange
            const lightOrangeStyle = 'color: #ffb366'
            const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`
            console.warn(prefix, style, lightOrangeStyle, ...args)
        } else if (level === 'success') {
            // Keep prefix color, but make timestamp and message text light green
            const lightGreenStyle = 'color: #90ee90'
            const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`
            console.log(prefix, style, lightGreenStyle, ...args)
        } else if (level === 'info') {
            // Keep prefix color, but make timestamp and message text pastel blue
            const pastelBlueStyle = 'color: #87ceeb'
            const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`
            console.log(prefix, style, pastelBlueStyle, ...args)
        } else if (level === 'error') {
            // Keep prefix color, but make timestamp and message text pastel red
            const pastelRedStyle = 'color: #ff9999'
            const prefix = `%c[${levelStr[0]}]%c [${ts}] ${msg}`
            console.error(prefix, style, pastelRedStyle, ...args)
        } else {
            const prefix = `%c[${levelStr[0]}]%c [${ts}]`
            if (level === 'verbose') {
                console.log(`${prefix} ${msg}`, style, '', ...args)
            }
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