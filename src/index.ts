import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage, AuthResponse, LogoutMessage } from './socket.io'

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

import './style.css'
import 'highlight.js/styles/base16/solarized-dark.css'
import { getAllEmoteNames } from './emotes'
import { autoComplete } from './autocomplete';
import { knownDiscordNames, updateUserListDiscord, addUser, removeUser, allKnownUsernames, updateUserList } from './users';
import { clearNotifications, toggleNotifications, isNotificationsActive } from './notifications';
import { account } from './account';
import { clearMessagesContainer, renderMessage } from './render_message';
import { translateEmotes } from './rich_text';
import { getCookie, setCookie } from './cookies';

const messageInp: HTMLInputElement = document.querySelector('#message-input')

window.addEventListener('focus', () => {
    clearNotifications()
})

const backendUrl: string = process.env.BACKEND_URL

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl)

socket.on('connect', () => {
    console.log(`connected to ${backendUrl}`)
})

const addMessage = (message: IrcMessage) => {
    let isBridge = false
    if (message.from === 'bridge') {
        const slibbers = message.message.split('>')
        message.from = slibbers[0].substring(1)
        message.message = slibbers.slice(1).join('>').substring(1)
        if (knownDiscordNames.indexOf(message.from) === -1) {
            knownDiscordNames.push(message.from)
            updateUserListDiscord()
        }
        isBridge = true
    }
    renderMessage(message, isBridge)
}

socket.on('message', (message: IrcMessage) => {
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

socket.on('authResponse', (auth: AuthResponse) => {
    if (!auth.success) {
        addLoginAlert(auth.message)
        return
    }
    onLogin(auth)
})

socket.on('logout', (data: LogoutMessage) => {
    if (!account.loggedIn) {
        return
    }
    onLogout()
    addLoginAlert(data.message)
})

socket.on('userJoin', (username: string) => {
    addUser(username)
})

socket.on('userLeave', (username: string) => {
    removeUser(username)
})

const onLogout = (): void => {
    const overlay: HTMLElement = document.querySelector('.overlay')
    overlay.style.display = 'block'
    loginPopup.style.display = 'block'
}

const onLogin = (authResponse: AuthResponse): void => {
    account.username = authResponse.username
    account.loggedIn = true
    account.sessionToken = authResponse.token
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
        socket.emit(
            'authRequest',
            {
                username: username,
                password: password
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
            from: account.username,
            message: translateEmotes(message),
            token: account.sessionToken,
            date: new Date().toUTCString()
        }
        // only render when we get the res from server
        // renderMessage(ircMessage)
        socket.emit('message', ircMessage)
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
    layoutDiv.classList.toggle('expanded')
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
})

/*
    RUN ON PAGE LOAD
*/

clearNotifications()
prefillLoginForm()

fetch(`${backendUrl}/users`)
    .then(data => data.json())
    .then((users: string[]) => {
        users.forEach((username: string) => {
            addUser(username, false)
        })
        updateUserList()
    })

fetch(`${backendUrl}/messages`)
    .then(data => data.json())
    .then((messages: IrcMessage[]) => {
        // clears the loading message
        clearMessagesContainer()
        messages.forEach((message: IrcMessage) => {
            addMessage(message)
        })
    })
