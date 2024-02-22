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
        class="server-icon server-${serverNameSlug}"
        ${styleBg}>
      </div>
      `
    )
  })
})

export const requestServerList = () => {
  getSocket().emit('connectedServerListRequest')
}
