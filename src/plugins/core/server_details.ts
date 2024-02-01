import BasePlugin from '../base_plugin'

class ServerDetailsPlugin extends BasePlugin {
  toggleButton: HTMLElement

  constructor () {
    super('server_details')

    this.toggleButton = document.querySelector('.server-details-desktop-toggle')
  }

  onInit (): void {
    console.log('server details init ...')
    this.toggleButton.addEventListener('click', (event) => {
      this.toggleDropDown()
    })
  }

  toggleDropDown (): void {
    console.log('toggeling server details')
  }
}

export default ServerDetailsPlugin
