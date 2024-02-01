import { popupAlert } from '../../popups'
import { AlertMessage } from '../../socket.io'
import BasePlugin from '../base_plugin'
import { getPluginThatImplementsAlert } from '../plugin_implementations'

class CrashLog {
  event: Event | string
  source?: string
  lineno?: number
  colno?: number
  error?: Error | string // hack by chiler to add `| string`

  // https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event
  // onerror = (event, source, lineno, colno, error) => {};
  // i used the same types as my lib.dom.d.ts
  //
  // i added `| string` to error to be able to use it from window.onunhandledrejection too -----------.
  //                                                                                                   v
  constructor (event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error | string) {
    this.event = event
    this.source = source // file
    this.lineno = lineno
    this.colno = colno
    this.error = error
  }

  toString () {
    return `[crash_logger] ${this.event} ${this.source}:${this.lineno}:${this.colno} ${this.error}`
  }
}

class CrashLoggerPlugin extends BasePlugin {
  crashLogs: CrashLog[]

  constructor () {
    super()
    this.pluginName = this.classNameToSnake(this.constructor.name)

    this.crashLogs = []
  }

  onInit (): void {
    console.log('crash logger init ...')
    this.hookWindowError()
    this.hookPromiseError()
  }

  logCrash (crashLog: CrashLog): void {
    this.crashLogs.push(crashLog)
    popupAlert(crashLog.toString(), 80000)
  }

  hookPromiseError () {
    if (window.onunhandledrejection !== null) {
      throw new Error(`[crash_logger] failed to set window.onunhandledrejection. Not overwriting the following callback: ${window.onunhandledrejection}`)
    }
    window.onunhandledrejection = (event: PromiseRejectionEvent) => {
      // promise reaon
      const crashLog = new CrashLog(event, JSON.stringify(event.promise), null, null, event.reason)
      this.logCrash(crashLog)
    }
  }

  hookWindowError () {
    if (window.onerror !== null) {
      throw new Error(`[crash_logger] failed to set window.onerror. Not overwriting the following callback: ${window.onerror}`)
    }
    window.onerror = (message, file, line, column, error) => {
      // TODO: support source maps from webpack omg
      const crashLog = new CrashLog(message, file, line, column, error)
      this.logCrash(crashLog)
    }
  }
}

export default CrashLoggerPlugin
