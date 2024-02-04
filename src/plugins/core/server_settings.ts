import BasePlugin from '../base_plugin'
import { getPluginThatImplementsServerDetails } from '../plugin_implementations'

import '../../css/plugins/server_settings.css'
import { getActiveChannel, getActiveChannelInfo, getActiveServer, getActiveServerId, getChannelInfo } from '../../channels'
import { backendUrl } from '../../backend'
import { WebhookObject } from '../../socket.io'
import { getBearerToken } from '../../tokens'
import { getSocket } from '../../ws_connection'
import { popupAlert } from '../../popups'

class SettingsEntry {
  displayName: string
  callback: EventListenerOrEventListenerObject

  constructor(displayName: string, callback: EventListenerOrEventListenerObject) {
    this.displayName = displayName
    this.callback = callback
  }

  nameSlug (): string {
    return this.displayName.toLowerCase().replace(/[^a-z]/, '-')
  }
}

/**
 * ServerSettingsPlugin
 *
 * hooking into ServerDetailsPluginImplementation
 */
class ServerSettingsPlugin extends BasePlugin {
  messagesContainer: HTMLElement
  settingsEntries: SettingsEntry[]

  constructor () {
    super('server_settings')
  }

  onInit (): void {
    this.messagesContainer = document.querySelector('.message-pane')
    const listPlugin = getPluginThatImplementsServerDetails()
    if(!listPlugin) {
      console.warn(`[${this.pluginName}] Could not register. No active server details plugin found.`)
      return
    }
    listPlugin.registerListEntry('Server Settings', () => { this.openServerSettings() })
    this.settingsEntries = []
    this.settingsEntries.push(new SettingsEntry('Integrations', () => { this.settingIntegrations() }))

    getSocket().on('webhooks', (webhooks: WebhookObject[]) => {
      this.listWebhooks(webhooks)
    })
  }

  listWebhooks (webhooks: WebhookObject[]): void {
    const webhookList: HTMLElement = document.querySelector('.webhook-list')
    if (!webhookList) {
      return
    }
    webhookList.innerHTML = ''
    webhooks.forEach((webhook) => {
      webhookList.insertAdjacentHTML(
        'beforeend',
        `<div>${webhook.name}</div>`
      )
    })
  }

  settingIntegrations (): void {
    console.log('should show integrations settings now ...')
    document.querySelector('.server-settings-content').innerHTML = `
    <h1>Integrations</h1>

    <div class="btn new-webhook">New Webhook</div>
    <form action="" class="webhook-form">
      <label for="webhook-name-input">NAME</label>
      <input type="text" name="name" id="webhook-name-input" placeholder="Name">
      <label for="webhook-channel-input">CHANNEL</label>
      <input type="text" name="name" id="webhook-channel-input" placeholder="Channel">
      <input type="submit" value="Create" class="btn">
    </form>
    <div class="webhook-list">loading ...</div>
    `
    const form: HTMLElement = document.querySelector('.webhook-form')
    document.querySelector('.new-webhook').addEventListener('click', () => {
      console.log('clicked new webhook!')
      form.classList.add('active')
    })

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      console.log('submittin webhook form ..')

      const name = (document.querySelector('#webhook-name-input') as HTMLInputElement).value
      const channelName = (document.querySelector('#webhook-channel-input') as HTMLInputElement).value
      const channel = getChannelInfo(getActiveServer(), channelName)

      if(!channel) {
        popupAlert('invalid channel')
        return
      }
      if(!name) {
        popupAlert('invalid name')
        return
      }

      getSocket().emit('newWebhookRequest', {
        id: 0, // TODO: this is bullshit
        name: name,
        channel_id: channel.id,
        avatar: '',
        application_id: 0,
        type: 0
      })
      const activeServerId = getActiveServerId()
      // give the backend 1s time to insert the webhook into the database lmao
      // and then list all webhooks
      setTimeout(() => { getSocket().emit('webhooksRequest', activeServerId) }, 1000)
    })

    const activeServerId = getActiveServerId()
    if (!activeServerId) {
      console.warn(`Could not list webhooks because did not find active server id!`)
    } else {
      console.log(`requesting webhooks for active server: ${activeServerId}`)
      getSocket().emit('webhooksRequest', activeServerId)
    }
  }

  openServerSettings (): void {
    console.log('opening server settings ...')
    this.messagesContainer.innerHTML = `
    <div class="server-settings-grid">
      <div class="server-settings-side-bar">
      </div>
      <div class="server-settings-content">
      </div>
    </div> <!-- server-settings-grid -->
    `
    const sideBar: HTMLElement = document.querySelector('.server-settings-side-bar')
    for(const settingsEntry of this.settingsEntries) {
      const entryClass = `server-settings-side-bar-item-${settingsEntry.nameSlug()}`
      sideBar.insertAdjacentHTML('beforeend', `<div class="${entryClass}">${settingsEntry.displayName}</div>`)
      document.querySelector(`.${entryClass}`).addEventListener('click', settingsEntry.callback)
    }
  }
}

export default ServerSettingsPlugin
