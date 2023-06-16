import { backendUrl } from "../../backend"
import { getActiveServer, getActiveChannel } from "../../channels"
import { getOldestMessageId } from "../../message_ids"
import { IrcMessage } from "../../socket.io"
import BasePlugin from "../base_plugin" 

class InfiniteScrollPlugin extends BasePlugin {
    messagesContainer: HTMLElement = document.querySelector('.message-pane')
    pendingLoad: boolean

    constructor() {
        super('infinite_scroll')

        this.pendingLoad = false
        this.messagesContainer = document.querySelector('.message-pane')
        this.messagesContainer.addEventListener('scroll', () => {
            if (this.messagesContainer.scrollTop < 2) {
                this.loadMoreMessages()
            }
        })
    }

    loadMoreMessages() {
        if (getOldestMessageId() === 0) {
            console.log('infinite scroll reached the top')
            return
        }
        if (this.pendingLoad) {
            console.log('[!] load of more messages already pending!')
            return
        }
        console.log('TODO: load more messages')
        this.pendingLoad = true
        const stepSize: number = 10
        const fromId: number = Math.max(0, getOldestMessageId() - stepSize)
        fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/messages?count=${stepSize}&from=${fromId}`)
            .then(data => data.json())
            .then((messages: IrcMessage[]) => {
                messages.forEach((message: IrcMessage) => {
                    console.log(message)
                    // TODO: insert at the top
                })
                this.pendingLoad = false
            })
    }
}

export default InfiniteScrollPlugin
