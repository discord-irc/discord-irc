import { IrcMessage, AuthResponse, LogoutMessage, TypingInfo } from './socket.io'

// import hljs from 'highlight.js' // works but is slow because it bloats in too many langs
import hljs from 'highlight.js/lib/core'
import plaintext from 'highlight.js/lib/languages/plaintext';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import yaml from 'highlight.js/lib/languages/yaml';
import json from 'highlight.js/lib/languages/json';
import bash from 'highlight.js/lib/languages/bash';
import shell from 'highlight.js/lib/languages/shell';
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('html', xml);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('shell', shell);

import './css/style.css'
import './css/emotes.css'
import 'highlight.js/styles/base16/solarized-dark.css'
import { getAllEmoteNames } from './emotes'
import { autoComplete } from './autocomplete'
import { addUser, removeUser, allKnownUsernames, updateUserList } from './users'
import { clearNotifications, toggleNotifications, isNotificationsActive } from './notifications'
import { getAccount } from './account'
import { translateEmotes } from './rich_text'
import { getCookie, setCookie } from './cookies'
import { getActiveChannel, getActiveServer } from './channels'
import { backendUrl } from './backend'
import { addMessage, reloadMessageBacklog } from './message_loader'
import { getSocket } from './ws_connection'
import { startGameLoop } from './tick'
import { getPlugins } from './plugins/plugins'
import { getNextMessageId } from './message_ids'
import './settings'

const messageInp: HTMLInputElement = document.querySelector('#message-input')

window.addEventListener('focus', () => {
    clearNotifications()
})

getSocket().on('connect', () => {
    console.log(`connected to ${backendUrl}`)
})

getSocket().on('message', (message: IrcMessage) => {
    addMessage(message)
})

const loginPopup: HTMLElement = document.querySelector('.login-popup')
const loginPopupAlerts: HTMLElement = loginPopup.querySelector('.alerts')

const addLoginAlert = (message: string): void => {
    loginPopupAlerts.insertAdjacentHTML(
        'beforeend',
        `<div class="alert">
            ${message}
        </div>`
    )
}

getSocket().on('authResponse', (auth: AuthResponse) => {
    if (!auth.success) {
        addLoginAlert(auth.message)
        return
    }
    onLogin(auth)
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
    loginPopup.style.display = 'block'
}

const onLogin = (authResponse: AuthResponse): void => {
    getAccount().username = authResponse.username
    getAccount().loggedIn = true
    getAccount().sessionToken = authResponse.token
    const passwordInp: HTMLInputElement = document.querySelector('#password-input')
    setCookie('username', authResponse.username, 30)
    setCookie('password', passwordInp.value, 30)
    const overlay: HTMLElement = document.querySelector('.overlay')
    overlay.style.display = 'none'
    loginPopup.style.display = 'none'
}

loginPopup.querySelector('form')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const usernameInp: HTMLInputElement = document.querySelector('#username-input')
        const passwordInp: HTMLInputElement = document.querySelector('#password-input')
        const username = usernameInp.value
        const password = passwordInp.value
        if (!username) {
            return
        }
        if (!password) {
            return
        }
        console.log(`requesting to join '${getActiveServer()}#${getActiveChannel()}'`)
        getSocket().emit(
            'authRequest',
            {
                username: username,
                password: password,
                channel: getActiveChannel(),
                server: getActiveServer()
            }
        )
    })

document.querySelector('form.input-pane')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const message = messageInp.value
        if (!message) {
            return
        }
        messageInp.value = ""
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

const prefillLoginForm = () => {
    const username = getCookie('username')
    if (username) {
        const usernameInp: HTMLInputElement = document.querySelector('#username-input')
        usernameInp.focus()
        usernameInp.value = username
    }
    const password = getCookie('password')
    if (password) {
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
    autoComplete(':', getAllEmoteNames(), event, messageInp, ': ')
    getPlugins().forEach((plugin) => {
        plugin.onKeydown(event)
    })
})

/*
    RUN ON PAGE LOAD
*/

startGameLoop()
clearNotifications()
prefillLoginForm()
reloadMessageBacklog()
getPlugins().forEach((plugin) => plugin.onInit())

fetch(`${backendUrl}/users`)
    .then(data => data.json())
    .then((users: string[]) => {
        users.forEach((username: string) => {
            addUser(username, false)
        })
        updateUserList()
    })
