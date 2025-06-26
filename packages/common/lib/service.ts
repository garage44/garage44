import { Logger, LoggerConfig } from './logger.ts'

export const serviceLogger = function(logger_config: LoggerConfig) {
    return new Logger(logger_config)
}

export function loggerTransports(logger_config: LoggerConfig, type: 'cli' | 'service') {
    if (type === 'cli') {
        // CLI mode: console only, no timestamps, colors enabled
        return new Logger({
            ...logger_config,
            file: undefined,
            timestamp: false,
            colors: true,
            level: logger_config.level || 'info'
        })
    } else if (type === 'service') {
        // Service mode: console + file, timestamps enabled, colors enabled for console
        return new Logger({
            ...logger_config,
            timestamp: true,
            colors: true,
            level: logger_config.level || 'info'
        })
    }
    return new Logger(logger_config)
}
