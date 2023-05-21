import { Socket } from 'socket.io'

export interface IrcMessage {
    from: string,
    message: string,
    token?: string
}

export interface AuthRequest {
    username: string,
    password: string,
}

export interface AuthResponse {
    username: string,
    token: string,
    message: string,
    success: boolean,
}

export interface ServerToClientEvents {
    // irc-websockets
    message: (message: IrcMessage) => void
    authResponse: (auth: AuthResponse) => void
}

export interface ClientToServerEvents {
    // socket.io
    connection: (socket: Socket) => void

    // irc-websockets
    message: (message: IrcMessage) => void
    authRequest: (auth: AuthRequest) => void
}
