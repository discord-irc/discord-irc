let latestMessageId: number = 0
let oldestMessageId: number = -1
const knownMessageIds: number[] = []

export const getLatestMessageId = (): number => {
    return latestMessageId
}
export const getNextMessageId = (): number => {
    latestMessageId++
    return latestMessageId
}

export const trackNewMessageId = (id: number): void => {
    knownMessageIds.push(id)
    if (latestMessageId < id) {
        latestMessageId = id
    }
    if (id < oldestMessageId || oldestMessageId === -1) {
        oldestMessageId = id
    }
}

/**
 * Not too useful as of right now
 * because we wipe the messages we received from the dom
 * but do not forget their ids
 *
 * but in pretty much all cases we do want to render them again if deleted
 * for example on channel switching
 *
 * @param id message id to check
 * @returns did we ever receive that message
 */
export const isKnonwMessageId = (id: number): boolean => {
    return knownMessageIds.includes(id)
}

/**
 * Check if a message is currently displayed on the page already
 *
 * @param id message id to check
 * @returns is this message currently in the dom
 */
export const isRenderedMessageId = (id: number): boolean => {
    const found: HTMLElement | null = document.querySelector(`[data-message-id="${id}"]`) ?? null;
    return found !== null
}

export const getOldestMessageId = (): number => {
    return oldestMessageId
}
export const setOldestMessageId = (id: number): void => {
    oldestMessageId = id
}
