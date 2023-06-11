import { backendUrl } from "./backend"
import { reloadMessageBacklog } from "./message_loader"
import { JoinChannel, JoinChannelResponse } from "./socket.io"
import { getSocket } from "./ws_connection"

let currentChannelName: string | null = null
let currentServerName: string | null = null
const nameDom: HTMLElement = document.querySelector('.channel-name')
const messageInp: HTMLInputElement = document.querySelector('#message-input')
const textChannelsDom: HTMLElement = document.querySelector('.text-channels')

interface ChannelInfo {
    name: string
}

interface ServerInfo {
    name: string,
    channels: ChannelInfo[]
}

/*
    connectedServers

    key: server name
    value: ServerInfo
*/
const connectedServers: Record<string, ServerInfo> = {}

const updateChannelInfo = (serverName: string, channelNames: string[]) => {
    if (!connectedServers[serverName]) {
        connectedServers[serverName] = {
            name: serverName,
            channels: []
        }
    }
    const channels: ChannelInfo[] = channelNames.map((name) => {
        const channelInfo: ChannelInfo = {
            name: name
        }
        return channelInfo
    })
    connectedServers[serverName].channels = channels
}

const requestSwitchChannel = (serverName: string, channelName: string) => {
    const joinRequest: JoinChannel = {
        channel: channelName,
        server: serverName,
        password: 'none'
    }
    getSocket().emit('joinChannel', joinRequest)
}

const switchChannel = (serverName: string, channelName: string) => {
    console.log(`Switching to channel ${serverName}#${channelName}`)
    setActiveServer(serverName)
    setActiveChannel(channelName)
    reloadMessageBacklog()
}

getSocket().on('joinChannelResponse', (response: JoinChannelResponse) => {
    if (response.success) {
        switchChannel(response.server, response.channel)
        return
    }
    console.log(`failed to switch channel! todo error toast in ui`)
})

const renderChannelList = (serverName: string) => {
    textChannelsDom.innerHTML = ''
    if (!connectedServers[serverName]) {
        return
    }
    connectedServers[serverName].channels.forEach((channel: ChannelInfo) => {
        const active = channel.name === getActiveChannel() ? ' active' : ''
        textChannelsDom.innerHTML += 
            `<div class="channel-name-box clickable">
                <span class="text-light">#</span>
                <span class="channel-name${active}">${channel.name}</span>
            </div>`
    })
    const clickableChannels: NodeListOf<HTMLElement> = document.querySelectorAll('.clickable.channel-name-box')
    clickableChannels.forEach((channel) => {
        channel.addEventListener('click', () => {
            const channelNameDom: HTMLElement | null = channel.querySelector('.channel-name')
            const oldActive: HTMLElement = document.querySelector('.text-channels .active')
            oldActive.classList.remove('active')
            channelNameDom.classList.add('active')
            requestSwitchChannel(getActiveServer(), channelNameDom.innerText)
        })
    })
}

// channel

export const setActiveChannel = (channelName: string) => {
    currentChannelName = channelName
    nameDom.innerHTML = channelName
    messageInp.placeholder = `Message #${channelName}`
    document.title = `#${channelName}`
}

export const getActiveChannel = (): string => {
    if (!currentChannelName) {
        const params = new URLSearchParams(document.location.search)
        currentChannelName = params.get('c') || 'developer'
        setActiveChannel(currentChannelName)
    }
    return currentChannelName
}

// server

export const setActiveServer = (serverName: string) => {
    currentServerName = serverName
    // TODO: highlight icon on the left
}

export const getActiveServer = (): string => {
    if (!currentServerName) {
        const params = new URLSearchParams(document.location.search)
        currentServerName = params.get('s') || 'ddnet'
        setActiveServer(currentServerName)
    }
    return currentServerName
}

// get info

fetch(`${backendUrl}/${getActiveServer()}/channels`)
    .then(data => data.json())
    .then((channels: string[]) => {
        updateChannelInfo(getActiveServer(), channels)
        renderChannelList(getActiveServer())
    })