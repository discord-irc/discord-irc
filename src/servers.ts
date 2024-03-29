import { listChannelsOfCurrentServer, requestSwitchChannel, setActiveChannel, setActiveServer } from "./channels"
import { getElementOrThrow } from "./dom"
import { ServerInfo } from "./socket.io"
import { getSocket } from "./ws_connection"

export let connectedServers: ServerInfo[] = []

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

  // TODO: remember last active channel of every server
  requestSwitchChannel(serverInfo.name, serverInfo.channels[0].name)
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

  const serverListDiv = getElementOrThrow('.menu-servers')

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
  listChannelsOfCurrentServer()
})

export const requestServerList = () => {
  getSocket().emit('connectedServerListRequest')
}
