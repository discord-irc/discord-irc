import { AlertMessage } from "../socket.io";
import BasePlugin from "./base_plugin";
import { getPluginThatImplements, getPlugins } from "./plugins";

export type PluginImplementation = 'alert' | 'emoji_completion'

export class AlertPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('alert')
  }

  addAlert (msg: AlertMessage): void {
  }
}

export class EmojiCompletionPluginImplementation extends BasePlugin {
  constructor(pluginName: string) {
    super(pluginName)
    this.implementations.push('emoji_completion')
  }
}

export const getPluginThatImplementsAlert = (): AlertPluginImplementation | null => {
  return getPluginThatImplements('alert') as AlertPluginImplementation | null
}

export const getPluginThatImplementsEmojiCompletion = (): EmojiCompletionPluginImplementation | null => {
  return getPluginThatImplements('emoji_completion') as EmojiCompletionPluginImplementation | null
}

export type IPluginImplementation =
  EmojiCompletionPluginImplementation |
  AlertPluginImplementation |
  BasePlugin
