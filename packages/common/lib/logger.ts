class Logger {

    levels = {
        debug: 4,
        error: 0,
        info: 2,
        verbose: 3,
        warn: 1,
    }

    level = this.levels.debug

    debug(...args) {
        if (this.level >= this.levels.debug) {
            if ('window' in globalThis) {
                const message = args[0]
                args[0] = `%c[expressio] ${message}`
                // eslint-disable-next-line no-console
                console.info(...args, 'color: #999')
                return
            }

            // eslint-disable-next-line no-console
            console.info(...args)
        }
    }

    error(...args) {
        // eslint-disable-next-line no-console
        console.error(...args)
    }

    group(name) {
        // eslint-disable-next-line no-console
        console.group(name)
    }

    groupEnd() {
        // eslint-disable-next-line no-console
        console.groupEnd()
    }

    info(...args) {
        if (this.level >= this.levels.info) {
            // eslint-disable-next-line no-console
            console.info(...['[expressio]', ...args])
        }
    }

    setLevel(level) {
        this.level = this.levels[level]
    }

    verbose(...args) {
        if (this.level >= this.levels.verbose) {
            // eslint-disable-next-line no-console
            console.log(...['[expressio]', ...args])
        }
    }

    warn(...args) {
        if (this.level >= this.levels.warn) {
            // eslint-disable-next-line no-console
            console.warn(...['[expressio]', ...args])
        }
    }
}

export default Logger
