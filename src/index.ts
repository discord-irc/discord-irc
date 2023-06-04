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
    loggedIn: false,
    sessionToken: 'unset'
}
let autoScroll = true
let unreadMessages: number = 0
let unreadPings: number = 0
let notificationsActive: boolean = false
const channelName = 'developer'

const connectedUsers: string[] = []
const knownDiscordNames: string[] = []

const userListDiv: HTMLElement = document.querySelector('.user-list')
const userListDiscordDiv: HTMLElement = document.querySelector('.user-list-discord')
const messageInp: HTMLInputElement = document.querySelector('#message-input')

let tabNameIndex: number = 0
/*
    tabAppendLen

    number of characters we appended after @
    when pressing tab.

    The same amount will be wiped on next tab press
    to iterate names.
*/
let tabAppendLen: number = 0
let isAutocompleteTabbing: boolean = false

/*
    Including discord and webchat usernames
*/
const allKnownUsernames = (): string[] => {
    return connectedUsers.concat(knownDiscordNames)
}

const updateUserList = () => {
    userListDiv.innerHTML = ''
    connectedUsers.forEach((user) => {
        userListDiv.insertAdjacentHTML(
            'beforeend',
            `<div>${user}</div>`
        )
    })
}

const updateUserListDiscord = () => {
    userListDiscordDiv.innerHTML = ""
    knownDiscordNames.forEach((user) => {
        userListDiscordDiv.insertAdjacentHTML(
            'beforeend',
            `<div>${user}</div>`
        )
    })
}

const addUser = (username: string) => {
    connectedUsers.push(username)
    updateUserList()
}

const removeUser = (username: string): boolean => {
    const index = connectedUsers.indexOf(username)
    if (index === -1) {
        return false
    }
    connectedUsers.splice(index, 1)
    updateUserList()
    return true
}

const getLastIndex = (haystack: string, needle: string): number => {
	return haystack.length - 1 - haystack.split('').reverse().indexOf(needle)
}

const setCookie = (cname: string, cvalue: string, exdays: number) => {
    const d = new Date()
    d.setTime(d.getTime() + (exdays*24*60*60*1000))
    let expires = "expires="+ d.toUTCString()
    document.cookie = cname + "=" + cvalue + ";" + expires + ";SameSite=Lax;path=/"
}

const getCookie = (cname: string): string => {
    let name = cname + "="
    let decodedCookie = decodeURIComponent(document.cookie)
    let ca = decodedCookie.split(';')
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i]
      while (c.charAt(0) == ' ') {
        c = c.substring(1)
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length)
      }
    }
    return ""
  }

const desktopNotification = () => {
    if (!notificationsActive) {
        return
    }
    if (!Notification) {
        return
    }
    if (Notification.permission !== 'granted') {
        return
    }
    const notification = new Notification('chat.zillyhuhn.com', {
        icon: 'https://ddnet.org/favicon.ico',
        body: 'New message in ddnet#developer',
    })
    notification.onclick = () => {
        // window.open('https://chat.zillyhuhn.com/')
    }
}

const addMessageNotification = () => {
    unreadMessages++
    const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
    document.title = `#${channelName} ${pingTxt}(${unreadMessages}) `
}

const addPingNotification = () => {
    if (!document.hidden) {
        return
    }
    unreadPings++
    const pingTxt = unreadPings > 0 ? `!${unreadPings}! ` : ''
    document.title = `#${channelName} ${pingTxt}(${unreadMessages}) `
    desktopNotification()
}

const clearNotifications = () => {
    unreadMessages = 0
    unreadPings = 0
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

const messagesContainer: HTMLElement = document.querySelector('.message-pane')

const xssSanitize = (userinput: string) => {
    userinput = userinput.replaceAll('<', '&lt;')
    userinput = userinput.replaceAll('>', '&gt;')
    return DOMPurify.sanitize(userinput)
}

const replacePings = (message: string): string => {
    let highlightMessage = false
    allKnownUsernames().forEach((username) => {
        message = message.replaceAll(
            `@${username}`,
            () => {
                if (username === account.username) {
                    highlightMessage = true
                }
                return `<span class="ping">@${username}</span>`
            }
        )
    })
    // TODO: this also highlights user "foo" in the word "barfoos"
    if(!highlightMessage) {
        message = message.replaceAll(new RegExp(account.username, 'ig'), (m) => {
            highlightMessage = true
            return `<span class="ping">${m}</span>`
        })
    }
    if (highlightMessage) {
        addPingNotification()
        message = `<div class="highlight">${message}</div>`
    }
    return message
}

const replaceEmotes = (message: string): string => {
    return message.replaceAll(
        new RegExp(':([a-zA-Z0-9]+):', 'ig'),
        (m, $1) => {
            if (['fuckyousnail', 'justatest', 'feelsbadman', 'pepeH', 'rocket', 'hissnail'].includes($1)) {
                return `<span class="emote ${$1}"></span>`
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
            const isVideoUrl: boolean = new RegExp('\\.(mp4)$', 'i').test(url)
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
                    target="_blank"
                    class="danger"
                    href="https://github.com/ChillerDragon/discord-irc/blob/6f3fb8d8f78f5c3d3f05e36a292a77d26a9f8d90/src/index.ts#L85-L97"
                >
                    ${url}
                </a>`
            }
            if (isWhitelistedCdn) {
                if (isImageUrl) {
                    return `<img class="embed-img" src="${url}">`
                } else if (isVideoUrl) {
                    return `<video width="320" controls>
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`
                }
            }
            return `<a target="_blank" href="${url}">${url}</a>`
        }
    )
    userinput = userinput.replaceAll(
        new RegExp('```(.*)```', 'ig'),
        (m, $1) => `<span class="single-line-code-snippet">${hljs.highlightAuto($1).value}</span>`
    )
    userinput = userinput.replaceAll(
        new RegExp('``(.*)``', 'ig'),
        (m, $1) => `<span class="single-line-code-snippet">${$1}</span>`
    )
    userinput = userinput.replaceAll(
        new RegExp('`(.*)`', 'ig'),
        (m, $1) => `<span class="single-line-code-snippet">${$1}</span>`
    )
    // userinput = userinput.replaceAll(
    //     new RegExp('`(.*)`', 'ig'),
    //     (m, $1) => hljs.highlight($1, {language: 'c'}).value
    // )
    userinput = replaceEmotes(userinput)
    userinput = replacePings(userinput)
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
            message: message,
            token: account.sessionToken
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
    notificationsActive = !notificationsActive
    if (notificationsActive) {
        bellDiv.classList.add('active')
    } else {
        bellDiv.classList.remove('active')
    }
})

const autoComepletePings = (event: KeyboardEvent) => {
    const end: number = messageInp.value.length
    // tab complete pings when typed an @
    if (event.key === 'Tab') {
        event.preventDefault()
        // start tabbing with empty @
        if (messageInp.value[end - 1] === '@' || isAutocompleteTabbing) {
            const completedName: string = allKnownUsernames()[tabNameIndex % allKnownUsernames().length]
            if (tabAppendLen !== 0) {
                const choppedComplete = messageInp.value.substring(0, messageInp.value.length - (tabAppendLen - 0))
                messageInp.value = choppedComplete
            }
            messageInp.value += completedName
            tabNameIndex++
            tabAppendLen = completedName.length
            isAutocompleteTabbing = true
            return
        }
        // continue tabbing when already typed a name
        const atIndex = getLastIndex(messageInp.value, '@')
        if (atIndex !== -1) {
            const currentCompletion = messageInp.value.substring(atIndex + 1)
            if (currentCompletion.indexOf(' ') !== -1) {
                // do not continue tab completing if there is a space
                return
            }
            if (!currentCompletion &&
                    currentCompletion.length === 0 &&
                    currentCompletion.length < 16) {
                return
            }
            const matchingNames = allKnownUsernames().filter((name: string) => {
                return name.toLowerCase().startsWith(currentCompletion.toLowerCase())
            })
            if (matchingNames.length < 1) {
                return
            }
            messageInp.value =
                messageInp.value.substring(0, atIndex + 1) +
                matchingNames[tabNameIndex % matchingNames.length]
        }
    } else {
        // pressing any key other than tab
        // ends the tabbing mode
        isAutocompleteTabbing = false
        tabAppendLen = 0
    }
}

messageInp.addEventListener('keydown', (event: KeyboardEvent) => {
    autoComepletePings(event)
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
            connectedUsers.push(username)
        })
        updateUserList()
    })

fetch(`${backendUrl}/messages`)
    .then(data => data.json())
    .then((messages: IrcMessage[]) => {
        console.log(messages)
        // clears the loading message
        messagesContainer.innerHTML = ""
        messages.forEach((message: IrcMessage) => {
            addMessage(message)
        })
    })
