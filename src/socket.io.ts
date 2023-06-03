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

export interface LogoutMessage {
    message: string
}

export interface ServerToClientEvents {
    // irc-websockets
    message: (message: IrcMessage) => void
    authResponse: (auth: AuthResponse) => void
    logout: (data: LogoutMessage) => void
    userJoin: (username: string) => void
    userLeave: (username: string) => void
}

export interface ClientToServerEvents {
    // socket.io
    connection: (socket: Socket) => void

    // irc-websockets
    message: (message: IrcMessage) => void
    authRequest: (auth: AuthRequest) => void
}
