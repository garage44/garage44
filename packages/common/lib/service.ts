import { Logger, LoggerConfig } from './logger.ts'

export const serviceLogger = function(logger_config: LoggerConfig) {
    return new Logger(logger_config)
}

export function loggerTransports(logger: Logger, logger_config: LoggerConfig, type: 'cli' | 'service') {
    if (type === 'cli') {
        // CLI mode: console only, no timestamps, colors enabled
        logger.setConfig({
            console: true,
            file: undefined,
            timestamp: false,
            colors: true,
            level: logger_config.level || 'info'
        })
    } else if (type === 'service') {
        // Service mode: console + file, timestamps enabled, colors enabled for console
        logger.setConfig({
            console: true,
            file: logger_config.file,
            timestamp: true,
            colors: true,
            level: logger_config.level || 'info'
        })
    }

    return logger
}
