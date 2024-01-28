import { getPlugins } from './plugins/plugins'

/**
 * Run every second
 */
const OnTick = (): void => {
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      plugin.onTick()
    }
  })
}

export const startGameLoop = (): void => {
  setInterval(OnTick, 1000)
}
