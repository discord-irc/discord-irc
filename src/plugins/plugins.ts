import BasePlugin from "./base_plugin"
import TypingPlugin from "./core/typing"

const plugins: BasePlugin[] = []
plugins.push(new TypingPlugin())

export const getPlugins = (): BasePlugin[] => {
    return plugins
}
