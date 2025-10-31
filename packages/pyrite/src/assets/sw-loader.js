if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js').then(function(registration) {
        console.log('Registered events at scope: ', registration.scope)
    })
}
