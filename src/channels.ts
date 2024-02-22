import { backendUrl } from './backend'
import { getPlugins } from './plugins/plugins'
import { ChannelInfo, JoinChannel, JoinChannelResponse } from './socket.io'
import { getSocket } from './ws_connection'

let currentChannelName: string | null = null
let currentServerName: string | null = null
let currentServerId: number | bigint | null = null
const nameDom = document.querySelector<HTMLDivElement>('.channel-name')
const messageInp: HTMLInputElement = document.querySelector('#message-input')
const textChannelsDom: HTMLElement = document.querySelector('.text-channels')

interface ServerInfo {
  id: number | bigint
  name: string
  channels: ChannelInfo[]
}

/*
    connectedServers

    key: server name
    value: ServerInfo
*/
const connectedServers: Record<string, ServerInfo> = {}

const updateChannelInfo = (serverName: string, channels: ChannelInfo[]): void => {
  if(channels.length === 0) {
    // this will crash on the TODO OMG THIS IS HORRIBLE part xd
    console.warn(`The server '${serverName}' has no channels!`)
  }
  if (!(serverName in connectedServers)) {
    connectedServers[serverName] = {
      name: serverName,
      id: channels[0].serverId, // TODO: OMG THIS IS HORRIBLE
      channels: []
    }
  }
  connectedServers[serverName].channels = channels
  setActiveServerId(channels[0].serverId) // TODO: OMG THIS IS HORRIBLE
}

export const getChannelById = (channelId: number | bigint): ChannelInfo | null => {
  for(const server of Object.values(connectedServers)) {
    return server.channels.find((channel) => channel.id === channelId)
  }
  return null
}

export const getChannelInfo = (serverName: string, channelName: string): ChannelInfo | null => {
  return connectedServers[serverName].channels.find((channelInfo) => channelInfo.name === channelName) || null
}

export const getActiveChannelInfo = (): ChannelInfo | null => {
  return getChannelInfo(getActiveServer(), getActiveChannel())
}

export const requestSwitchChannel = (serverName: string, channelName: string): void => {
  const joinRequest: JoinChannel = {
    channel: channelName,
    server: serverName,
    password: 'none'
  }
  getSocket().emit('joinChannel', joinRequest)
}

const switchChannel = (response: JoinChannelResponse): void => {
  // console.log(`Switching to channel ${serverName}#${channelName}`)
  const oldServer = getActiveServer()
  const oldChannel = getActiveChannel()
  const serverName = response.server
  const channelName = response.channel
  setActiveServer(serverName)
  setActiveChannel(channelName)
  // new server
  if (!connectedServers[serverName]) {
    connectedServers[serverName] = {
      id: response.serverId,
      name: response.server,
      channels: [] // TODO: remove connectedServers
    }
  } else {
    connectedServers[serverName].id = response.serverId
  }
  setActiveServerId(response.serverId)
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      plugin.onSwitchChannel(oldServer, oldChannel, serverName, channelName)
    }
  })

  if (oldServer !== getActiveServer()) {
    listChannelsOfCurrentServer()
  }
}

getSocket().on('joinChannelResponse', (response: JoinChannelResponse) => {
  if (response.success) {
    switchChannel(response)
    return
  }
  console.log('failed to switch channel! todo error toast in ui')
})

export const highlightNewMessageInChannel = (channel: string): void => {
  const channelDom: HTMLElement | null = document.querySelector(`[data-channel-name="${channel}"]`)
  if (channelDom == null) {
    console.log(`[!] WARNING! failed to find channel with name '${channel}'`)
    return
  }
  channelDom.classList.add('new-messages')
}

export const highlightNewPingInChannel = (channel: string): void => {
  const channelDom: HTMLElement | null = document.querySelector(`[data-channel-name="${channel}"]`)
  if (channelDom == null) {
    console.log(`[!] WARNING! failed to find channel with name '${channel}'`)
    return
  }
  const numPingsDom: HTMLElement = channelDom.querySelector('.num-pings')
  numPingsDom.classList.add('active')
  const numPings: number = parseInt(numPingsDom.innerText, 10)
  numPingsDom.innerHTML = (numPings + 1).toString()
}

const renderChannelList = (serverName: string): void => {
  textChannelsDom.innerHTML = ''
  if (!(serverName in connectedServers)) {
    return
  }
  connectedServers[serverName].channels.forEach((channel: ChannelInfo) => {
    const active = channel.name === getActiveChannel() ? ' active' : ''
    textChannelsDom.innerHTML +=
            `<div class="channel-name-box clickable${active}" data-channel-name="${channel.name}">
                <span>
                    <span class="text-light">#</span>
                    <span class="channel-name">${channel.name}</span>
                </span>
                <span class="num-pings">0</span>
            </div>`
  })
  const clickableChannels: NodeListOf<HTMLElement> = document.querySelectorAll('.clickable.channel-name-box')
  clickableChannels.forEach((channel) => {
    channel.addEventListener('click', () => {
      const channelNameDom: HTMLElement | null = channel.querySelector('.channel-name')
      const oldActive: HTMLElement = document.querySelector('.text-channels .active')
      if (!oldActive) {
        throw 'No active channel found. There always has to be an active channel'
      }
      const numPingsDom: HTMLElement = channel.querySelector('.num-pings')
      oldActive.classList.remove('active')
      oldActive.classList.remove('new-messages')
      numPingsDom.classList.remove('active')
      channel.classList.add('active')
      channel.classList.remove('new-messages')
      requestSwitchChannel(getActiveServer(), channelNameDom.innerText)
    })
  })
}

// channel

export const setActiveChannel = (channelName: string): void => {
  currentChannelName = channelName
  nameDom.innerHTML = channelName
  messageInp.placeholder = `Message #${channelName}`
  document.title = `#${channelName}`
}

export const getActiveChannel = (): string => {
  if (currentChannelName === '' || currentChannelName === null) {
    const params = new URLSearchParams(document.location.search)
    currentChannelName = params.get('c') ?? 'developer'
    setActiveChannel(currentChannelName)
  }
  return currentChannelName
}

// server

export const setActiveServer = (serverName: string): void => {
  currentServerName = serverName
  // TODO: highlight icon on the left
}

export const getActiveServer = (): string => {
  if (currentServerName === '' || currentServerName === null) {
    const params = new URLSearchParams(document.location.search)
    currentServerName = params.get('s') ?? 'ddnet'
    setActiveServer(currentServerName)
  }
  return currentServerName
}

export const setActiveServerId = (serverId: number | bigint): void => {
  currentServerId = serverId
  // TODO: call setActiveServer and rename to setActiveServerName even better delete the whole legacy name based thing
  // TODO: highlight icon on the left
}

export const getActiveServerId = (): number | bigint | null => {
  return currentServerId
}

// get info

export const listChannelsOfCurrentServer = () => {
  fetch(`${backendUrl}/${getActiveServer()}/channels`)
    .then(async data => await data.json())
    .then((channels: ChannelInfo[]) => {
      updateChannelInfo(getActiveServer(), channels)
      renderChannelList(getActiveServer())
    })
}

listChannelsOfCurrentServer()
