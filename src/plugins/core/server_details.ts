import BasePlugin from '../base_plugin'

import '../../css/plugins/server_details.css'
import { ServerDetailsPluginImplementation } from '../plugin_implementations'

/**
 * ServerDetailsPlugin
 *
 * Implements the dropdown at the top left. The arrow down shaped thing. V
 * where one can get access to a bunch of links to server related pages
 * discord currently offers these things there:
 * - Server Boost
 * - Invite People
 * - Server Settings
 * - Create Channel
 * - Create Category
 * - Create Event
 * - App Directory
 * - Notification Settings
 * - Privacy Settings
 * - Edit Server Profile
 * - Hide Muted Channels
 * - Report Raid
 *
 * This plugin is not responsible for implementing the actual button contents
 * just for listing them.
 * Other plugins can then register them selfs as buttons in this list.
 */
class ServerDetailsPlugin extends ServerDetailsPluginImplementation {
  toggleButton: HTMLElement
  pluginPopups: HTMLElement
  serverDetailsList: HTMLElement
  numListItems: number

  constructor () {
    super('server_details')

    this.numListItems = 0
  }

  onInit (): void {
    console.log('server details init ...')

    this.toggleButton = document.querySelector('.server-details-desktop-toggle')
    this.toggleButton.addEventListener('click', () => {
      this.toggleDropDown()
    })

    this.pluginPopups = document.querySelector('.plugin-popups')
    this.pluginPopups.insertAdjacentHTML(
      'beforeend',
      `<div class="server-details-popup-wrapper">
        <div class="server-details-popup-top-left"></div>
      </div>`
    )
    this.serverDetailsList = this.pluginPopups.querySelector('.server-details-popup-top-left')

    // adding entries
    // this.registerListEntry('test', () => { console.log('test called') })
    // this.registerListEntry('foo', () => { console.log('foo called') })
  }

  /**
   * registerListEntry
   *
   * Plugins implementing an list item are supposed to call this
   *
   * @param displayName is used to display the entry in the list
   * @param clickCallback will be called if the user clicks the item in the list
   */
  registerListEntry (displayName: string, clickCallback: EventListenerOrEventListenerObject) {
    this.numListItems++
    const entryId = `details-entry-${this.numListItems}`
    this.serverDetailsList.insertAdjacentHTML(
      'beforeend',
      `<div class="server-details-entry" id="${entryId}">${displayName}</div>`
    )
    document.querySelector(`#${entryId}`).addEventListener('click', clickCallback)
  }

  toggleDropDown (): void {
    console.log('toggeling server details')
  }
}

export default ServerDetailsPlugin
