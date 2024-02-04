import BasePlugin from '../base_plugin'

import '../../css/plugins/server_details.css'
import { ServerDetailsPluginImplementation } from '../plugin_implementations'

interface serverDetailsListEntry {
  displayName: string
  clickCallback: EventListenerOrEventListenerObject
  displayCallback: () => boolean
}

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
  listItems: serverDetailsListEntry[]
  listCollapsed: boolean

  constructor () {
    super('server_details')

    this.listItems = []
    this.listCollapsed = true
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
    this.registerListEntry('add your entries here', () => { console.log('foo called') }, () => true)
  }

  /**
   * registerListEntry
   *
   * Plugins implementing an list item are supposed to call this
   *
   * @param displayName is used to display the entry in the list
   * @param clickCallback will be called if the user clicks the item in the list
   * @param displayCallback return true or falls in here to show and hide the entry in the list
   *                        this is used to hide buttons that are admin only
   *                        for unauthorized users
   */
  registerListEntry (
    displayName: string,
    clickCallback: EventListenerOrEventListenerObject,
    displayCallback: () => boolean) {
    this.listItems.push({
      displayName: displayName,
      clickCallback: clickCallback,
      displayCallback: displayCallback
    })
  }

  buildList (): void {
    this.serverDetailsList.innerHTML = ''
    let index = 1
    this.listItems.forEach((listItem) => {
      const entryId = `details-entry-${index++}`
      if(!listItem.displayCallback()) {
        return
      }
      this.serverDetailsList.insertAdjacentHTML(
        'beforeend',
        `<div class="server-details-entry" id="${entryId}">${listItem.displayName}</div>`
      )
      // TODO: do we have to delete event listeners too?
      //       or does wiping the elements they are attached to do that for us?
      document.querySelector(`#${entryId}`).addEventListener('click', listItem.clickCallback)
    })
  }

  toggleDropDown (): void {
    // console.log(`toggeling server details => ${this.listCollapsed ? 'opening' : 'closing'}`)
    this.serverDetailsList.innerHTML = ''
    if(this.listCollapsed) {
      this.buildList()
    }
    this.listCollapsed = !this.listCollapsed
  }
}

export default ServerDetailsPlugin
