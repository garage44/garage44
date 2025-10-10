import {Icon} from '@/components/elements'
import {useEffect, useMemo} from 'preact/hooks'
import {$s, $t} from '@/app'

interface SplashProps {
    header?: string
    instruction?: string | (() => string)
}

export default function Splash({ header, instruction }: SplashProps) {
    const subtitle = useMemo(() => {
        if (instruction) {
            if (typeof instruction === 'function') return instruction()
            else return instruction
        }
        else return $t('ui.conferencing')
    }, [instruction])

    const title = useMemo(() => {
        if (header) {
            return header
        } else {
            return 'pyrite'
        }
    }, [header])

    useEffect(() => {
        if (!$s.group.connected) {
            $s.group.name = ''
        }
    }, [])

    return (
        <div class="c-splash">
            <Icon class="icon logo-animated" name="Logo" />
            <div class="title uca">
                {title}
            </div>
            <div class="subtitle uca">
                {subtitle}
            </div>
        </div>
    )
}
