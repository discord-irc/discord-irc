import { AlertMessage } from '../../socket.io'
import { AlertPluginImplementation } from '../plugin_implementations'

import '../../css/plugins/alert_popup.css'

class AlertPopupPlugin extends AlertPluginImplementation {
  pluginPopups: HTMLElement
  alertPopupsList: HTMLElement
  alerts: AlertMessage[]

  constructor () {
    super('alert_popup')

    // TODO: this should not be in the constructor but in the onInit instead
    //       no logic or method calls what so ever are supposed to happen in a constructor
    //       some dudes on stackoverflow said that. Also in the case of a plugin system
    //       with a dedicated onInit() method it makes even more sense.
    this.pluginPopups = document.querySelector('.plugin-popups')
    this.pluginPopups.insertAdjacentHTML(
      'beforeend',
      '<div class="alert-popups-list"></div>'
    )
    this.alertPopupsList = this.pluginPopups.querySelector('.alert-popups-list')
    this.alerts = []
  }

  onTick (): void {
    const now = new Date().valueOf()
    const filtered = this.alerts.filter((msg) => msg.expire > now)
    if (filtered.length !== this.alerts.length) {
      this.alerts = filtered
      this.updateAlertList()
    }
  }

  updateAlertList (): void {
    this.alertPopupsList.innerHTML = ''
    this.alerts.forEach((msg) => {
      this.alertPopupsList.insertAdjacentHTML('beforeend', `<div class="alert-popup-top-left alert">${msg.message}</div>`)
    })
  }

  addAlert (msg: AlertMessage): void {
    msg.expire = new Date(new Date().valueOf() + msg.expire).valueOf()
    this.alerts.push(msg)
    this.updateAlertList()
  }
}

export default AlertPopupPlugin
