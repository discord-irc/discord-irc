import BasePlugin from '../base_plugin'
import { getPlugins } from '../plugins'

export const isGithubMp4UrlWithJwt = (url: string): boolean => {
  return false && url
  // return new RegExp("https://private-user-images.githubusercontent.com/[0-9]+/[0-9a-f\-]+\.mp4\\?jwt=[a-zA-Z0-9=/\+\.]+$").test(url)
}

// const assert_eq_str = (actual: string, expected: string, message: string = ''): void => {
//   if (actual !== expected) {
//     console.log(`assert failed ${message}`)
//     console.log(`   actual: ${actual}`)
//     console.log(` expected: ${expected}`)
//     process.exit(1)
//   }
// }

const assert_eq_bool = (actual: boolean, expected: boolean, message: string = ''): void => {
  if (actual !== expected) {
    throw `assert failed ${message}\n` +
          `   actual: ${actual}\n` +
          ` expected: ${expected}`
  }
}

// assert_eq_bool(isGithubMp4UrlWithJwt("https://private-user-images.githubusercontent.com/20344300/315909079-c3bebe56-374d-4fb6-aa89-87f26d927d23.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTEwODk3MjQsIm5iZiI6MTcxMTA4OTQyNCwicGF0aCI6Ii8yMDM0NDMwMC8zMTU5MDkwNzktYzNiZWJlNTYtMzc0ZC00ZmI2LWFhODktODdmMjZkOTI3ZDIzLm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDAzMjIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwMzIyVDA2MzcwNFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTJkYTMwNjU1Mjk3MThhZmY3MzMzNjgyOTIxYWFhNDFhYjg4NDk1ZGQ3NTc3Y2ZlN2Y3ZDVhZjhmYWZiNmFmZmEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.QhfdANYlwhlWsBJue90ogWflKSZjJUF9Z3XfK2IEqSc"), true)
// assert_eq_bool(isGithubMp4UrlWithJwt("https://private-user-images.githubusercontent.com/20344300/315909079-c3bebe56-374d-4fb6-aa89-87f26d927d23.mp4?jwt=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3MTEwODk3MjQsIm5iZiI6MTcxMTA4OTQyNCwicGF0aCI6Ii8yMDM0NDMwMC8zMTU5MDkwNzktYzNiZWJlNTYtMzc0ZC00ZmI2LWFhODktODdmMjZkOTI3ZDIzLm1wND9YLUFtei1BbGdvcml0aG09QVdTNC1ITUFDLVNIQTI1NiZYLUFtei1DcmVkZW50aWFsPUFLSUFWQ09EWUxTQTUzUFFLNFpBJTJGMjAyNDAzMjIlMkZ1cy1lYXN0LTElMkZzMyUyRmF3czRfcmVxdWVzdCZYLUFtei1EYXRlPTIwMjQwMzIyVDA2MzcwNFomWC1BbXotRXhwaXJlcz0zMDAmWC1BbXotU2lnbmF0dXJlPTJkYTMwNjU1Mjk3MThhZmY3MzMzNjgyOTIxYWFhNDFhYjg4NDk1ZGQ3NTc3Y2ZlN2Y3ZDVhZjhmYWZiNmFmZmEmWC1BbXotU2lnbmVkSGVhZGVycz1ob3N0JmFjdG9yX2lkPTAma2V5X2lkPTAmcmVwb19pZD0wIn0.QhfdANYlwhlWsBJue90ogWflKSZjJUF9Z3XfK2IEqSc!!!!!"), false)

class RichTextPlugin extends BasePlugin {
  constructor () {
    super('rich_text')
  }

  onInit (): void {
  }

  onEnrichText (text: string): string {
    return text.replaceAll(
      /(`{1,3})(.*?)(\1)|(https?:\/\/[a-zA-Z0-9\-_[\]?#:&$+*%/.=@]+)/ig,
      (match, _openingBackticks, _closingBackticks, _textInBackticks, url: string | undefined) => {
        if (url === undefined) { return match }

        const isWhitelistedCdn: boolean =
                  url.startsWith('https://scrumplex.rocks/img/') ||
                  url.startsWith('https://zillyhuhn.com/cs/') ||
                  url.startsWith('https://tube.zillyhuhn.com/videos/users/') ||
                  url.startsWith('https://raw.githubusercontent.com/') ||
                  url.startsWith('https://user-images.githubusercontent.com/') ||
                  url.startsWith('https://private-user-images.githubusercontent.com/') ||
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
        //
        // they are now needed otherwise the images don't load ._.
        // if (url.startsWith('https://cdn.discordapp.com/attachments/') || url.startsWith('https://media.discordapp.net/attachments/')) {
        //   url = url.split('?')[0]
        // }

        const isImageUrl: boolean = /\.(png|jpg|jpeg|webp|svg|gif)$/i.test(url)
        const isVideoUrl: boolean = /\.(mp4)$/i.test(url) || isGithubMp4UrlWithJwt(url)

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
        if (pluginUrl !== null) {
          console.log(` plugin: ${pluginUrl}`)
          return pluginUrl
        }
        // console.log(` ahref: <a target="_blank" href="${url}">${url}</a>`)
        return `<a target="_blank" href="${url}">${url}</a>`
      }
    )
  }
}

export default RichTextPlugin

