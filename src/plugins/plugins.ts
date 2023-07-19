import { getUserSettings } from "../user_settings"
import BasePlugin from "./base_plugin"
import AlertPopupPlugin from "./core/alert_popup"
import EmojiPickerPlugin from "./core/emoji_picker"
import InfiniteScrollPlugin from "./core/infinite_scroll"
import TypingPlugin from "./core/typing"

const plugins: BasePlugin[] = []
plugins.push(new TypingPlugin())
plugins.push(new EmojiPickerPlugin())
plugins.push(new InfiniteScrollPlugin())
plugins.push(new AlertPopupPlugin())

export const getPlugins = (): BasePlugin[] => {
    return plugins
}

export const isPluginActive = (pluginName: string): boolean => {
    const settings = getUserSettings()
    console.log(settings.active_plugins)
    return settings.active_plugins.includes(pluginName)
}
