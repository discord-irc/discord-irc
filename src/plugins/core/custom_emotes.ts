import { autoComplete } from '../../autocomplete'
import { CustomEmotesPluginImplementation } from '../plugin_implementations'

class CustomEmotesPlugin extends CustomEmotesPluginImplementation {
  constructor () {
    super('custom_emotes')
  }

  getAllCustomEmotes() {
    return [
      'pingsock.png',
      'ping-sock-angry.gif',
    ]
  }

  onKeydownMessageInput(event: KeyboardEvent, messageInp: HTMLInputElement): void {
    autoComplete(':', this.getAllCustomEmotes(), event, messageInp, ': ')
  }
}

export default CustomEmotesPlugin
