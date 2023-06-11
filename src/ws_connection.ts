import { io, Socket } from 'socket.io-client'
import { ClientToServerEvents, ServerToClientEvents } from './socket.io'
import { backendUrl } from "./backend"

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(backendUrl)

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
    return socket
}