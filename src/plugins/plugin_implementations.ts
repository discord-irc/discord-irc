import { AlertMessage } from "../socket.io";
import BasePlugin from "./base_plugin";
import { getPluginThatImplements, getPlugins } from "./plugins";

export type PluginImplementation = 'alert' | 'emoji_completion' | 'server_details'

export class AlertPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('alert')
  }

  addFlash (msg: AlertMessage): void {
  }
}

export class EmojiCompletionPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('emoji_completion')
  }
}

export class ServerDetailsPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('server_details')
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
    }
}

export const getPluginThatImplementsAlert = (): AlertPluginImplementation | null => {
  return getPluginThatImplements('alert') as AlertPluginImplementation | null
}

export const getPluginThatImplementsEmojiCompletion = (): EmojiCompletionPluginImplementation | null => {
  return getPluginThatImplements('emoji_completion') as EmojiCompletionPluginImplementation | null
}

export const getPluginThatImplementsServerDetails = (): ServerDetailsPluginImplementation | null => {
  return getPluginThatImplements('server_details') as ServerDetailsPluginImplementation | null
}


export type IPluginImplementation =
  EmojiCompletionPluginImplementation |
  AlertPluginImplementation |
  ServerDetailsPluginImplementation |
  BasePlugin
