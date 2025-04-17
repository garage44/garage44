import {useEffect, useRef} from 'preact/hooks'

export const useInterval = (callback: () => void, delay: number) => {
    const savedCallback = useRef<() => void>()

    useEffect(() => {
        savedCallback.current = callback
    }, [callback])

    useEffect(() => {
        const tick = () => {
            if (savedCallback.current) {
                savedCallback.current()
            }
        }

        if (delay !== null) {
            const id = setInterval(tick, delay)
            return () => clearInterval(id)
        }
    }, [delay])
}
