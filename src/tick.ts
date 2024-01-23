import { getPlugins } from './plugins/plugins'

/**
 * Run every second
 */
const OnTick = () => {
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      plugin.onTick()
    }
  })
}

export const startGameLoop = () => {
  setInterval(OnTick, 1000)
}
