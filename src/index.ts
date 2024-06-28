import { IrcMessage, AuthResponse, LogoutMessage, AlertMessage } from './socket.io'

import './css/style.css'
import './css/emotes.css'
import 'highlight.js/styles/base16/solarized-dark.css'
import { autoComplete } from './autocomplete'
import { addUser, removeUser, allKnownUsernames, updateUserList } from './users'
import { clearNotifications, toggleNotifications, isNotificationsActive } from './notifications'
import { getAccount } from './account'
import { translateEmotes } from './rich_text'
import { getCookie, setCookie } from './cookies'
import { getActiveChannel, getActiveServer } from './channels'
import { backendUrl } from './backend'
import { getSocket } from './ws_connection'
import { startGameLoop } from './tick'
import { getPluginThatImplements, getPlugins, isPluginActive } from './plugins/plugins'
import { getNextMessageId } from './message_ids'
import './settings_menu'
import './mobile'
import './servers'
import { AlertPluginImplementation, getPluginThatImplementsAlert, getPluginThatImplementsMessageLoader } from './plugins/plugin_implementations'
import { requestServerList } from './servers'

const messageInp: HTMLInputElement = document.querySelector('#message-input')

window.addEventListener('focus', () => {
  clearNotifications()
})

getSocket().on('connect', () => {
  console.log(`connected to ${backendUrl}`)
})

getSocket().on('message', (message: IrcMessage) => {
  for (const plugin of getPlugins()) {
    if (plugin.isActive()) {
      if (plugin.onMessage(message)) {
        return
      }
    }
  }
})

getSocket().on('alert', (msg: AlertMessage) => {
  const plugin = getPluginThatImplementsAlert()
  if (!plugin) {
    console.warn('No alert plugin found')
    return
  }
  plugin.addFlash(msg)
})

const loginForm: HTMLElement = document.querySelector('.login-form')
const registerForm: HTMLElement = document.querySelector('.register-form')

const formPopup: HTMLElement = document.querySelector('.form-popup')
const formPopupAlerts: HTMLElement = formPopup.querySelector('.alerts')

const linkRegister: HTMLElement = document.querySelector('.link-register')
const linkLogin: HTMLElement = document.querySelector('.link-login')

const switchToLoginForm = (): void => {
  loginForm.classList.add('active')
  registerForm.classList.remove('active')
}

const switchToRegisterForm = (): void => {
  loginForm.classList.remove('active')
  registerForm.classList.add('active')
}

linkRegister.addEventListener('click', (event) => {
  event.preventDefault()
  switchToRegisterForm()
})

linkLogin.addEventListener('click', (event) => {
  event.preventDefault()
  switchToLoginForm()
})

const addLoginAlert = (message: string): void => {
  formPopupAlerts.insertAdjacentHTML(
    'beforeend',
        `<div class="alert">
            ${message}
        </div>`
  )
}

const addLoginNotice = (message: string): void => {
  formPopupAlerts.insertAdjacentHTML(
    'beforeend',
        `<div class="notice">
            ${message}
        </div>`
  )
}

getSocket().on('authResponse', (auth: AuthResponse) => {
  if (!auth.success) {
    addLoginAlert(auth.message)
    return
  }

  if (auth.message === 'logged in') {
    onLogin(auth)
  } else {
    addLoginNotice(auth.message)
    switchToLoginForm()
    const usernameInp: HTMLInputElement = loginForm.querySelector('#username-input')
    const passwordInp: HTMLInputElement = loginForm.querySelector('#password-input')
    usernameInp.value = ''
    passwordInp.value = ''
  }
})

getSocket().on('logout', (data: LogoutMessage) => {
  if (!getAccount().loggedIn) {
    return
  }
  onLogout()
  addLoginAlert(data.message)
})

getSocket().on('userJoin', (username: string) => {
  addUser(username)
})

getSocket().on('userLeave', (username: string) => {
  removeUser(username)
})

const onLogout = (): void => {
  const overlay: HTMLElement = document.querySelector('.overlay')
  overlay.style.display = 'block'
  formPopup.style.display = 'block'
}

const onLogin = (authResponse: AuthResponse): void => {
  getAccount().username = authResponse.username
  getAccount().admin = authResponse.admin
  getAccount().loggedIn = true
  getAccount().sessionToken = authResponse.token
  const passwordInp: HTMLInputElement = document.querySelector('#password-input')
  setCookie('username', authResponse.username, 30)
  setCookie('password', passwordInp.value, 30)
  const overlay: HTMLElement = document.querySelector('.overlay')
  overlay.style.display = 'none'
  formPopup.style.display = 'none'

  const loader = getPluginThatImplementsMessageLoader()
  if(loader) {
    loader.reloadMessageBacklog()
  } else {
    console.warn('no plugin found that implements message loading')
  }
  requestServerList()
}

formPopup.querySelector('.login-form')
  .addEventListener('submit', (event) => {
    event.preventDefault()
    const usernameInp: HTMLInputElement = loginForm.querySelector('#username-input')
    const passwordInp: HTMLInputElement = loginForm.querySelector('#password-input')
    const username = usernameInp.value
    const password = passwordInp.value
    if (username === '') {
      return
    }
    if (password === '') {
      return
    }
    console.log(`requesting to join '${getActiveServer()}#${getActiveChannel()}'`)
    getSocket().emit(
      'authRequest',
      {
        username,
        password,
        channel: getActiveChannel(),
        server: getActiveServer()
      }
    )
  })

formPopup.querySelector('.register-form')
  .addEventListener('submit', (event) => {
    event.preventDefault()
    const usernameInp: HTMLInputElement = registerForm.querySelector('#username-input')
    const passwordInp: HTMLInputElement = registerForm.querySelector('#password-input')
    const tokenInp: HTMLInputElement = registerForm.querySelector('#token-input')
    const username = usernameInp.value
    const password = passwordInp.value
    const token = tokenInp.value
    if (username === '') {
      return
    }
    if (password === '') {
      return
    }
    console.log(`requesting to register as '${username}'`)
    getSocket().emit(
      'registerRequest',
      {
        username,
        password,
        token
      }
    )
  })

document.querySelector('form.input-pane')
  .addEventListener('submit', (event) => {
    event.preventDefault()
    const message = messageInp.value
    if (message === '') {
      return
    }
    messageInp.value = ''
    const ircMessage = {
      id: getNextMessageId(),
      from: getAccount().username,
      message: translateEmotes(message),
      token: getAccount().sessionToken,
      channel: getActiveChannel(),
      server: getActiveServer(),
      date: new Date().toUTCString()
    }
    // only render when we get the res from server
    // renderMessage(ircMessage)
    getSocket().emit('message', ircMessage)
  })

const prefillLoginForm = (): void => {
  const username = getCookie('username')
  if (username !== '') {
    const usernameInp: HTMLInputElement = document.querySelector('#username-input')
    usernameInp.focus()
    usernameInp.value = username
  }
  const password = getCookie('password')
  if (password !== '') {
    const passwordInp: HTMLInputElement = document.querySelector('#password-input')
    passwordInp.focus()
    passwordInp.value = password
  }
}

const usersButton: HTMLElement = document.querySelector('.users-icon')
const userlistPane: HTMLElement = document.querySelector('.user-list-pane')
const layoutDiv: HTMLElement = document.querySelector('.layout')
usersButton.addEventListener('click', () => {
  layoutDiv.classList.toggle('expanded-user-list')
  userlistPane.classList.toggle('active')
})

const bellDiv: HTMLElement = document.querySelector('.notification-bell')
bellDiv.addEventListener('click', () => {
  if (!Notification) {
    alert('Desktop notifications not available in your browser. Try Chromium.')
    return
  }

  if (Notification.permission !== 'granted') {
    Notification.requestPermission()
    return
  }
  toggleNotifications()
  if (isNotificationsActive()) {
    bellDiv.classList.add('active')
  } else {
    bellDiv.classList.remove('active')
  }
})

messageInp.addEventListener('keydown', (event: KeyboardEvent) => {
  autoComplete('@', allKnownUsernames(), event, messageInp, ' ')
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      plugin.onKeydownMessageInput(event, messageInp)
    }
  })
})

/*
    RUN ON PAGE LOAD
*/

startGameLoop()
clearNotifications()
prefillLoginForm()
getPlugins().forEach((plugin) => {
  plugin.active = isPluginActive(plugin.pluginName)
  if (plugin.isActive()) {
    plugin.onInit()
  }
})

fetch(`${backendUrl}/users`)
  .then(async data => await data.json())
  .then((users: string[]) => {
    users.forEach((username: string) => {
      addUser(username, false)
    })
    updateUserList()
  })
