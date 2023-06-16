import { Socket } from 'socket.io'

export interface IrcMessage {
    id: number,
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

export interface TypingInfo {
    isTyping: boolean,
    channel: string,
    server: string,
}

export interface TypingState {
    names: string[],
    channel: string
}

export interface AlertMessage {
    success: boolean,
    message: string,
    expire: number
}

export interface ServerToClientEvents {
    // irc-websockets
    message: (message: IrcMessage) => void
    authResponse: (auth: AuthResponse) => void
    logout: (data: LogoutMessage) => void
    userJoin: (username: string) => void
    userLeave: (username: string) => void
    joinChannelResponse: (reponse: JoinChannelResponse) => void
    typingUsers: (state: TypingState) => void
    alert: (msg: AlertMessage) => void
}

export interface ClientToServerEvents {
    // socket.io
    connection: (socket: Socket) => void

    // irc-websockets
    message: (message: IrcMessage) => void
    authRequest: (auth: AuthRequest) => void
    joinChannel: (join: JoinChannel) => void
    typingInfo: (typingInfo: TypingInfo) => void
}
