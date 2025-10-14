export interface Notification {
    id: number
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

export class Notifier {

    notificationId = 1
    notifications: Notification[]

    init(notifications: Notification[]) {
        this.notifications = notifications
    }

    notify(notification: Notification, timeout = 3000) {
        notification.id = this.notificationId
        this.notifications.push(notification)

        if (timeout) {
            setTimeout(() => {
                this.notifications.splice(this.notifications.findIndex(_notification => _notification.id === notification.id), 1)
            }, timeout)
        }

        this.notificationId += 1
        return this.notifications.find((_notification) => _notification.id === notification.id)
    }
}
