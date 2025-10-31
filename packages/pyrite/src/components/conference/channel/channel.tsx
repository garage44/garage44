import {useEffect} from 'preact/hooks'
import {$s} from '@/app'
import ChannelChat from '../chat/channel-chat'
import {selectChannel, loadChannelHistory} from '@/models/chat'

interface ChannelProps {
    channelId: string
}

export const Channel = ({channelId}: ChannelProps) => {
    const channelIdNum = parseInt(channelId, 10)

    // Set active channel synchronously during render for immediate route update
    // This happens before child components render, eliminating delay
    if ($s.chat.activeChannelId !== channelIdNum) {
        $s.chat.activeChannelId = channelIdNum
        $s.chat.channel = channelIdNum.toString()
    }

    // Load history in useEffect (async operation)
    useEffect(() => {
        // Use selectChannel to ensure channel is properly initialized
        selectChannel(channelIdNum)
        // Load history immediately
        loadChannelHistory(channelIdNum)
    }, [channelIdNum])

    return (
        <div class="c-channel">
            <ChannelChat channelId={channelIdNum} />
        </div>
    )
}
