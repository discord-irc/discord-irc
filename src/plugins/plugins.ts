import { getUserSettings, setUserSettings } from "../user_settings"
import BasePlugin from "./base_plugin"
import AlertPopupPlugin from "./core/alert_popup"
import EmojiPickerPlugin from "./core/emoji_picker"
import InfiniteScrollPlugin from "./core/infinite_scroll"
import TypingPlugin from "./core/typing"
import TenorPlugin from "./core/tenor"

const plugins: BasePlugin[] = []
plugins.push(new TypingPlugin())
plugins.push(new EmojiPickerPlugin())
plugins.push(new InfiniteScrollPlugin())
plugins.push(new AlertPopupPlugin())
plugins.push(new TenorPlugin())

export const getPlugins = (): BasePlugin[] => {
    return plugins
}

export const isPluginActive = (pluginName: string): boolean => {
    const settings = getUserSettings()
    return settings.active_plugins.includes(pluginName)
}

export const deactivatePlugin = (pluginName: string) => {
    const settings = getUserSettings()
    const newPlugins = settings.active_plugins.filter((plugin) => plugin !== pluginName)
    settings.active_plugins = newPlugins
    setUserSettings(settings)
}

export const activatePlugin = (pluginName: string) => {
    const settings = getUserSettings()
    settings.active_plugins.push(pluginName)
    setUserSettings(settings)
}
