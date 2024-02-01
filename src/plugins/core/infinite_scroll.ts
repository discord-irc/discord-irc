import { backendUrl } from '../../backend'
import { getActiveServer, getActiveChannel } from '../../channels'
import { getOldestMessageId } from '../../message_ids'
import { IrcMessage } from '../../socket.io'
import BasePlugin from '../base_plugin'
import { getPluginByName } from '../plugins'
import MessageLoaderPlugin from './message_loader'

class InfiniteScrollPlugin extends BasePlugin {
  messagesContainer: HTMLElement = document.querySelector('.message-pane')
  pendingLoad: boolean

  constructor () {
    super('infinite_scroll')

    this.pendingLoad = false
  }

  onInit(): void {
    this.messagesContainer = document.querySelector('.message-pane')
    this.messagesContainer.addEventListener('scroll', () => {
      if (!this.isActive()) {
        return
      }
      if (this.messagesContainer.scrollTop < 2) {
        this.loadMoreMessages()
      }
    })
  }

  loadMoreMessages (): void {
    if (getOldestMessageId() === 0) {
      console.log('infinite scroll reached the top')
      return
    }
    if (this.pendingLoad) {
      console.log('[!] load of more messages already pending!')
      return
    }
    this.pendingLoad = true
    const stepSize: number = 10
    const fromId: number = Math.max(0, getOldestMessageId() - stepSize)
    console.log(`Requesting ${stepSize} messages starting from id ${fromId} (oldest known id = ${getOldestMessageId()})`)
    fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/messages?count=${stepSize}&from=${fromId}`)
      .then(async data => await data.json())
      .then((messages: IrcMessage[]) => {
        messages.reverse().forEach((message: IrcMessage) => {
          // TODO: do not use getPluginByName() use giveMePluginThatImplements() instead
          //       https://github.com/discord-irc/discord-irc/issues/34
          const messageLoader: MessageLoaderPlugin = getPluginByName('message_loader') as MessageLoaderPlugin
          messageLoader.addMessage(message, true)
        })
        this.pendingLoad = false
      })
  }
}

export default InfiniteScrollPlugin
