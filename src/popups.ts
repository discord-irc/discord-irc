import { getPluginThatImplementsAlert } from "./plugins/plugin_implementations"
import { AlertMessage } from "./socket.io"

export const popupAlert = (message: string, expire: number = 8000) => {
  const plugin = getPluginThatImplementsAlert()
  if (!plugin) {
    console.warn('No alert plugin found')
    return
  }
  const msg: AlertMessage = {
    success: false,
    message: message,
    expire: expire
  }
  plugin.addAlert(msg)
}
