import hljs from 'highlight.js'
import { getAccount } from './account'
import { getDiscordEmoteIdByName, getDiscordEmoteNameById, getUnicodeByName } from './emotes'
import { addPingNotification } from './notifications'
import { allKnownUsernames } from './users'
import { getPlugins } from './plugins/plugins'

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
  // TODO: this also highlights user "foo" in the word "barfoos"
  if (!highlightMessage) {
    message = message.replaceAll(new RegExp(getAccount().username, 'ig'), (m) => {
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
    new RegExp(':([a-zA-Z0-9\\+\\-_]+):', 'ig'),
    (m, $1) => {
      const emoteId: string | null = getDiscordEmoteIdByName($1)
      if (emoteId) {
        return `<:${$1}:${emoteId}>`
      }
      const unicodeEmote: string | null = getUnicodeByName($1)
      if (unicodeEmote) {
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
    new RegExp('(<|&lt;)a:([a-zA-Z0-9]+):([0-9]+)(>|&gt;)', 'ig'),
    (m, $1, $2, $3) => {
      const emoteId: string = $3
      const emoteName: string | null = getDiscordEmoteNameById(emoteId, 'animated')
      if (!emoteName) {
        return m
      }
      const gifUrl = `https://cdn.discordapp.com/emojis/${emoteId}.gif?size=80&quality=lossless`
      return `<img src="${gifUrl}" alt="${emoteName}">`
    }
  )
  // discord rich presence emotes for example:
  // <:hisnail:768893210726367232>
  message = message.replaceAll(
    new RegExp('(<|&lt;):([a-zA-Z0-9_]+):([0-9]+)(>|&gt;)', 'ig'),
    (m, $1, $2, $3) => {
      const emoteName: string | null = getDiscordEmoteNameById($3)
      if (!emoteName) {
        return m
      }
      return `<span class="emote emote-${emoteName}"></span>`
    }
  )
  // simple emotes for example:
  // :justatest:
  message = message.replaceAll(
    new RegExp(':([a-zA-Z0-9_]+):', 'ig'),
    (m, $1) => {
      const emoteId: string | null = getDiscordEmoteIdByName($1)
      if (emoteId) {
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
  userinput = userinput.replaceAll(
    new RegExp(/(`{1,3})(.*?)(\1)|(https?:\/\/[a-zA-Z0-9\-_\[\]\?\#\:\&\$\+\*\%\/\.\=\@]+)/ig),
    (match, _openingBackticks, _closingBackticks, _textInBackticks, url) => {
      if (url == undefined) { return match }

      const isWhitelistedCdn: boolean =
                url.startsWith('https://zillyhuhn.com/cs') ||
                url.startsWith('https://raw.githubusercontent.com/') ||
                url.startsWith('https://user-images.githubusercontent.com/') ||
                url.startsWith('https://gist.github.com/assets/') ||
                url.startsWith('https://i.imgur.com/') ||
                url.startsWith('https://upload.wikimedia.org/') ||
                url.startsWith('https://ddnet.org/') ||
                url.startsWith('https://wiki.ddnet.org/') ||
                url.startsWith('https://media.discordapp.net/attachments/') ||
                url.startsWith('https://cdn.discordapp.com/attachments/')

      // discord started attaching weird tracking query params
      // https://cdn.discordapp.com/attachments/293493549758939136/1173302166967034018/image.png?ex=656375cb&is=655100cb&hm=a20e57298b3c9a8e468d674ba3d9f8cc167736c8bd4480271fed882b219137d0&
      // it works without them so lets get rid of all of them
      // and then we can also easily check for .png image extension again
      if (url.startsWith('https://cdn.discordapp.com/attachments/') || url.startsWith('https://media.discordapp.net/attachments/')) {
        url = url.split('?')[0]
      }

      const isImageUrl: boolean = new RegExp('\\.(png|jpg|jpeg|webp|svg|gif)$', 'i').test(url)
      const isVideoUrl: boolean = new RegExp('\\.(mp4)$', 'i').test(url)
      if (isWhitelistedCdn) {
        if (isImageUrl) {
          return `<img class="embed-img" src="${url}">`
        } else if (isVideoUrl) {
          return `<video width="320" controls>
                        <source src="${url}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`
        }
      }
      let pluginUrl: string | null = null
      getPlugins().forEach((plugin) => {
        if (plugin.isActive()) {
          pluginUrl = plugin.onEnrichUrl(url)
        }
      })
      // console.log(`url = ${url}`)
      if (pluginUrl) {
        console.log(` plugin: ${pluginUrl}`)
        return pluginUrl
      }
      // console.log(` ahref: <a target="_blank" href="${url}">${url}</a>`)
      return `<a target="_blank" href="${url}">${url}</a>`
    }
  )
  // multi line message!
  if (userinput.includes('\n')) {
    const lines = userinput.split('\n')
    let mergedLines = ''
    let inCodeBlock: null | string = null
    let currentCodeBlock = ''
    lines.forEach((line) => {
      const languages = [
        'c', 'rust',
        'c++', 'cpp',
        'python', 'javascript',
        'xml', 'html', 'css',
        'dockerfile', 'yaml', 'json',
        'bash', 'shell'
      ]
      let isCodeBlockOpenLine: boolean = false
      if (inCodeBlock === null) {
        languages.forEach((lang) => {
          if (line === '```' + lang) {
            inCodeBlock = lang
          } else if (line === '```rs' || line === '```edlang') {
            inCodeBlock = 'rust'
          } else if (line === '```') {
            inCodeBlock = 'plaintext'
          } else {
            return
          }
          isCodeBlockOpenLine = true
        })
      }
      if (isCodeBlockOpenLine) {
        return
      }
      if (line === '```') {
        if (inCodeBlock !== null) {
          const codeHljs = hljs.highlight(currentCodeBlock, { language: inCodeBlock }).value
          mergedLines += `<pre class="multi-line-code-snippet code-snippet">${codeHljs}</pre>`
          currentCodeBlock = ''
          inCodeBlock = null
        } else {
          console.log('WARNING UNEXPECTED ```')
        }
      } else if (inCodeBlock !== null) {
        currentCodeBlock += line + '\n'
      } else {
        mergedLines += line + '\n'
      }
    })
    userinput = mergedLines
    if (inCodeBlock) {
      userinput += '```'
      if (inCodeBlock !== 'plaintext') {
        userinput += inCodeBlock + '\n'
      } else {
        userinput += '\n'
      }
      userinput += currentCodeBlock
    }
  }
  // userinput = userinput.replaceAll(
  //     new RegExp('`(.*)`', 'ig'),
  //     (m, $1) => hljs.highlight($1, {language: 'c'}).value
  // )
  userinput = userinput.replaceAll(
    new RegExp('```(.*)```', 'g'),
    (m, $1) => {
      return `<span class="single-line-code-snippet code-snippet">${hljs.highlightAuto($1).value}</span>`
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
    new RegExp('``(.*)``', 'g'),
    (m, $1) => {
      return codeSnipAnnotater('``', $1)
    }
  )
  userinput = userinput.replaceAll(
    new RegExp('`(.*)`', 'g'),
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
