import { CustomEmotesPluginImplementation } from '../plugin_implementations'

interface CustomEmote {
  name: string
  url: string
}

class CustomEmotesPlugin extends CustomEmotesPluginImplementation {
  customEmotes: Array<CustomEmote>

  constructor () {
    super('custom_emotes')

    this.customEmotes = [
      {
        name: 'pingsock.png',
        url: 'https://raw.githubusercontent.com/discord-irc/discord-irc/refs/heads/master/src/img/custom_emotes/pingsock.png'
      },
      {
        name: 'ping-sock-angry.gif',
        url: 'https://raw.githubusercontent.com/discord-irc/discord-irc/refs/heads/master/src/img/custom_emotes/ping-sock-angry.gif'
      },
    ]
  }

  getAllCustomEmoteNames () {
    return Object.keys(this.customEmotes)
  }

  // yea dont do auto complete for these??
  // just add them to the picker
  // but i think both the picker and the autocomplete do not allow extensions :/

  // onKeydownMessageInput (event: KeyboardEvent, messageInp: HTMLInputElement): void {
  //   autoComplete(':', this.getAllCustomEmoteNames(), event, messageInp, ': ')
  // }
}

export default CustomEmotesPlugin
