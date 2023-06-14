import { getDiscordEmoteNames } from "../../emotes"
import BasePlugin from "../base_plugin"

import '../../css/plugins/emoji_picker.css'

class EmojiPickerPlugin extends BasePlugin {
    emojiListDom: HTMLElement

    constructor() {
        super('emoji_picker')

        this.emojiListDom = document.querySelector('.emoji-picker-list')
    }

    onInit(): void {
        this.renderList()
    }

    onKeydown(_event: KeyboardEvent): void {
    }

    onSwitchChannel(oldServer: string, oldChannel: string, newServer: string, newChannel: string): void {
    }

    onTick(): void {
    }

    renderList(search: string = ''): void {
        this.emojiListDom.innerHTML = ''
        getDiscordEmoteNames().forEach((emojiName) => {
            this.emojiListDom.insertAdjacentHTML(
                'beforeend',
                `<div class="emote emote-${emojiName}"></div>`
            )
        })
    }
}

export default EmojiPickerPlugin
