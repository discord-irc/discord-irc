import { Socket } from 'socket.io'

// shared types

export interface WebhookObject {
  id: number | bigint

  // `token` is non discord api.
  // And intentionally non optional to avoid ! in frontend when consuming it
  token: string
  type: number
  channel_id: number | bigint
  name: string
  avatar: string | null
  application_id: number | null
}

export interface ChannelInfo {
  id: number | bigint
  serverId: number | bigint
  name: string
  description: string
}

export interface IrcMessage {
  id: number
  from: string
  message: string
  channel: string
  server: string
  date: string
  token?: string
}

// socket.io types

export interface RegisterRequest {
  username: string
  password: string
  token: string
}

export interface AuthRequest {
  username: string
  password: string
  channel: string
  server: string
}

export interface AuthResponse {
  username: string
  admin: boolean
  token: string
  message: string
  success: boolean
}

export interface JoinChannelResponse {
  message: string
  success: boolean
  channel: string
  server: string
  channelId: number | bigint
  serverId: number | bigint
}

export interface LogoutMessage {
  message: string
}

export interface JoinChannel {
  channel: string
  server: string
  password: string
}

export interface TypingInfo {
  isTyping: boolean
  channel: string
  server: string
}

export interface TypingState {
  names: string[]
  channel: string
}

export interface AlertMessage {
  success: boolean
  message: string
  expire: number
}

export interface ServerInfo {
  channels: ChannelInfo[]
  name: string
  iconUrl: string
  bannerUrl: string
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
  // TODO: using some callback with timeout would be cleaner
  //       than having this second untied response
  //       but whatever
  //       https://socket.io/docs/v4/tutorial/api-overview
  webhooks: (webhooks: WebhookObject[]) => void
  connectedServerListResponse: (servers: ServerInfo[]) => void
}

export interface ClientToServerEvents {
  // socket.io
  connection: (socket: Socket) => void

  // irc-websockets
  message: (message: IrcMessage) => void
  registerRequest: (register: RegisterRequest) => void
  authRequest: (auth: AuthRequest) => void
  joinChannel: (join: JoinChannel) => void
  typingInfo: (typingInfo: TypingInfo) => void
  webhooksRequest: (serverId: number | bigint) => void
  newWebhookRequest: (webhook: WebhookObject) => void
  connectedServerListRequest: () => void
}
