let unreadMessages: number = 0
let unreadPings: number = 0
let notificationsActive: boolean = false
const channelName = 'developer' // TODO: duplicated remove

export const toggleNotifications = () => {
    notificationsActive = !notificationsActive
}

export const isNotificationsActive = (): boolean => {
    return notificationsActive
}

export const desktopNotification = () => {
    if (!notificationsActive) {
        return
    }
    if (!Notification) {
        return
    }
    if (Notification.permission !== 'granted') {
        return
    }
    const notification = new Notification('chat.zillyhuhn.com', {
        icon: 'https://ddnet.org/favicon.ico',
        body: 'New message in ddnet#developer',
    })
    notification.onclick = () => {
        // window.open('https://chat.zillyhuhn.com/')
    }
}

export const addMessageNotification = () => {
    unreadMessages++
    const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
    document.title = `#${channelName} ${pingTxt}(${unreadMessages}) `
}

export const addPingNotification = () => {
    if (!document.hidden) {
        return
    }
    unreadPings++
    const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
    document.title = `#${channelName} ${pingTxt}(${unreadMessages}) `
    desktopNotification()
}

export const clearNotifications = () => {
    unreadMessages = 0
    unreadPings = 0
    document.title = `#${channelName}`
}