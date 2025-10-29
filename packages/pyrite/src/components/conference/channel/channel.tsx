import {useEffect} from 'preact/hooks'
import {$s} from '@/app'
import ChannelChat from '../chat/channel-chat'
import {selectChannel} from '@/models/chat'

interface ChannelProps {
    channelId: string
}

export const Channel = ({channelId}: ChannelProps) => {
    const channelIdNum = parseInt(channelId, 10)

    useEffect(() => {
        // Set the active channel when this component mounts
        selectChannel(channelIdNum)
    }, [channelIdNum])

    return (
        <div class="c-channel">
            <ChannelChat channelId={channelIdNum} />
        </div>
    )
}
