import { getAccount } from "./account"
import { backendUrl } from "./backend"
import { getActiveServer, getActiveChannel, highlightNewMessageInChannel, highlightNewPingInChannel } from "./channels"
import { isRenderedMessageId, trackNewMessageId } from "./message_ids"
import { clearMessagesContainer, renderMessage } from "./render_message"
import { IrcMessage } from "./socket.io"
import { knownDiscordNames, updateUserListDiscord } from "./users"

const checkNotificationFromOtherChannel = (message: IrcMessage) => {
    highlightNewMessageInChannel(message.channel)
    if (message.message.includes(getAccount().username)) {
        highlightNewPingInChannel(message.channel)
    }
}

export const addMessage = (message: IrcMessage, insertTop: boolean = false) => {
    if (isRenderedMessageId(message.id)) {
        // TODO: let those through and update the old
        //       to enable message edits
        console.log(`[!] Warning ignoring known message id=${message.id}`)
        return
    }
    trackNewMessageId(message.id)
    let isBridge = false
    if (['bridge', 'bridge_'].includes(message.from)) {
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
        renderMessage(message, insertTop, isBridge)
    } else {
        checkNotificationFromOtherChannel(message)
    }
}

export const reloadMessageBacklog = () => {
    fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/messages?count=200`)
        .then(data => data.json())
        .then((messages: IrcMessage[]) => {
            // clears the loading message
            clearMessagesContainer()
            messages.forEach((message: IrcMessage) => {
                addMessage(message, false)
            })
        })
}
