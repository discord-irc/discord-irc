import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents, IrcMessage } from './socket.io'

import './style.css'

const foo: string = "hello world from ts"
console.log(foo)

const backendUrl = 'http://localhost:6969'

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl)

socket.on('connect', () => {
    console.log("connected")
})

const messagesContainer = document.querySelector('.messages')

const renderMessage = (message: IrcMessage) => {
    messagesContainer.insertAdjacentHTML(
        'beforeend',
        `<div class="message">
            <div class="message-img"></div>
            <div class="message-content">
                <div class="message-author">
                    ${message.from}
                </div>
                <div class="message-text">
                    ${message.message}
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