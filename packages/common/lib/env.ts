export default function env(env) {
    env.ua = navigator.userAgent.toLowerCase()

    if (globalThis.navigator) {
        env.isBrowser = true

        if (env.ua.indexOf('safari') >= 0 && env.ua.indexOf('chrome') < 0) {
            env.isSafari = true
            env.browserName = 'Safari'
        }
        if (env.ua.includes('firefox')) {
            env.isFirefox = env.ua.includes('firefox')
            env.browserName = 'Firefox'
        }
    }

    const mediaQuery = window.matchMedia('(max-width: 768px)')
    env.layout = mediaQuery.matches ? 'tablet' : 'desktop'
    mediaQuery.addListener(function(e) {
        env.layout = e.matches ? 'tablet' : 'desktop'
    })

    document.addEventListener('keydown', (e) => {
        if (e.altKey) {
            env.altKey = true
        }
        if (e.ctrlKey) {
            env.ctrlKey = true
        }
        if (e.shiftKey) {
            env.shiftKey = true
        }
    })
    document.addEventListener('keyup', (e) => {
        if (!e.altKey) env.altKey = false
        if (!e.ctrlKey) env.ctrlKey = false
        if (!e.shiftKey) env.shiftKey = false
    })
}
