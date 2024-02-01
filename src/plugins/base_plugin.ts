import { IrcMessage } from "../socket.io"
import { PluginImplementation } from "./plugin_implementations"

class BasePlugin {
  pluginName: string
  active: boolean
  implementations: PluginImplementation[]

  constructor (pluginName: string, implementations: PluginImplementation[] = []) {
    this.pluginName = pluginName
    this.implementations = implementations
    this.active = false
  }

  isActive (): boolean {
    return this.active
  }

  deactivate (): void {
    this.active = false
  }

  activate (): void {
    this.active = true
  }

  onInit (): void {
  }

  onTick (): void {
  }

  onPreEnrichText (text: string): string {
    return text
  }

  onEnrichUrl (url: string): string | null {
    return null
  }

  onSwitchChannel (oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
  }

  /**
   * onKeydownMessageInput
   *
   * Triggered when a user types in the main chat box
   * the input field to send a message
   *
   * @param event the javascript keydown KeyboardEvent on messageInp
   * @param messageInp the input dom element
   */
  onKeydownMessageInput (event: KeyboardEvent, messageInp: HTMLInputElement): void {
  }

  /**
   * onMessage
   *
   * It is being called if a new message is received from the backend via the websocket connection
   *
   * RETURN FALSE UNLESS YOU KNOW WHAT YOU ARE DOING !!!
   *
   * @returns true if the message is filtered. Following plugins will not receive the event anymore.
   *          Ordering the plugins list in that case matters
   *          If you want to build a filter chat plugin it should be inserted at the top of the plugins list
   *
   * @param message The newly received irc message
   *                If you want to build a text transformation plugin. Such as censor. Or rich text
   *                You can just alter the properties of this `message` parameter
   *
   * @example
   * onMessage (message: IrcMessage): boolean {
   *  return message.message.includes('filter word')
   * }
   */
  onMessage (message: IrcMessage): boolean {
    return false
  }
}

export default BasePlugin
