import { getUserSettings, setUserSettings } from '../user_settings'
import BasePlugin from './base_plugin'
import AlertPopupPlugin from './core/alert_popup'
import EmojiPickerPlugin from './core/emoji_picker'
import InfiniteScrollPlugin from './core/infinite_scroll'
import TypingPlugin from './core/typing'
import TenorPlugin from './core/tenor'
import TypingEmojiPanelPlugin from './core/typing_emoji_panel'
import ServerDetailsPlugin from './core/server_details'
import CrashLoggerPlugin from './core/crash_logger'
import MessageLoaderPlugin from './core/message_loader'
import { IPluginImplementation, PluginImplementation, getPluginThatImplementsAlert } from './plugin_implementations'
import { popupAlert } from '../popups'
import EmojiTabCompletePlugin from './core/emoji_tab_complete'
import ServerSettingsPlugin from './core/server_settings'
import TeePetsPlugin from './core/tee_pets'

const plugins: BasePlugin[] = []
plugins.push(new CrashLoggerPlugin()) // Keep it here! Load crash logger as first plugin!
plugins.push(new MessageLoaderPlugin())
plugins.push(new TypingPlugin())
plugins.push(new EmojiPickerPlugin())
plugins.push(new TypingEmojiPanelPlugin())
plugins.push(new InfiniteScrollPlugin())
plugins.push(new AlertPopupPlugin())
plugins.push(new TenorPlugin())
plugins.push(new ServerDetailsPlugin())
plugins.push(new EmojiTabCompletePlugin())
plugins.push(new ServerSettingsPlugin())
plugins.push(new TeePetsPlugin())

export const getPlugins = (): BasePlugin[] => {
  return plugins
}

// TODO: also add and prefer to use getPluginThatImplements()
//       https://github.com/discord-irc/discord-irc/issues/34
export const getPluginByName = (pluginName: string, active: boolean = true): BasePlugin | null => {
  // TODO: performance ... I assume filter() would be faster but watever
  console.warn('[!] Warning: getPluginByName() is deprecated! Use getPluginThatImplements() instead!!!')
  for (const plugin of getPlugins()) {
    if (plugin.isActive() === active && plugin.pluginName === pluginName) {
      return plugin
    }
  }
  return null
}

export const getPluginThatImplements = (implementation: PluginImplementation): IPluginImplementation | null => {
  for (const plugin of getPlugins()) {
    if (plugin.isActive() && plugin.implementations.includes(implementation)) {
      return plugin
    }
  }
  return null
}

export const isPluginActive = (pluginName: string): boolean => {
  const settings = getUserSettings()
  return settings.active_plugins.includes(pluginName)
}

export const deactivatePlugin = (pluginName: string): void => {
  const settings = getUserSettings()
  const newPlugins = settings.active_plugins.filter((plugin) => plugin !== pluginName)
  settings.active_plugins = newPlugins
  setUserSettings(settings)
}

export const activatePlugin = (pluginName: string): void => {
  const settings = getUserSettings()
  settings.active_plugins.push(pluginName)
  setUserSettings(settings)

  // TODO: never add plugin hot reloading
  //       or this line breaks
  //       also the order of plugins loaded would be messed
  //       either way page reload is the way to go
  //       to properly reload all plugins
  const plugin = getPluginByName(pluginName, false) || getPluginByName(pluginName, true)
  if(plugin === null) {
    console.warn(`Activated plugin '${pluginName}' but did not find plugin`)
    return
  }
  for (const implementation of plugin.implementations) {
    const conflictingPlugin = getPluginThatImplements(implementation)
    if(conflictingPlugin !== null && conflictingPlugin.pluginName !== pluginName) {
      popupAlert(`Plugin '${pluginName}' conflicts with '${conflictingPlugin.pluginName}' both implement '${implementation}'`)
    }
  }
}
