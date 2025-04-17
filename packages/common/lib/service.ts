import winston from 'winston'

export const serviceLogger = function(logger_config) {
    const logger = winston.createLogger({
        format: winston.format.json(),
        level: logger_config.level,
    })

    return logger
}

export function loggerTransports(logger, logger_config, type) {
    if (type === 'cli') {
        logger.add(new winston.transports.Console({
            format: winston.format.printf(({level, message, timestamp}) => {
                return `${message}`
            }),
            level: logger_config.level,
        }))

    } else if (type === 'service') {
        logger.add(new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.printf(({level, message, timestamp}) => {
                    return `[${timestamp}] [${level.toUpperCase()}] ${message}`
                }),
            ),
            level: logger_config.level,
        }))

        logger.add(new winston.transports.File({filename: logger_config.file}))
    }

    return logger
}
