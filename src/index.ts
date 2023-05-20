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

socket.on('message', (message: IrcMessage) => {
    console.log(message)
})

document.querySelector('form')
    .addEventListener('submit', (event) => {
        event.preventDefault()
        const messageInp: HTMLInputElement = document.querySelector('#message')
        const message = messageInp.value
        socket.emit('message', { from: 'web', message: message })
    })