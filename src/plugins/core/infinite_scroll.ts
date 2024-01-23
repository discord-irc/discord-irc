import { backendUrl } from '../../backend'
import { getActiveServer, getActiveChannel } from '../../channels'
import { getOldestMessageId } from '../../message_ids'
import { addMessage } from '../../message_loader'
import { IrcMessage } from '../../socket.io'
import BasePlugin from '../base_plugin'

class InfiniteScrollPlugin extends BasePlugin {
  messagesContainer: HTMLElement = document.querySelector('.message-pane')
  pendingLoad: boolean

  constructor () {
    super('infinite_scroll')

    this.pendingLoad = false
    this.messagesContainer = document.querySelector('.message-pane')
    this.messagesContainer.addEventListener('scroll', () => {
      if (this.messagesContainer.scrollTop < 2) {
        this.loadMoreMessages()
      }
    })
  }

  loadMoreMessages () {
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
          addMessage(message, true)
        })
        this.pendingLoad = false
      })
  }
}

export default InfiniteScrollPlugin
