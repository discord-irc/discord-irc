import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage } from './socket.io'

import DOMPurify from 'dompurify'

import './style.css'

const foo: string = "hello world from ts"
console.log(foo)

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
                    ${xssSanitize(message.message)}
                </div>
            </div> <!-- message-content -->
        </div>`
    )
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
        messageInp.value = ""
        const ircMessage = {
            from: 'ws-client',
            message: message
        }
        renderMessage(ircMessage)
        socket.emit('message', ircMessage)
    })