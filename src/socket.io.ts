import { Socket } from 'socket.io'

export interface IrcMessage {
    from: string,
    message: string,
}

export interface ServerToClientEvents {
    // irc-websockets
    message: (message: IrcMessage) => void
}

export interface ClientToServerEvents {
    // socket.io
    connection: (socket: Socket) => void

    // irc-websockets
    message: (message: IrcMessage) => void
}
