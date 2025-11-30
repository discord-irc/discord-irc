import { autoComplete } from '../../autocomplete'
import { getAllEmoteNames } from '../../emotes'
import { EmojiCompletionPluginImplementation } from '../plugin_implementations'

class EmojiTabCompletePlugin extends EmojiCompletionPluginImplementation {
  constructor () {
    super('emoji_tab_complete')
  }

  onKeydownMessageInput (event: KeyboardEvent, messageInp: HTMLInputElement): void {
    autoComplete(':', getAllEmoteNames(), event, messageInp, ': ')
  }
}

export default EmojiTabCompletePlugin
