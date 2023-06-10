let currentChannelName: string | null = null
let currentServerName: string | null = null
const nameDom: HTMLElement = document.querySelector('.channel-name')
const messageInp: HTMLInputElement = document.querySelector('#message-input')

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