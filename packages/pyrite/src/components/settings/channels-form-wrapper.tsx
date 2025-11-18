import {ChannelsForm} from '@garage44/common/components'
import {$t} from '@garage44/common/app'

interface ChannelsFormWrapperProps {
    channelId?: string
}

export default function ChannelsFormWrapper({channelId}: ChannelsFormWrapperProps) {
    return <ChannelsForm $t={$t} channelId={channelId} />
}
