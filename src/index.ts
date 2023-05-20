import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage } from './socket.io'

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

const html = hljs.highlightAuto('<h1>Hello World!</h1>').value
console.log(html)
let htmllo = hljs.highlight("int a = 2;", {language: 'c'}).value
console.log(htmllo)

import './style.css'
import 'highlight.js/styles/github.css';

const backendUrl = process.env.BACKEND_URL

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl)

socket.on('connect', () => {
    console.log("connected")
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

const renderMessage = (message: IrcMessage) => {
    messagesContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="message">
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
    // autoscroll
    messagesContainer.scrollTop = messagesContainer.scrollHeight
}

socket.on('message', (message: IrcMessage) => {
    console.log(message)
    renderMessage(message)
})

document.querySelector('form')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const messageInp: HTMLInputElement = document.querySelector('#message-input')
        const message = messageInp.value
        if (!message) {
            return
        }
        messageInp.value = ""
        const ircMessage = {
            from: 'ws-client',
            message: message
        }
        renderMessage(ircMessage)
        socket.emit('message', ircMessage)
    })