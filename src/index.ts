import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage, AuthResponse, LogoutMessage } from './socket.io'

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
let autoScroll = true
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

const messagesContainer: HTMLElement = document.querySelector('.messages')

const xssSanitize = (userinput: string) => {
    userinput = userinput.replaceAll('<', '&lt;')
    userinput = userinput.replaceAll('>', '&gt;')
    return DOMPurify.sanitize(userinput)
}

const replaceEmotes = (message: string): string => {
    return message.replaceAll(
        new RegExp(':([a-zA-Z0-9]+):', 'ig'),
        (m, $1) => {
            if (['fuckyousnail', 'justatest', 'feelsbadman', 'pepeH', 'rocket', 'hissnail'].includes($1)) {
                return `<div class="emote ${$1}"></div>`
            }
            return m
        }
    )
}

const enrichText = (userinput: string) => {
    userinput = userinput.replaceAll(
        new RegExp('https?://[a-zA-Z0-9\\-_\\[\\]\\?\\#\\:\\&\\$\\+\\*\\%/\\.\\=\\@]+', 'ig'),
        (url) => {
            const isWhitelistedCdn: boolean =
                url.startsWith("https://zillyhuhn.com/cs") ||
                url.startsWith("https://raw.githubusercontent.com/") ||
                url.startsWith("https://cdn.discordapp.com/attachments/")
            const isImageUrl: boolean = new RegExp('\\.(png|jpg|jpeg|webp|svg)$', 'i').test(url)
            // https://github.com/foo/bar/@baz.com
            // most browsers would visit the website baz.com
            // and provide https as username and //github.com/foo/bar/
            // as password given those would not be real slashes but
            // some unicode character that looks like a slash
            // since i am too lazy for a more sophisticated check
            // we mark all domains containing an @ as potentially dangerous
            // and make them non clickable
            // here is some flashy youtube video highlighting the problem
            // https://www.youtube.com/watch?v=GCVJsz7EODA
            const isInsecure: boolean = url.includes("@")
            if (isInsecure) {
                return `
                <a
                    class="danger"
                    href="https://github.com/ChillerDragon/discord-irc/blob/6f3fb8d8f78f5c3d3f05e36a292a77d26a9f8d90/src/index.ts#L85-L97"
                >
                    ${url}
                </a>`
            }
            if (isWhitelistedCdn && isImageUrl) {
                return `<img class="embed-img" src="${url}">`
            }
            return `<a href="${url}">${url}</a>`
        }
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
    userinput = replaceEmotes(userinput)
    return userinput
}

const renderMessage = (message: IrcMessage, isBridge = false) => {
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
    // can return 0-65535
    // but should be in the ascii range for most names
    const code = message.from.charCodeAt(0)
    let profileId = 1
    if (code > 512) {
        profileId = 1
    } else if (code > 200) {
        profileId = 2
    } else if (code > 100) {
        profileId = 3
    } else if (code > 95) {
        profileId = 4
    } else if (code > 90) {
        profileId = 5
    } else if (code > 80) {
        profileId = 6
    }
    messagesContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="message">
            <div class="message-img profile${profileId}${isBridge ? " bridge" : ""}"></div>
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
    if (autoScroll) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
    }
}

messagesContainer.addEventListener('scroll', () => {
    const scroll: number = messagesContainer.scrollTop + messagesContainer.offsetHeight
    const maxScroll: number = messagesContainer.scrollHeight
    autoScroll = scroll > maxScroll - 5
})

socket.on('message', (message: IrcMessage) => {
    console.log(message)
    let isBridge = false
    if (message.from === 'bridge') {
        const slibbers = message.message.split('>')
		message.from = slibbers[0].substring(1)
		message.message = slibbers.slice(1).join('>').substring(1)
		isBridge = true
    }
    console.log(`'${message.from}'`)
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

socket.on('logout', (data: LogoutMessage) => {
    if (!account.loggedIn) {
        return
    }
    onLogout()
    addLoginAlert(data.message)
})

const onLogout = (): void => {
    const overlay: HTMLElement = document.querySelector('.overlay')
    overlay.style.display = 'block'
    loginPopup.style.display = 'block'
}

const onLogin = (username: string): void => {
    account.username = username
    account.loggedIn = true
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