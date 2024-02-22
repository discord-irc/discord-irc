import { ServerInfo } from "./socket.io"
import { getSocket } from "./ws_connection"

let connectedServers: ServerInfo[] = []

const getServerById = (serverId: number): ServerInfo | null => {
  return connectedServers.find((server) => server.id === serverId)
}

const onClickServerIcon = (server: HTMLElement) => {
  const serverInfo: ServerInfo | null = getServerById(parseInt(server.dataset.serverId, 10))
  if(!serverInfo) {
    throw `Clicked on server icon with id=${server.dataset.serverId} but no such server is known`
  }

  console.log("trying to set active server to:")
  console.log(serverInfo)
}

const registerServerIconListeners = () => {
  const servers: NodeListOf<HTMLElement> = document.querySelectorAll('.menu-servers .server-icon')
  servers.forEach((server) => {
    server.addEventListener('click', () => {
      onClickServerIcon(server)
    })
  })
}

getSocket().on('connectedServerListResponse', (servers: ServerInfo[]) => {
  console.log('got list of servers:')
  console.log(servers)
  connectedServers = servers

  const serverListDiv: HTMLElement | null = document.querySelector('.menu-servers')
  if(serverListDiv === null) {
    throw 'Element not found: .menu-servers'
  }

  servers.forEach((server) => {
    const serverNameSlug = server.name.toLowerCase().replaceAll(/[^a-z]/gi, '-')
    let styleBg = `style="background-image: url('${server.iconUrl}');"`
    if(!server.iconUrl || server.iconUrl.startsWith('..')) {
      // webpack messes up relative urls anyways
      // so either use https:// image urls
      // or fallback to the class names css kicking in
      // there is css for server-ddnet and server-teeworlds
      styleBg = ''
    }

    serverListDiv.insertAdjacentHTML(
      'beforeend',
      `
      <div
        data-server-id="${server.id}"
        class="server-icon server-${serverNameSlug}"
        ${styleBg}>
      </div>
      `
    )
  })
  registerServerIconListeners()
})

export const requestServerList = () => {
  getSocket().emit('connectedServerListRequest')
}
