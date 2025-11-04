/**
 * Private Chat Helper Component
 * Provides UI for initiating private conversations with users
 */

import {h} from 'preact'
import {useState} from 'preact/hooks'
import {Icon} from '@garage44/common/components'
import {ws, notify} from '@garage44/common/app'
import {$s} from '@/app'
import {route} from 'preact-router'
import './private-chat-helper.css'

interface PrivateChatHelperProps {
    targetUserId: string
    targetUsername: string
}

export const PrivateChatHelper = ({targetUserId, targetUsername}: PrivateChatHelperProps) => {
    const [loading, setLoading] = useState(false)

    const startPrivateChat = async () => {
        setLoading(true)
        try {
            const response = await ws.post(`/api/chat/private/${targetUserId}`, {})
            
            if (response.success && response.channel) {
                // Add channel to state if not already there
                if (!$s.channels.find(c => c.slug === response.channel.slug)) {
                    $s.channels.push(response.channel)
                }

                // Navigate to the private channel
                route(`/channels/${response.channel.slug}`)
                
                notify({
                    level: 'success',
                    message: `Started private chat with ${targetUsername}`,
                })
            } else {
                notify({
                    level: 'error',
                    message: response.error || 'Failed to create private channel',
                })
            }
        } catch (error) {
            notify({
                level: 'error',
                message: 'Failed to create private channel',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            class="btn-dm"
            onClick={startPrivateChat}
            disabled={loading}
            title={`Send direct message to ${targetUsername}`}
        >
            <Icon name="mail" />
            {loading ? 'Loading...' : 'DM'}
        </button>
    )
}
