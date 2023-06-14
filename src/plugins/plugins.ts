import BasePlugin from "./base_plugin"
import EmojiPickerPlugin from "./core/emoji_picker"
import TypingPlugin from "./core/typing"

const plugins: BasePlugin[] = []
plugins.push(new TypingPlugin())
plugins.push(new EmojiPickerPlugin())

export const getPlugins = (): BasePlugin[] => {
    return plugins
}
