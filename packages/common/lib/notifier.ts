import {$s} from '@/app'

let notificationId = 1

export interface Notification {
    id: string
    icon: string
    message: string
    link: {
        url: string
        text: string
    }
    list: string[]
    progress?: {
        boundaries: number[]
        percentage: number
    }
    type: string
}

export function notify(notification: Notification, timeout = 3000) {
    notification.id = notificationId
    $s.notifications.push(notification)

    if (timeout) {
        setTimeout(() => {
            $s.notifications.splice($s.notifications.findIndex(i => i.id === notification.id), 1)
        }, timeout)
    }

    notificationId += 1
    return $s.notifications.find((i) => i.id === notification.id)
}
