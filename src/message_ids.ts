let latestMessageId: number = 0
let oldestMessageId: number = -1

export const getLatestMessageId = (): number => {
  return latestMessageId
}
export const getNextMessageId = (): number => {
  latestMessageId++
  return latestMessageId
}
export const setLatestMessageId = (id: number): void => {
  latestMessageId = id
  if (latestMessageId < oldestMessageId || oldestMessageId === -1) {
    oldestMessageId = latestMessageId
  }
}

export const getOldestMessageId = (): number => {
  return oldestMessageId
}
export const setOldestMessageId = (id: number): void => {
  oldestMessageId = id
}
