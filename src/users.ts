const connectedUsers: string[] = []
export const knownDiscordNames: string[] = []

const userListDiv: HTMLElement = document.querySelector('.user-list')
const userListDiscordDiv: HTMLElement = document.querySelector('.user-list-discord')

/*
    Including discord and webchat usernames
*/
export const allKnownUsernames = (): string[] => {
    return connectedUsers.concat(knownDiscordNames)
}

export const updateUserList = () => {
    userListDiv.innerHTML = ''
    connectedUsers.forEach((user) => {
        userListDiv.insertAdjacentHTML(
            'beforeend',
            `<div>${user}</div>`
        )
    })
}

export const updateUserListDiscord = () => {
    userListDiscordDiv.innerHTML = ""
    knownDiscordNames.forEach((user) => {
        userListDiscordDiv.insertAdjacentHTML(
            'beforeend',
            `<div>${user}</div>`
        )
    })
}

export const addUser = (username: string, refresh: boolean = true) => {
    connectedUsers.push(username)
    if (refresh) {
        updateUserList()
    }
}

export const removeUser = (username: string): boolean => {
    const index = connectedUsers.indexOf(username)
    if (index === -1) {
        return false
    }
    connectedUsers.splice(index, 1)
    updateUserList()
    return true
}