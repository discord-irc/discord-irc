import { ServerInfo } from "./socket.io"
import { getSocket } from "./ws_connection"

getSocket().on('connectedServerListResponse', (servers: ServerInfo[]) => {
  console.log('got list of servers:')
  console.log(servers)
  // <div class="menu-servers">
  //   <div class="server-icon server-ddnet"></div>
  // </div>
  const serverListDiv: HTMLElement | null = document.querySelector('.menu-servers')
  if(serverListDiv === null) {
    throw 'Element not found: .menu-servers'
  }

  servers.forEach((server) => {
    const serverNameSlug = server.name.toLowerCase().replaceAll(/[^a-z]/gi, '-')

    serverListDiv.insertAdjacentHTML(
      'beforeend',
      `
      <div
        class="server-icon server-${serverNameSlug}"
        style="background-image: url('${server.iconUrl}');">
      </div>
      `
    )
  })
})

export const requestServerList = () => {
  getSocket().emit('connectedServerListRequest')
}
