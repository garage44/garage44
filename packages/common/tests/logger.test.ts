#!/usr/bin/env bun

import {Logger} from '@/lib/logger'

console.log('Testing Bun-compatible Isomorphic Logger\n')

// Test 1: Basic console logging with colors (Node/Bun)
console.log('=== Test 1: Node/Bun Console Logging ===')
const consoleLogger = new Logger({
    file: undefined,
    level: 'debug',
})

consoleLogger.info('This is an info message')
consoleLogger.warn('This is a warning message')
consoleLogger.error('This is an error message')
consoleLogger.debug('This is a debug message')
consoleLogger.verbose('This is a verbose message')

// Test 2: File logging (Node/Bun only)
console.log('\n=== Test 2: File Logging (Node/Bun only) ===')
const fileLogger = new Logger({
    file: './test.log',
    level: 'info',
})

fileLogger.info('This message will go to both console and file')
fileLogger.warn('Warning message with file output')
fileLogger.error('Error message with file output')

// Test 3: Log Level Filtering
console.log('\n=== Test 3: Log Level Filtering ===')
const debugLogger = new Logger({level: 'debug'})
const infoLogger = new Logger({level: 'info'})
const warnLogger = new Logger({level: 'warn'})

debugLogger.debug('Debug message (should show)')
infoLogger.debug('Debug message (should NOT show)')
warnLogger.info('Info message (should NOT show)')
warnLogger.warn('Warn message (should show)')

// Test 4: Object logging
console.log('\n=== Test 4: Object Logging ===')
const objLogger = new Logger({level: 'debug'})
objLogger.info('Logging an object:', {
    name: 'test',
    nested: {key: 'value'},
    value: 123,
})
objLogger.debug('Debug with multiple args:', 'string', 42, {obj: true})

// Test 5: Dynamic Configuration
console.log('\n=== Test 5: Dynamic Configuration ===')
const dynamicLogger = new Logger({level: 'warn'})
dynamicLogger.info('This should NOT show (warn level)')
dynamicLogger.setLevel('info')
dynamicLogger.info('This should show (changed to info level)')

// Cleanup
fileLogger.close()
console.log('\n=== Logger Test Complete (Node/Bun) ===')
console.log('Check test.log file for file output examples')
