import { getAccount } from '../../account'
import { backendUrl } from '../../backend'
import { getActiveChannel, getActiveServer } from '../../channels'
import { TypingInfo, TypingState } from '../../socket.io'
import { getSocket } from '../../ws_connection'
import BasePlugin from '../base_plugin'

class TypingPlugin extends BasePlugin {
  isTyping: boolean
  lastType: Date
  typingListDom: HTMLElement

  constructor () {
    super('typing')

    this.typingListDom = document.querySelector('.typing-users')
    this.isTyping = false
    this.lastType = new Date()
  }

  onInit (): void {
    this.sendTyping(false)
    getSocket().on('typingUsers', (typingUsers: TypingState) => {
      const users: string[] = typingUsers.names.filter((name) => name !== getAccount().username)
      this.renderTypingUsers(users)
    })
    this.getTypersForCurrentChannel()
  }

  onKeydownMessageInput (_event: KeyboardEvent, _messageInp: HTMLInputElement): void {
    this.sendTyping(true)
  }

  onSwitchChannel (oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
    this.getTypersForCurrentChannel()
  }

  onTick (): void {
    this.checkStopTyping()
  }

  renderTypingUsers (users: string[]): void {
    if (users.length === 0) {
      this.typingListDom.innerHTML = ''
      return
    }
    const isAre = users.length === 1 ? 'is' : 'are'
    const typers = users.length > 3
      ? `<span>${users.length} users are typing ...</span>`
      : `<span>${users.join(', ')} ${isAre} typing ...</span>`
    this.typingListDom.innerHTML = typers
  }

  getTypersForCurrentChannel (): void {
    fetch(`${backendUrl}/${getActiveServer()}/${getActiveChannel()}/typers`)
      .then(async data => await data.json())
      .then((users: string[]) => {
        this.renderTypingUsers(users)
      })
  }

  checkStopTyping (): void {
    if (!this.isTyping) {
      return
    }
    const now = new Date()
    const diff = now.valueOf() - this.lastType.valueOf()
    if (diff > 2000) {
      this.sendTyping(false)
    }
  }

  sendTyping (active: boolean): void {
    // console.log(`send typing active=${active}`)
    this.isTyping = active
    this.lastType = new Date()
    const typingInfo: TypingInfo = {
      isTyping: this.isTyping,
      channel: getActiveChannel(),
      server: getActiveServer()
    }
    getSocket().emit('typingInfo', typingInfo)
  }
}

export default TypingPlugin
