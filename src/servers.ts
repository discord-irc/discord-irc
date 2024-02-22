import { ServerInfo } from "./socket.io"
import { getSocket } from "./ws_connection"

getSocket().on('connectedServerListResponse', (servers: ServerInfo[]) => {
  console.log('got list of servers:')
  console.log(servers)
})

export const requestServerList = () => {
  getSocket().emit('connectedServerListRequest')
}
