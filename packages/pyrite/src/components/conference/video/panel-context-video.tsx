import classnames from 'classnames'
import {Button, ContextInput, FieldText} from '@garage44/common/components'
import {useState, useMemo} from 'preact/hooks'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'
import {currentGroup} from '@/models/group'
import {connection} from '@/models/sfu/sfu'
import ConferenceControls from '../controls/controls-main'

export default function PanelContextVideo() {
    const [active, setActive] = useState(false)

    // DeepSignal is reactive - accessing $s properties makes components reactive automatically
    const currentGroupData = useMemo(() => currentGroup(), [])

    const lock = {
        icon: currentGroupData.locked ? 'Unlock' : 'Lock',
        title: currentGroupData.locked ? $t('group.action.unlock') : $t('group.action.lock'),
    }

    const warning = {icon: 'Megafone', title: $t('group.action.notify')}

    const sendNotification = (text: string) => {
        connection?.userMessage('notification', null, text)
    }

    const toggleLockGroup = (text: string) => {
        if (currentGroupData.locked) {
            connection?.groupAction('unlock')
        } else {
            connection?.groupAction('lock', text)
        }
    }

    const toggleMenu = (_e?: unknown, forceState?: unknown) => {
        // The click-outside
        if (typeof forceState === 'object') {
            setActive(false)
        } else {
            setActive((prev) => !prev)
        }
    }

    return (
        <div
            class={classnames('c-panel-context-video', {
                active: active,
            })}
        >
            <ConferenceControls />
        </div>
    )
}
