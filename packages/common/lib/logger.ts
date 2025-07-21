// Universal logger entrypoint
// This file conditionally exports the Node or browser logger implementation

// oxlint-disable-next-line init-declarations
let LoggerImpl: any, loggerImpl: any

if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    // Node/Bun
    const node = require('./logger.node.ts')
    LoggerImpl = node.Logger
    loggerImpl = node.logger
} else {
    // Browser
    const browser = require('./logger.browser.ts')
    LoggerImpl = browser.Logger
    loggerImpl = browser.logger
}

const Logger = LoggerImpl
const logger = loggerImpl

export {logger, Logger}