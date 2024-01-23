import DOMPurify from 'dompurify'

import { addMessageNotification } from './notifications'
import { IrcMessage } from './socket.io'
import { enrichText } from './rich_text'

let autoScroll = true

const messagesContainer: HTMLElement = document.querySelector('.message-pane')

export const clearMessagesContainer = () => {
  messagesContainer.innerHTML = ''
}

messagesContainer.addEventListener('scroll', () => {
  const scroll: number = messagesContainer.scrollTop + messagesContainer.offsetHeight
  const maxScroll: number = messagesContainer.scrollHeight
  autoScroll = scroll > maxScroll - 5
})

const xssSanitize = (userinput: string) => {
  // userinput = userinput.replaceAll('<', '&lt;')
  // userinput = userinput.replaceAll('>', '&gt;')
  return DOMPurify.sanitize(userinput)
}

const utcStrToMMDDYYYY = (utc: string): string => {
  const date: Date = new Date(utc)
  const month: string = String(date.getMonth()).padStart(2, '0')
  const day: string = String(date.getDate()).padStart(2, '0')
  return `${month}/${day}/${date.getFullYear()}`
}

const utcStrToNiceDate = (utc: string): string => {
  const date = new Date(utc)
  const today = new Date()
  const diffTime = Math.abs(today.valueOf() - date.valueOf())
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return `Today at ${date.getHours()}:${date.getMinutes()}`
  }
  return utcStrToMMDDYYYY(utc)
}

const checkMergePrevMessage = (message: IrcMessage): HTMLElement | null => {
  const prevMessage: HTMLElement = document.querySelector('.message:last-child')
  if (!prevMessage) {
    return null
  }
  const prevAuthorDom: HTMLElement = prevMessage.querySelector('.message-author')
  const prevAuthor = prevAuthorDom.innerText
  if (prevAuthor !== message.from) {
    return null
  }
  if (prevMessage.querySelector('img') ||
        prevMessage.querySelector('video') ||
        prevMessage.querySelector('.multi-line-code-snippet') ||
        /*
            single-line-code-snippet

            Is a cheap trick to not have to worry about porting code blocks
            into merged message.
            It might look nicer in some cases to actually merge the messages if
            it is just a single line snippet but its okayish
        */
        prevMessage.querySelector('.single-line-code-snippet') ||
        prevMessage.querySelector('.emote')) {
    // never merge messages containing media
    // otherwise they get unhtmld and then the media is lost
    return null
  }
  if (message.message.startsWith('```') && !prevMessage.innerHTML.includes('```')) {
    // split code block in a new message
    // to get a new date for the beginning of the code block
    // to ensure that all code lines get merged into the block
    //
    // otherwise some one could send messages like this:
    //
    // user1: hello <---- takes merge date from this message
    // user1: world
    // user1: wanna see my code?
    // user1: ok here it is:
    // user1: ```cpp
    // user1: int main()
    // user1: {
    //
    // ! BOOOM MESSAGE SPLIT !
    //
    // eventho the code block it self was sent in a merge time frame
    // the end of the code block and the first hello
    // are too far away
    return null
  }
  const lastDate = new Date(prevMessage.dataset.date)
  const thisDate = new Date(message.date)
  const diff = thisDate.valueOf() - lastDate.valueOf()
  // only merge messages that were sent
  // with a 60 second delay
  // should still cover the bridge ratelimited
  // discord multi line message delays
  //
  // 60 is long and has some false positive merges
  // but that is fine. Since it does need that much sometimes
  // when the discord bridge sends larger blocks of code
  // the messages can get delayed that long.
  // and we want to make sure that it still renders
  // one nice syntax highlighted code block
  //
  // also it is counting the diff of the first and the last message
  // so pasting a whole code block sending 10 messages with 3s delay
  // causes a 60 sec diff
  if (diff > 60000) {
    return null
  }
  return prevMessage
}

export const renderMessage = (message: IrcMessage, insertTop: boolean = false, isBridge = false) => {
  // TODO: insertTop merges
  const mergeMessage: HTMLElement | null = insertTop ? null : checkMergePrevMessage(message)
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // can return 0-65535
  // but should be in the ascii range for most names
  const code = message.from.charCodeAt(0)
  let profileId = 1
  if (code > 512) {
    profileId = 1
  } else if (code > 200) {
    profileId = 2
  } else if (code > 100) {
    profileId = 3
  } else if (code > 95) {
    profileId = 4
  } else if (code > 90) {
    profileId = 5
  } else if (code > 80) {
    profileId = 6
  }
  if (mergeMessage) {
    const mergeMessageText: HTMLElement = mergeMessage.querySelector('.message-text')
    mergeMessageText.innerHTML = mergeMessageText.innerHTML.replaceAll('<br>', '\n')
    // this is weird and i do not understand it
    // but without this code newlines get doubled
    // if not putting and \n its always in the same line :shrug:
    let sep = '\n'
    if (mergeMessageText.innerHTML.endsWith('\n')) {
      sep = ''
    }
    if (message.message.startsWith('\n')) {
      sep = ''
    }
    const newRichText = xssSanitize(enrichText(
      mergeMessageText.textContent +
            sep +
            message.message
    ))
    mergeMessageText.innerHTML = newRichText
  } else {
    messagesContainer.insertAdjacentHTML(
      insertTop ? 'afterbegin' : 'beforeend',
            `<div class="message" data-date="${message.date}" data-message-id="${message.id}">
                <div class="message-img profile${profileId}${isBridge ? ' bridge' : ''}"></div>
                <div class="message-content">
                    <div class="message-header">
                        <div class="message-author">
                            ${xssSanitize(message.from)}
                        </div>
                        <div class="message-date">
                            ${utcStrToNiceDate(message.date)}
                        </div>
                    </div> <!-- message-header -->
                        <div class="message-text">${
                            xssSanitize(
                                enrichText(message.message)
                            )
                        }</div>
                </div> <!-- message-content -->
            </div>`
    )
    if (document.hidden) {
      addMessageNotification()
    }
  }
  if (autoScroll) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}
