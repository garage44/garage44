import fs from 'fs-extra'
import path from 'node:path'

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    gray: '\x1b[90m',
}

// Log levels with colors and priorities
const levels = {
    error: { priority: 0, color: colors.red, label: 'ERROR' },
    warn: { priority: 1, color: colors.yellow, label: 'WARN' },
    info: { priority: 2, color: colors.blue, label: 'INFO' },
    verbose: { priority: 3, color: colors.cyan, label: 'VERBOSE' },
    debug: { priority: 4, color: colors.gray, label: 'DEBUG' },
}

export interface LoggerConfig {
    level?: keyof typeof levels
    file?: string
    console?: boolean
    timestamp?: boolean
    colors?: boolean
}

// Detect if colors are supported
function supportsColors(): boolean {
    // Check if we're in a TTY and if colors are enabled
    if (typeof process !== 'undefined' && process.stdout && process.stdout.isTTY) {
        // Check for common environment variables that disable colors
        if (process.env.NO_COLOR || process.env.FORCE_COLOR === '0') {
            return false
        }
        // Check if colors are explicitly enabled
        if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === '2' || process.env.FORCE_COLOR === '3') {
            return true
        }
        // Default to true for TTY
        return true
    }
    return false
}

export class Logger {
    private config: LoggerConfig
    private fileStream?: fs.WriteStream
    private currentLevel: number
    private colorSupported: boolean
    private isNode: boolean

    constructor(config: LoggerConfig = {}) {
        this.config = {
            level: 'info',
            console: true,
            timestamp: true,
            colors: true,
            ...config,
        }
        this.currentLevel = levels[this.config.level!].priority
        this.colorSupported = this.config.colors && supportsColors()
        this.isNode = typeof process !== 'undefined' && !!process.versions && !!process.versions.node

        // Initialize file logging if specified
        if (this.config.file && this.isNode) {
            this.initFileLogging()
        }
    }

    private initFileLogging() {
        if (!this.config.file) return

        try {
            // Ensure directory exists
            const logDir = path.dirname(this.config.file)
            fs.mkdirpSync(logDir)

            // Create write stream
            this.fileStream = fs.createWriteStream(this.config.file, { flags: 'a' })

            // Handle stream errors
            this.fileStream.on('error', (error) => {
                console.error('Logger file stream error:', error)
            })
        } catch (error) {
            console.error('Failed to initialize file logging:', error)
        }
    }

    private formatMessage(level: keyof typeof levels, message: string, ...args: any[]): string {
        const timestamp = this.config.timestamp ? new Date().toISOString() : ''
        const levelInfo = levels[level]
        const prefix = this.colorSupported ? `${levelInfo.color}[${levelInfo.label}]${colors.reset}` : `[${levelInfo.label}]`

        // Format the main message
        let formattedMessage = message
        if (args.length > 0) {
            formattedMessage += ' ' + args.map(arg =>
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' ')
        }

        // Add timestamp if enabled
        const timestampPart = timestamp ? `[${timestamp}] ` : ''

        return `${timestampPart}${prefix} ${formattedMessage}`
    }

    private writeToFile(message: string) {
        if (this.fileStream && this.fileStream.writable) {
            this.fileStream.write(message + '\n')
        }
    }

    private log(level: keyof typeof levels, message: string, ...args: any[]) {
        const levelInfo = levels[level]
        if (this.currentLevel < levelInfo.priority) return

        const formattedMessage = this.formatMessage(level, message, ...args)

        // Write to console if enabled
        if (this.config.console) {
            if (level === 'error') {
                console.error(formattedMessage)
            } else if (level === 'warn') {
                console.warn(formattedMessage)
            } else {
                console.log(formattedMessage)
            }
        }

        // Write to file if enabled
        if (this.config.file && this.isNode) {
            // Remove colors for file output
            const fileMessage = formattedMessage.replace(/\x1b\[[0-9;]*m/g, '')
            this.writeToFile(fileMessage)
        }
    }

    // Public logging methods
    error(message: string, ...args: any[]) {
        this.log('error', message, ...args)
    }

    warn(message: string, ...args: any[]) {
        this.log('warn', message, ...args)
    }

    info(message: string, ...args: any[]) {
        this.log('info', message, ...args)
    }

    verbose(message: string, ...args: any[]) {
        this.log('verbose', message, ...args)
    }

    debug(message: string, ...args: any[]) {
        this.log('debug', message, ...args)
    }

    // Special methods for grouped logging
    group(name: string) {
        if (this.config.console) {
            console.group(name)
        }
    }

    groupEnd() {
        if (this.config.console) {
            console.groupEnd()
        }
    }

    // Configuration methods
    setLevel(level: keyof typeof levels) {
        this.config.level = level
        this.currentLevel = levels[level].priority
    }

    setConfig(config: Partial<LoggerConfig>) {
        this.config = { ...this.config, ...config }
        this.currentLevel = levels[this.config.level!].priority
        this.colorSupported = this.config.colors && supportsColors()

        // Reinitialize file logging if file config changed
        if (config.file !== undefined && this.isNode) {
            if (this.fileStream) {
                this.fileStream.end()
                this.fileStream = undefined
            }
            if (this.config.file) {
                this.initFileLogging()
            }
        }
    }

    // Cleanup method
    close() {
        if (this.fileStream && this.isNode) {
            this.fileStream.end()
            this.fileStream = undefined
        }
    }
}

// Create default logger instance
export const logger = new Logger()

// Export for backward compatibility
export default Logger
