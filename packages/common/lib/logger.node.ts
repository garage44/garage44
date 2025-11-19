type LogLevel = 'error' | 'warn' | 'info' | 'success' | 'verbose' | 'debug' | 'remote'

const LEVELS: Record<LogLevel, number> = {
    debug: 5,
    error: 0,
    info: 2,
    remote: 2,
    success: 3,
    verbose: 4,
    warn: 1,
}

const ESC = String.fromCodePoint(27)
const COLORS = {
    debug: `${ESC}[90m`, // gray
    error: `${ESC}[31m`, // red
    info: `${ESC}[34m`, // blue
    remote: `${ESC}[38;5;166m`, // purple
    reset: `${ESC}[0m`,
    success: `${ESC}[38;2;39;174;96m`, // muted green (matches browser #27ae60)
    verbose: `${ESC}[36m`, // cyan
    warn: `${ESC}[33m`, // yellow
}

export class Logger {
    private level: LogLevel

    private fileStream?: any

    constructor({file, level = 'info' }: {file?: string; level?: LogLevel} = {}) {
        this.level = level
        if (file) {
            const fs = require('fs')
            const path = require('path')
            fs.mkdirSync(path.dirname(file), {recursive: true})
            this.fileStream = fs.createWriteStream(file, {flags: 'a'})
        }
    }

    private shouldLog(level: LogLevel) {
        return LEVELS[level] <= LEVELS[this.level]
    }

    private format(level: LogLevel, msg: string) {
        const now = new Date()
        const ts = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
        const color = COLORS[level] || ''
        const levelStr = level.toUpperCase()

        if (level === 'debug') {
            // Keep prefix color, but make timestamp and message text medium grey
            const mediumGrey = '\u001B[38;5;244m' // medium gray
            return `${color}[${levelStr[0]}]${COLORS.reset} ${mediumGrey}[${ts}] ${msg}${COLORS.reset}`
        }

        if (level === 'warn') {
            // Keep prefix color, but make timestamp and message text light orange
            const lightOrange = '\u001B[38;5;215m' // light orange pastel
            return `${color}[${levelStr[0]}]${COLORS.reset} ${lightOrange}[${ts}] ${msg}${COLORS.reset}`
        }

        if (level === 'remote') {
            const purple = '\u001B[38;5;166m' // purple
            return `${color}[${levelStr[0]}]${COLORS.reset} ${purple}[${ts}] ${msg}${COLORS.reset}`
        }

        if (level === 'success') {
            // Keep prefix color, but make timestamp and message text light green
            const lightGreen = '\u001B[38;5;156m' // light green pastel
            return `${color}[${levelStr[0]}]${COLORS.reset} ${lightGreen}[${ts}] ${msg}${COLORS.reset}`
        }

        if (level === 'info') {
            // Keep prefix color, but make timestamp and message text pastel blue
            const pastelBlue = '\u001B[38;5;153m' // pastel blue
            return `${color}[${levelStr[0]}]${COLORS.reset} ${pastelBlue}[${ts}] ${msg}${COLORS.reset}`
        }

        if (level === 'error') {
            // Keep prefix color, but make timestamp and message text pastel red
            const pastelRed = '\u001B[38;5;210m' // pastel red
            return `${color}[${levelStr[0]}]${COLORS.reset} ${pastelRed}[${ts}] ${msg}${COLORS.reset}`
        }

        return `${color}[${levelStr[0]}]${COLORS.reset} [${ts}] ${msg}`
    }

    private logToFile(msg: string) {
        if (this.fileStream) {
            this.fileStream.write(msg + '\n')
        }
    }

    log(level: LogLevel, msg: string, ...args: any[]) {
        if (!this.shouldLog(level)) {
            return
        }
        const formatted = this.format(level, msg)
        if (level === 'error') {
            console.error(formatted, ...args)
        } else if (level === 'warn') {
            console.warn(formatted, ...args)
        } else if (level === 'remote') {
            console.log(formatted, ...args)
        } else {
            console.log(formatted, ...args)
        }
        this.logToFile(formatted.replaceAll(new RegExp(`${ESC}\\[[0-9;]*m`, 'g'), ''))
    }

    error(msg: string, ...args: any[]) {
        this.log('error', msg, ...args)
    }

    warn(msg: string, ...args: any[]) {
        this.log('warn', msg, ...args)
    }

    info(msg: string, ...args: any[]) {
        this.log('info', msg, ...args)
    }

    remote(msg: string, ...args: any[]) {
        this.log('remote', msg, ...args)
    }

    success(msg: string, ...args: any[]) {
        this.log('success', msg, ...args)
    }

    verbose(msg: string, ...args: any[]) {
        this.log('verbose', msg, ...args)
    }

    debug(msg: string, ...args: any[]) {
        this.log('debug', msg, ...args)
    }

    setLevel(level: LogLevel) {
        this.level = level
    }

    close() {
        if (this.fileStream) {
            this.fileStream.end()
        }
    }
}

// Provide a shared logger instance for Node/Bun environments
const logger = new Logger()

export {logger}
