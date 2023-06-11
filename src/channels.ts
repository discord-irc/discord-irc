import { backendUrl } from "./backend"

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

const renderChannelList = (serverName: string) => {
    textChannelsDom.innerHTML = ''
    if (!connectedServers[serverName]) {
        return
    }
    connectedServers[serverName].channels.forEach((channel: ChannelInfo) => {
        const active = channel.name === getActiveChannel() ? ' active' : ''
        textChannelsDom.innerHTML += 
            `<div class="channel-name-box">
                <span class="text-light">#</span>
                <span class="channel-name${active}">${channel.name}</span>
            </div>`
    })
}

// channel

const updateChannel = (channel: string) => {
    nameDom.innerHTML = channel
    messageInp.placeholder = `Message #${channel}`
    const params = new URLSearchParams(document.location.search)
    params.set('c', channel)
}

export const getActiveChannel = (): string => {
    if (!currentChannelName) {
        const params = new URLSearchParams(document.location.search)
        currentChannelName = params.get('c') || 'developer'
        updateChannel(currentChannelName)
    }
    return currentChannelName
}

export const setActiveChannel = (channelName: string) => {
    currentChannelName = channelName
    updateChannel(channelName)
}

// server

const updateServer = (server: string) => {
    const params = new URLSearchParams(document.location.search)
    params.set('s', server)
    // TODO: highlight icon on the left
}

export const getActiveServer = (): string => {
    if (!currentServerName) {
        const params = new URLSearchParams(document.location.search)
        currentServerName = params.get('s') || 'ddnet'
        updateServer(currentServerName)
    }
    return currentServerName
}

export const setActiveServer = (serverName: string) => {
    currentServerName = serverName
    updateServer(serverName)
}

// get info

fetch(`${backendUrl}/${getActiveServer()}/channels`)
    .then(data => data.json())
    .then((channels: string[]) => {
        updateChannelInfo(getActiveServer(), channels)
        renderChannelList(getActiveServer())
    })