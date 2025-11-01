import classnames from 'classnames'
import {Button, ContextInput, FieldText} from '@garage44/common/components'
import {useState, useMemo} from 'preact/hooks'
import {$s} from '@/app'
import {$t} from '@garage44/common/app'
import {currentGroup} from '@/models/group'
import {connection} from '@/models/sfu/sfu'

export default function PanelContextVideo() {
    const [active, setActive] = useState(false)
    const [warningMessage, setWarningMessage] = useState('')

    const currentGroupData = useMemo(() => currentGroup(), [$s.sfu.channel.name, $s.chat.activeChannelSlug, $s.sfu.channels])

    const lock = {
        icon: currentGroupData.locked ? 'Unlock' : 'Lock',
        title: currentGroupData.locked ? $t('group.action.unlock') : $t('group.action.lock'),
    }

    const warning = {icon: 'Megafone', title: $t('group.action.notify')}

    const clearChat = () => {
        connection?.groupAction('clearchat')
        toggleMenu()
    }

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

    const toggleMenu = (e?: any, forceState?: any) => {
        // The click-outside
        if (typeof forceState === 'object') {
            setActive(false)
        } else {
            setActive((prev) => !prev)
        }

        // Undo input action context state when there is no text yet...
        if (!active && warningMessage === '') {
            // Reset warning input state if needed
        }
    }

    return (
        <div
            class={classnames('c-panel-context-video', {
                active: active,
            })}
        >
            <Button
                active={false}
                icon="Menu"
                variant="menu"
                onClick={toggleMenu}
            />

            {active && <div class="context-actions">
                {$s.permissions.op && <ContextInput
                    value={lock}
                    revert={$s.sfu.channel.locked}
                    submit={toggleLockGroup}
                    FieldTextComponent={FieldText}
                />}

                {$s.permissions.op && <ContextInput
                    value={warning}
                    submit={sendNotification}
                    FieldTextComponent={FieldText}
                />}
            </div>}
        </div>
    )
}
