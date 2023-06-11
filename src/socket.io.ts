import { Socket } from 'socket.io'

export interface IrcMessage {
    from: string,
    message: string,
    channel: string,
    server: string,
    date: string,
    token?: string
}

export interface AuthRequest {
    username: string,
    password: string,
    channel: string,
    server: string,
}

export interface AuthResponse {
    username: string,
    token: string,
    message: string,
    success: boolean,
}

export interface JoinChannelResponse {
    message: string,
    success: boolean,
    channel: string,
    server: string,
}

export interface LogoutMessage {
    message: string
}

export interface JoinChannel {
    channel: string,
    server: string,
    password: string
}

export interface ServerToClientEvents {
    // irc-websockets
    message: (message: IrcMessage) => void
    authResponse: (auth: AuthResponse) => void
    logout: (data: LogoutMessage) => void
    userJoin: (username: string) => void
    userLeave: (username: string) => void
    joinChannelResponse: (reponse: JoinChannelResponse) => void
}

export interface ClientToServerEvents {
    // socket.io
    connection: (socket: Socket) => void

    // irc-websockets
    message: (message: IrcMessage) => void
    authRequest: (auth: AuthRequest) => void
    joinChannel: (join: JoinChannel) => void
}
