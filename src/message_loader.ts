import { getAccount } from "./account"
import { backendUrl } from "./backend"
import { getActiveServer, getActiveChannel, highlightNewMessageInChannel, highlightNewPingInChannel } from "./channels"
import { clearMessagesContainer, renderMessage } from "./render_message"
import { IrcMessage } from "./socket.io"
import { knownDiscordNames, updateUserListDiscord } from "./users"

const checkNotificationFromOtherChannel = (message: IrcMessage) => {
    highlightNewMessageInChannel(message.channel)
    if (message.message.includes(getAccount().username)) {
        highlightNewPingInChannel(message.channel)
    }
}

export const addMessage = (message: IrcMessage) => {
    let isBridge = false
    if (message.from === 'bridge') {
        const slibbers = message.message.split('>')
        message.from = slibbers[0].substring(1)
        message.message = slibbers.slice(1).join('>').substring(1)
        if (knownDiscordNames.indexOf(message.from) === -1) {
            knownDiscordNames.push(message.from)
            updateUserListDiscord()
        }
        isBridge = true
    }
    if (message.channel === getActiveChannel()) {
        renderMessage(message, isBridge)
    } else {
        checkNotificationFromOtherChannel(message)
    }
}

export const reloadMessageBacklog = () => {
    fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/messages`)
        .then(data => data.json())
        .then((messages: IrcMessage[]) => {
            // clears the loading message
            clearMessagesContainer()
            messages.forEach((message: IrcMessage) => {
                addMessage(message)
            })
        })
}