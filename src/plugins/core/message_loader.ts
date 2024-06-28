import { getAccount } from '../../account'
import { backendUrl } from '../../backend'
import { getActiveChannel, getActiveServer, highlightNewMessageInChannel, highlightNewPingInChannel } from '../../channels'
import { isRenderedMessageId, trackNewMessageId } from '../../message_ids'
import { clearMessagesContainer, renderMessage } from '../../render_message'
import { IrcMessage } from '../../socket.io'
import { knownDiscordNames, updateUserListDiscord } from '../../users'
import { MessageLoaderPluginImplementation } from '../plugin_implementations'

class MessageLoaderPlugin extends MessageLoaderPluginImplementation {
  constructor () {
    super('message_loader')
  }

  onInit (): void {
    // this used to preview messages in the login screen
    // which no longer works because requesting messages requires credentials

    // this.reloadMessageBacklog()
  }

  onSwitchChannel (oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
    this.reloadMessageBacklog()
  }

  onMessage (message: IrcMessage): boolean {
    this.addMessage(message)
    return false
  }

  addMessage (message: IrcMessage, insertTop: boolean = false): void {
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
      if (!knownDiscordNames.includes(message.from)) {
        knownDiscordNames.push(message.from)
        updateUserListDiscord()
      }
      isBridge = true
    }
    if (message.channel === getActiveChannel()) {
      renderMessage(message, insertTop, isBridge)
    } else {
      this.checkNotificationFromOtherChannel(message)
    }
  }

  checkNotificationFromOtherChannel (message: IrcMessage): void {
    highlightNewMessageInChannel(message.channel)
    if (message.message.includes(getAccount().username)) {
      highlightNewPingInChannel(message.channel)
    }
  }

  reloadMessageBacklog (): void {
    fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/messages?count=200&sessionToken=${getAccount().sessionToken}`)
      .then(async data => await data.json())
      .then((messages: IrcMessage[]) => {
        // clears the loading message
        clearMessagesContainer()
        messages.forEach((message: IrcMessage) => {
          this.addMessage(message, false)
        })
      })
  }
}

export default MessageLoaderPlugin
