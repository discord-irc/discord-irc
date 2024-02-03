import BasePlugin from '../base_plugin'
import { getPluginThatImplementsServerDetails } from '../plugin_implementations'

import '../../css/plugins/server_settings.css'
import { getActiveChannel, getActiveServer, getChannelInfo } from '../../channels'
import { backendUrl } from '../../backend'
import { WebhookObject } from '../../socket.io'
import { getBearerToken } from '../../tokens'

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
    <div class="webhook-list">
    </div>
    `
    const webhookList: HTMLElement = document.querySelector('.webhook-list')
    const form: HTMLElement = document.querySelector('.webhook-form')
    document.querySelector('.new-webhook').addEventListener('click', () => {
      console.log('clicked new webhook!')
      form.classList.add('active')
    })

    form.addEventListener('submit', (event) => {
      event.preventDefault()

      console.log('submittin webhook form ..')
    })

    const channel = getChannelInfo(getActiveServer(), getActiveChannel())
    console.log(channel)
    fetch(`${backendUrl}/channels/${channel.id}/webhooks`, {
      headers: {
        authorization: `Bearer ${getBearerToken()}`
      }
    })
      .then(async data => await data.json())
      .then((webhooks: WebhookObject[]) => {
        // TODO: error checking here
        //       the backend can throw a bunch of auth errors here
        //       also channel not found
        console.log(webhooks)
        webhooks.forEach((webhook) => {
          webhookList.insertAdjacentHTML(
            'beforeend',
            `<div>${webhook.name}</div>`
          )
        })
      })
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
