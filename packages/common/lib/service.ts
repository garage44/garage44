import type {LoggerConfig} from './logger.ts'
import {Logger} from './logger.ts'
// import {type LoggerConfig} from './logger.ts'

function serviceLogger(logger_config: LoggerConfig) {
    return new Logger(logger_config)
}

function loggerTransports(logger_config: LoggerConfig, type: 'cli' | 'service') {
    if (type === 'cli') {
        // CLI mode: console only, no timestamps, colors enabled
        return new Logger({
            ...logger_config,
            file: undefined,
            timestamp: false,
            colors: true,
            level: logger_config.level || 'info'
        })
    }if (type === 'service') {
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

export {
    loggerTransports,
    serviceLogger,
}