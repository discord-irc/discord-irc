import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage, AuthResponse } from './socket.io'

import DOMPurify from 'dompurify'
// import hljs from 'highlight.js' // works but is slow because it bloats in too many langs
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import rust from 'highlight.js/lib/languages/rust';
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('rust', rust);

import './style.css'
import 'highlight.js/styles/github.css';

interface Account {
    username: string,
    loggedIn: boolean
}

const account = {
    username: 'nameless tee',
    loggedIn: false
}
let unreadMessages: number = 0
const channelName = 'developer'

const addMessageNotification = () => {
    unreadMessages++
    document.title = `#${channelName} (${unreadMessages})`
}

const clearNotifications = () => {
    unreadMessages = 0
    document.title = `#${channelName}`
}

window.addEventListener('focus', () => {
    clearNotifications()
})

const backendUrl: string = process.env.BACKEND_URL

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl)

socket.on('connect', () => {
    console.log(`connected to ${backendUrl}`)
})

const messagesContainer = document.querySelector('.messages')

const xssSanitize = (userinput: string) => {
    userinput = userinput.replaceAll('<', '&lt;')
    userinput = userinput.replaceAll('>', '&gt;')
    return DOMPurify.sanitize(userinput)
}

const enrichText = (userinput: string) => {
    userinput = userinput.replaceAll(
        new RegExp('https?://[a-zA-Z0-9_\\[\\]\\?\\#\\:\\&\\$\\+\\*\\%/\\.]+\\.(png|jpg|jpeg|webp)', 'ig'),
        (m) => `<img class="embed-img" src="${m}">`
    )
    userinput = userinput.replaceAll(
        new RegExp('```(.*)```', 'ig'),
        (m, $1) => `<div class="single-line-code-snippet">${hljs.highlightAuto($1).value}</div>`
    )
    userinput = userinput.replaceAll(
        new RegExp('``(.*)``', 'ig'),
        (m, $1) => `<div class="single-line-code-snippet">${$1}</div>`
    )
    userinput = userinput.replaceAll(
        new RegExp('`(.*)`', 'ig'),
        (m, $1) => `<div class="single-line-code-snippet">${$1}</div>`
    )
    // userinput = userinput.replaceAll(
    //     new RegExp('`(.*)`', 'ig'),
    //     (m, $1) => hljs.highlight($1, {language: 'c'}).value
    // )
    return userinput
}

const renderMessage = (message: IrcMessage, isBridge = false) => {
    messagesContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="message ${isBridge ? "bridge" : ""}">
            <div class="message-img"></div>
            <div class="message-content">
                <div class="message-author">
                    ${xssSanitize(message.from)}
                </div>
                <div class="message-text">
                    ${
                        enrichText(
                            xssSanitize(message.message)
                        )
                    }
                </div>
            </div> <!-- message-content -->
        </div>`
    )
    if (document.hidden) {
        addMessageNotification()
    }
    // autoscroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

socket.on('message', (message: IrcMessage) => {
    console.log(message)
    let isBridge = false
    if (message.from === 'bridge') {
        const slibbers = message.message.split('>')
		message.from = slibbers[0].substring(1)
		message.message = slibbers.slice(1).join('>').substring(1)
		isBridge = true
    }
    renderMessage(message, isBridge)
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
    onLogin(auth.username)
})

const onLogin = (username: string): void => {
    account.username = username
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

document.querySelector('.message-pane form')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const messageInp: HTMLInputElement = document.querySelector('#message-input')
        const message = messageInp.value
        if (!message) {
            return
        }
        messageInp.value = ""
        const ircMessage = {
            from: account.username,
            message: message
        }
        // only render when we get the res from server
        // renderMessage(ircMessage)
        socket.emit('message', ircMessage)
    })

clearNotifications()

fetch(`${backendUrl}/messages`)
    .then(data => data.json())
    .then((messages: IrcMessage[]) => {
        console.log(messages)
        // clears the loading message
        messagesContainer.innerHTML = ""
        messages.forEach((message: IrcMessage) => {
            renderMessage(message)
        })
    })