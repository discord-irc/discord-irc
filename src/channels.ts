let currentChannelName = 'developer'

export const getActiveChannel = (): string => {
    return currentChannelName
}

export const setActiveChannel = (channelName: string) => {
    currentChannelName = channelName
}
