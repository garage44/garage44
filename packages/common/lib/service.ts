import {Logger} from './logger.ts'
import type {LoggerConfig} from '../types'

function serviceLogger(logger_config: LoggerConfig) {
    return new Logger(logger_config)
}

function loggerTransports(logger_config: LoggerConfig, type: 'cli' | 'service') {
    if (type === 'cli') {
        // CLI mode: console only, no timestamps, colors enabled
        return new Logger({
            ...logger_config,
            colors: true,
            file: undefined,
            level: logger_config.level || 'info',
            timestamp: false,
        })
    }if (type === 'service') {
        // Service mode: console + file, timestamps enabled, colors enabled for console
        return new Logger({
            ...logger_config,
            colors: true,
            level: logger_config.level || 'info',
            timestamp: true,
        })
    }
    return new Logger(logger_config)
}

export {
    loggerTransports,
    serviceLogger,
}