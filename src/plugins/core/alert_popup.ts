import { AlertMessage } from '../../socket.io'
import { getSocket } from '../../ws_connection'
import BasePlugin from '../base_plugin'

import '../../css/plugins/alert_popup.css'

class AlertPopupPlugin extends BasePlugin {
  pluginPopups: HTMLElement
  alertPopupsList: HTMLElement
  alerts: AlertMessage[]

  constructor () {
    super('alert_popup')

    this.pluginPopups = document.querySelector('.plugin-popups')
    this.pluginPopups.insertAdjacentHTML(
      'beforeend',
      '<div class="alert-popups-list"></div>'
    )
    this.alertPopupsList = this.pluginPopups.querySelector('.alert-popups-list')
    this.alerts = []

    getSocket().on('alert', (msg: AlertMessage) => this.onAlert(msg))
  }

  onTick (): void {
    const now = new Date().valueOf()
    const filtered = this.alerts.filter((msg) => msg.expire > now)
    if (filtered.length !== this.alerts.length) {
      this.alerts = filtered
      this.updateAlertList()
    }
  }

  updateAlertList () {
    this.alertPopupsList.innerHTML = ''
    this.alerts.forEach((msg) => {
      this.alertPopupsList.insertAdjacentHTML('beforeend', `<div class="alert-popup-top-left alert">${msg.message}</div>`)
    })
  }

  onAlert (msg: AlertMessage) {
    msg.expire = new Date(new Date().valueOf() + msg.expire).valueOf()
    this.alerts.push(msg)
    this.updateAlertList()
  }
}

export default AlertPopupPlugin
