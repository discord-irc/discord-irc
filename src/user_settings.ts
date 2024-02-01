import { getCookie, setCookie } from './cookies'

interface UserSettings {
  active_plugins: string[]
}

let __userSettings: UserSettings | null = null

export const getDefaultUserSettings = (): UserSettings => {
  return {
    active_plugins: [
      'alert_popup',
      'emoji_picker',
      'typing_emoji_panel',
      'infinite_scroll',
      'typing',
      'tenor',
      'server_details'
    ]
  }
}

export const getUserSettings = (): UserSettings => {
  if (__userSettings != null) {
    return __userSettings
  }
  const currentSettings: string = getCookie('user_settings')
  if (currentSettings !== '') {
    const settings: UserSettings = getDefaultUserSettings()
    setCookie('user_settings', JSON.stringify(settings), 30)
    return settings
  }
  __userSettings = JSON.parse(currentSettings)
  return __userSettings
}

export const setUserSettings = (settings: UserSettings): void => {
  setCookie('user_settings', JSON.stringify(settings), 30)
  __userSettings = settings
}
