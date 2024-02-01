import { AlertMessage } from '../../socket.io'
import BasePlugin from '../base_plugin'
import { getPluginThatImplementsAlert } from '../plugin_implementations'

class CrashLog {
  event: Event | string
  source?: string
  lineno?: number
  colno?: number
  error?: Error

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event
  // onerror = (event, source, lineno, colno, error) => {};
  // i used the same types as my lib.dom.d.ts
  constructor (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) {
    this.event = event
    this.source = source // file
    this.lineno = lineno
    this.colno = colno
  }

  toString () {
    return `[crash] ${this.event} ${this.source}:${this.lineno}:${this.colno}`
  }
}

class CrashLoggerPlugin extends BasePlugin {
  crashLogs: CrashLog[]

  constructor () {
    super('crash_logger')

    this.crashLogs = []
  }

  onInit (): void {
    console.log('crash logger init ...')
    if (window.onerror !== null) {
      throw new Error(`[crash_logger] failed to set window.onerror. Not overwriting the following callback: ${window.onerror}`)
    }
    window.onerror = (message, file, line, column, error) => {
      console.log(`[crash_logger] ${error}`)
      const crashLog = new CrashLog(message, file, line, column, error)
      this.crashLogs.push(crashLog)
      const plugin = getPluginThatImplementsAlert()
      if (plugin) {
        const alertMsg: AlertMessage = {
          success: false,
          message: crashLog.toString(),
          expire: 8000
        }
        plugin.addAlert(alertMsg)
      } else {
        console.warn('No alert plugin found')
      }
    }
  }
}

export default CrashLoggerPlugin
