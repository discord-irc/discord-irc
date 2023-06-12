import { getPlugins } from "./plugins/plugins"

/**
 * Run every second
 */
const OnTick = () => {
    getPlugins().forEach((plugin) => {
        plugin.onTick()
    })
}

export const startGameLoop = () => {
    setInterval(OnTick, 1000)
}
