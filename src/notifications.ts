import { getActiveChannel } from './channels'

let unreadMessages: number = 0
let unreadPings: number = 0
let notificationsActive: boolean = false

export const toggleNotifications = (): void => {
  notificationsActive = !notificationsActive
}

export const isNotificationsActive = (): boolean => {
  return notificationsActive
}

export const desktopNotification = (): void => {
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
    body: `New message in #${getActiveChannel()}`
  })
  notification.onclick = () => {
    // window.open('https://chat.zillyhuhn.com/')
  }
}

export const addMessageNotification = (): void => {
  unreadMessages++
  const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
  document.title = `#${getActiveChannel()} ${pingTxt}(${unreadMessages}) `
}

export const addPingNotification = (): void => {
  if (!document.hidden) {
    return
  }
  unreadPings++
  const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
  document.title = `#${getActiveChannel()} ${pingTxt}(${unreadMessages}) `
  desktopNotification()
}

export const clearNotifications = (): void => {
  unreadMessages = 0
  unreadPings = 0
  document.title = `#${getActiveChannel()}`
}
