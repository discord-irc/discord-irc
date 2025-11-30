import { CustomEmotesPluginImplementation, UrlEmote } from '../plugin_implementations'

// TODO: rename this to url emoji provider
//       that implements emoji provider
//       and depends on emoji picker or emoji complete
class CustomEmotesPlugin extends CustomEmotesPluginImplementation {
  customEmotes: UrlEmote[]

  constructor () {
    super('custom_emotes')

    this.customEmotes = [
      {
        name: 'pingsock',
        url: 'https://raw.githubusercontent.com/discord-irc/discord-irc/refs/heads/master/src/img/custom_emotes/pingsock.png'
      },
      {
        name: 'ping-sock-angry',
        url: 'https://raw.githubusercontent.com/discord-irc/discord-irc/refs/heads/master/src/img/custom_emotes/ping-sock-angry.gif'
      }
    ]
  }

  getUrlEmotes () {
    return this.customEmotes
  }

  // yea dont do auto complete for these??
  // just add them to the picker
  // but i think both the picker and the autocomplete do not allow extensions :/

  // onKeydownMessageInput (event: KeyboardEvent, messageInp: HTMLInputElement): void {
  //   autoComplete(':', this.getAllCustomEmoteNames(), event, messageInp, ': ')
  // }
}

export default CustomEmotesPlugin
