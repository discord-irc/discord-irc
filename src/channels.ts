let currentChannelName: string | null = null
const nameDom: HTMLElement = document.querySelector('.channel-name')
const messageInp: HTMLInputElement = document.querySelector('#message-input')

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
