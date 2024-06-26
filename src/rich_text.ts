import { getAccount } from './account'
import { getDiscordEmoteIdByName, getDiscordEmoteNameById, getUnicodeByName } from './emotes'
import { addPingNotification } from './notifications'
import { allKnownUsernames } from './users'
import { getPlugins } from './plugins/plugins'
import { getHljs } from './highlight'

export const replacePings = (message: string): string => {
  let highlightMessage = false
  allKnownUsernames().forEach((username) => {
    message = message.replaceAll(
            `@${username}`,
            () => {
              if (username === getAccount().username) {
                highlightMessage = true
              }
              return `<span class="ping">@${username}</span>`
            }
    )
  })
  if (!highlightMessage) {
    // negative look behind for https://
    // so we do not break the url rich text with name highlight rich text
    message = message.replaceAll(new RegExp(`(?<!https?://[^ ]*)\\b${getAccount().username}\\b`, 'ig'), (m) => {
      highlightMessage = true
      return `<span class="ping">${m}</span>`
    })
  }
  if (highlightMessage) {
    addPingNotification() // TODO: this gets called multiple times on message merge
    message = `<div class="highlight">${message}</div>`
  }
  return message
}

/*
    translateEmotes

    replace :justatest: with <:justatest:572499997178986510>
    which then gets rendered as actual emote on discord
*/
export const translateEmotes = (message: string): string => {
  message = message.replaceAll(
    /:([a-zA-Z0-9\\+\\-_]+):/ig,
    (m: string, $1: string) => {
      const emoteId: string | null = getDiscordEmoteIdByName($1)
      if (emoteId !== null && emoteId !== '') {
        return `<:${$1}:${emoteId}>`
      }
      const unicodeEmote: string | null = getUnicodeByName($1)
      if (unicodeEmote !== null && unicodeEmote !== '') {
        return unicodeEmote
      }
      return m
    }
  )
  return message
}

const replaceEmotes = (message: string): string => {
  // discord rich presence animated emotes for example:
  // <a:Catxplosion:1082715870893195274>
  message = message.replaceAll(
    /(<|&lt;)a:([a-zA-Z0-9]+):([0-9]+)(>|&gt;)/ig,
    (m, $1, $2, $3) => {
      const emoteId: string = $3
      const emoteName: string | null = getDiscordEmoteNameById(emoteId, 'animated')
      if (emoteName === null || emoteName === '') {
        return m
      }
      const gifUrl = `https://cdn.discordapp.com/emojis/${emoteId}.gif?size=80&quality=lossless`
      return `<img src="${gifUrl}" alt="${emoteName}">`
    }
  )
  // discord rich presence emotes for example:
  // <:hisnail:768893210726367232>
  message = message.replaceAll(
    /(<|&lt;):([a-zA-Z0-9_]+):([0-9]+)(>|&gt;)/ig,
    (m, $1, $2, $3) => {
      const emoteName: string | null = getDiscordEmoteNameById($3)
      if (emoteName === null || emoteName === '') {
        return m
      }
      return `<span class="emote emote-${emoteName}"></span>`
    }
  )
  // simple emotes for example:
  // :justatest:
  message = message.replaceAll(
    /:([a-zA-Z0-9_]+):/ig,
    (m: string, $1: string) => {
      const emoteId: string | null = getDiscordEmoteIdByName($1)
      if (emoteId !== null && emoteId !== '') {
        return `<span class="emote emote-${$1}"></span>`
      }
      return m
    }
  )
  return message
}

export const enrichText = (userinput: string): string => {
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      userinput = plugin.onPreEnrichText(userinput)
    }
  })
  getPlugins().forEach((plugin) => {
    if (plugin.isActive()) {
      userinput = plugin.onEnrichText(userinput)
    }
  })
  // userinput = userinput.replaceAll(
  //     new RegExp('`(.*)`', 'ig'),
  //     (m, $1) => hljs.highlight($1, {language: 'c'}).value
  // )
  userinput = userinput.replaceAll(
    /```(.*)```/g,
    (m, $1) => {
      return `<span class="single-line-code-snippet code-snippet">${getHljs().highlightAuto($1).value}</span>`
    }
  )
  const codeSnipAnnotater = (sep: string, codesnip: string): string => {
    const subsplits: string[] = codesnip.split(sep)
    if (subsplits.length === 0) {
      return `<span class="single-line-code-snippet code-snippet">${codesnip}</span>`
    }
    let res = ''
    let isCode = true
    subsplits.forEach((subsplit) => {
      if (isCode) {
        res += '<span class="single-line-code-snippet code-snippet">'
        res += subsplit
        res += '</span>'
      } else {
        res += subsplit
      }
      isCode = !isCode
    })
    return res
  }
  userinput = userinput.replaceAll(
    /``(.*)``/g,
    (m, $1) => {
      return codeSnipAnnotater('``', $1)
    }
  )
  userinput = userinput.replaceAll(
    /`(.*)`/g,
    (m, $1) => {
      // do not pack ``` as a single ` in code
      // because its most of the time a tripple code block
      if ($1 === '`') {
        return m
      }
      return codeSnipAnnotater('`', $1)
    }
  )
  userinput = replaceEmotes(userinput)
  userinput = replacePings(userinput)
  userinput = userinput.replaceAll('\n', '<br>')
  return userinput
}
